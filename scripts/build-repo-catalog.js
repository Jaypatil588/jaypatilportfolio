#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const OWNER = process.env.GITHUB_OWNER || "Jaypatil588";
const API_BASE = "https://api.github.com";
const OUTPUT_DIR = path.join(process.cwd(), "public", "projects", "repos");
const IMAGE_DIR = path.join(OUTPUT_DIR, "images");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "repositories.json");
const CONCURRENCY = 4;
const DESCRIPTION_OVERRIDES = {
  PulseFi:
    "PulseFi is a hardware-first heartbeat and human-presence detection system that uses ESP32 Wi-Fi CSI streams plus MAX30105 ground-truth BPM. It runs a two-stage ML pipeline (presence classification + BPM regression) with live serial inference, firmware TX/RX modules, and a Python dashboard for real-time signal-driven vitals estimation.",
  "CC-Agents-Simulation":
    "CC-Agents-Simulation is a virtual world where AI characters talk to each other and those conversations automatically build a story. In short: agent chats are the input, and a story engine is the output. Architecture: Convex stores world state and events, agent conversations trigger story updates, and a React/Pixi frontend shows both the live world and the evolving narrative timeline.",
};

async function main() {
  const token = await getGitHubToken();
  await fs.mkdir(IMAGE_DIR, { recursive: true });

  const repositories = await fetchOwnedRepositories(token);
  repositories.sort((a, b) => a.name.localeCompare(b.name));

  const entries = await mapWithConcurrency(repositories, CONCURRENCY, async (repo, index) => {
    console.log(`[${index + 1}/${repositories.length}] ${repo.full_name}`);
    return buildEntry(repo, token);
  });

  const payload = {
    owner: OWNER,
    generated_at: new Date().toISOString(),
    repository_count: entries.length,
    repositories: entries,
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${OUTPUT_FILE}`);
}

async function buildEntry(repo, token) {
  const [readme, commitMessages] = await Promise.all([
    fetchReadme(repo.full_name, token),
    fetchCommitMessages(repo.full_name, token),
  ]);

  const description = describeRepo(repo, readme, commitMessages);
  const picture = await writeImage(repo.name, description);

  return {
    project_name: repo.name,
    picture,
    description,
    commit_messages: commitMessages,
    metadata: {
      full_name: repo.full_name,
      private: Boolean(repo.private),
      default_branch: repo.default_branch || null,
      github_url: repo.html_url,
      homepage: repo.homepage || null,
      repo_description: repo.description || "",
    },
  };
}

function describeRepo(repo, readme, commitMessages) {
  if (DESCRIPTION_OVERRIDES[repo.name]) {
    return DESCRIPTION_OVERRIDES[repo.name];
  }

  const repoDescription = cleanSentence(repo.description || "");
  if (repoDescription && !isLowSignal(repoDescription)) {
    return repoDescription;
  }

  const readmeParagraph = firstUsefulParagraph(readme);
  if (readmeParagraph) {
    return cleanSentence(readmeParagraph);
  }

  const signal = [repo.name, repo.description || "", readme, commitMessages.slice(0, 80).join(" ")].join(" ").toLowerCase();
  const type = inferType(signal);
  const tech = inferTech(signal);
  const activity = inferActivity(commitMessages);

  let sentence = startsWithArticle(type) ? type : `a ${type}`;
  if (tech.length) {
    sentence += ` built with ${joinList(tech)}`;
  }
  sentence += ".";
  if (activity) {
    sentence += ` Recent commits focus on ${activity}.`;
  }

  return cleanSentence(sentence);
}

function inferType(text) {
  if (/(portfolio|showcase|personal site)/.test(text)) return "a personal portfolio site";
  if (/(job|internship|resume|cover letter|auto-apply|application workflow)/.test(text)) return "a job-application automation project";
  if (/(chatbot|assistant|llm|agent|bot|ai chat)/.test(text)) return "an AI assistant application";
  if (/(leetcode|interview)/.test(text) && /(tool|counter|sort|company|archive|problem)/.test(text)) return "a technical interview tooling project";
  if (/(knowledge base|handbook|guide|research|documentation|docs)/.test(text)) return "a knowledge base and reference project";
  if (/(sports|score|stats|analytics)/.test(text)) return "a sports stats application";
  if (/(book club|books|reading club)/.test(text)) return "a book club application";
  if (/(covid|corona|pandemic)/.test(text)) return "a COVID-19 awareness application";
  if (/(mqtt|messaging)/.test(text)) return "an MQTT messaging framework";
  if (/(music|musical note|audio detection|matlab)/.test(text)) return "a musical note detection project";
  if (/(civilization|simulation|simulator)/.test(text)) return "a simulation project";
  if (/(market|mart|store|shop|commerce)/.test(text)) return "a commerce application";
  if (/(scrape|crawler|extract|parse)/.test(text)) return "a data collection and scraping tool";
  if (/(hackathon)/.test(text)) return "a hackathon project";
  return "a software project";
}

function inferTech(text) {
  const patterns = [
    [/next\.?js|nextjs/, "Next.js"],
    [/\breact\b|vite/, "React"],
    [/\bflask\b/, "Flask"],
    [/\bflutter\b/, "Flutter"],
    [/\bn8n\b/, "n8n"],
    [/\bpython\b|pip3 install/, "Python"],
    [/\btypescript\b/, "TypeScript"],
    [/\bnode\b|\bnpm\b/, "Node.js"],
    [/\bjava\b/, "Java"],
    [/\bmatlab\b/, "MATLAB"],
  ];

  return patterns.filter(([pattern]) => pattern.test(text)).map(([, label]) => label).slice(0, 3);
}

function inferActivity(commitMessages) {
  const text = commitMessages.join(" ").toLowerCase();
  const hits = [];
  if (/(auth|login|register|oauth|session)/.test(text)) hits.push("authentication flows");
  if (/(dashboard|analytics|metrics|chart|graph)/.test(text)) hits.push("dashboard and analytics work");
  if (/(scrape|crawler|extract|parse)/.test(text)) hits.push("scraping and extraction");
  if (/(chat|llm|agent|bot|assistant|prompt)/.test(text)) hits.push("AI and chat features");
  if (/(ui|ux|design|layout|style|responsive)/.test(text)) hits.push("UI refinements");
  if (/(api|endpoint|route|backend|server)/.test(text)) hits.push("API and backend changes");
  if (/(bug|fix|issue|patch)/.test(text)) hits.push("bug fixes and stability");
  return hits.slice(0, 2).join(" and ");
}

async function writeImage(name, description) {
  const slug = slugify(name);
  const relativePath = `images/${slug}.svg`;
  const outputPath = path.join(IMAGE_DIR, `${slug}.svg`);
  const palette = paletteFor(`${name}:${description}`);
  const motif = motifFor(description.toLowerCase());

  const svg = `
  <svg width="320" height="192" viewBox="0 0 320 192" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette[0]}"/>
        <stop offset="100%" stop-color="${palette[1]}"/>
      </linearGradient>
      <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.16)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.04)"/>
      </linearGradient>
    </defs>
    <rect width="320" height="192" rx="24" fill="url(#bg)"/>
    <path d="M0 138C55 116 102 112 154 124C198 134 248 132 320 104V192H0Z" fill="${palette[2]}" fill-opacity="0.16"/>
    <path d="M0 160C65 142 120 140 182 150C236 159 281 159 320 146V192H0Z" fill="${palette[3]}" fill-opacity="0.15"/>
    <rect x="14" y="14" width="292" height="164" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
    <rect x="20" y="22" width="94" height="94" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
    <g transform="translate(30 34) scale(0.42)">${motif}</g>
    <rect x="124" y="26" width="170" height="58" rx="14" fill="rgba(255,255,255,0.06)"/>
    <rect x="132" y="36" width="116" height="10" rx="5" fill="rgba(240,251,255,0.82)"/>
    <rect x="132" y="52" width="148" height="10" rx="5" fill="rgba(219,242,255,0.56)"/>
    <rect x="20" y="126" width="274" height="42" rx="14" fill="rgba(7,14,32,0.18)"/>
    <rect x="28" y="135" width="126" height="8" rx="4" fill="rgba(240,251,255,0.78)"/>
    <rect x="28" y="149" width="164" height="8" rx="4" fill="rgba(219,242,255,0.54)"/>
    <circle cx="278" cy="147" r="7" fill="rgba(240,251,255,0.85)"/>
  </svg>`;

  await fs.writeFile(outputPath, svg);
  return relativePath;
}

function motifFor(text) {
  if (/(chat|bot|llm|agent|assistant|ai)/.test(text)) {
    return `
      <rect x="46" y="34" width="160" height="132" rx="40" fill="#F8FAFC" fill-opacity="0.12" stroke="#F8FAFC" stroke-width="8"/>
      <circle cx="102" cy="98" r="11" fill="#F8FAFC"/>
      <circle cx="150" cy="98" r="11" fill="#F8FAFC"/>
      <path d="M96 136C109 145 143 145 156 136" stroke="#F8FAFC" stroke-width="8" stroke-linecap="round"/>
      <path d="M126 34V6" stroke="#F8FAFC" stroke-width="8" stroke-linecap="round"/>
      <circle cx="126" cy="0" r="10" fill="${paletteFor(text)[2]}"/>
      <path d="M78 172L60 198M174 172L192 198" stroke="#F8FAFC" stroke-width="8" stroke-linecap="round"/>
    `;
  }
  if (/(dashboard|analytics|stats|chart|metrics|sports)/.test(text)) {
    return `
      <rect x="8" y="12" width="220" height="156" rx="28" fill="#F8FAFC" fill-opacity="0.12" stroke="#F8FAFC" stroke-width="8"/>
      <path d="M38 132L78 94L118 108L176 56" stroke="#F8FAFC" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="38" cy="132" r="8" fill="#F8FAFC"/>
      <circle cx="78" cy="94" r="8" fill="#F8FAFC"/>
      <circle cx="118" cy="108" r="8" fill="#F8FAFC"/>
      <circle cx="176" cy="56" r="8" fill="#F8FAFC"/>
      <rect x="42" y="72" width="20" height="56" rx="10" fill="#F8FAFC" fill-opacity="0.34"/>
      <rect x="80" y="84" width="20" height="44" rx="10" fill="#F8FAFC" fill-opacity="0.48"/>
      <rect x="118" y="64" width="20" height="64" rx="10" fill="#F8FAFC" fill-opacity="0.62"/>
    `;
  }
  if (/(workflow|automation|pipeline|apply|scrap|crawl|extract)/.test(text)) {
    return `
      <rect x="8" y="28" width="72" height="54" rx="18" fill="#F8FAFC" fill-opacity="0.12" stroke="#F8FAFC" stroke-width="8"/>
      <rect x="156" y="12" width="72" height="54" rx="18" fill="#F8FAFC" fill-opacity="0.12" stroke="#F8FAFC" stroke-width="8"/>
      <rect x="82" y="118" width="72" height="54" rx="18" fill="#F8FAFC" fill-opacity="0.12" stroke="#F8FAFC" stroke-width="8"/>
      <path d="M80 55H140M194 66V102M118 118V92" stroke="#F8FAFC" stroke-width="8" stroke-linecap="round"/>
      <path d="M132 47L142 55L132 63M186 92L194 102L202 92M110 100L118 92L126 100" stroke="#F8FAFC" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }
  if (/(book|knowledge|guide|handbook|research|interview)/.test(text)) {
    return `
      <path d="M22 10C22 2 29 0 38 0H182C191 0 198 2 198 10V176C198 184 191 186 182 186H38C29 186 22 184 22 176V10Z" fill="#F8FAFC" fill-opacity="0.11" stroke="#F8FAFC" stroke-width="8"/>
      <path d="M108 0V186" stroke="#F8FAFC" stroke-opacity="0.28" stroke-width="6"/>
      <rect x="44" y="34" width="40" height="10" rx="5" fill="#F8FAFC" fill-opacity="0.72"/>
      <rect x="44" y="58" width="52" height="10" rx="5" fill="#F8FAFC" fill-opacity="0.4"/>
      <rect x="126" y="34" width="36" height="10" rx="5" fill="#F8FAFC" fill-opacity="0.72"/>
      <rect x="126" y="58" width="28" height="10" rx="5" fill="#F8FAFC" fill-opacity="0.4"/>
    `;
  }
  return `
    <rect x="8" y="12" width="220" height="156" rx="28" fill="#F8FAFC" fill-opacity="0.1" stroke="#F8FAFC" stroke-width="8"/>
    <path d="M38 132L86 92L128 110L178 64" stroke="#F8FAFC" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="38" cy="132" r="8" fill="#F8FAFC"/>
    <circle cx="86" cy="92" r="8" fill="#F8FAFC"/>
    <circle cx="128" cy="110" r="8" fill="#F8FAFC"/>
    <circle cx="178" cy="64" r="8" fill="#F8FAFC"/>
  `;
}

function wrapLines(text, maxChars, maxLines) {
  const words = cleanSentence(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  if (!lines.length) {
    lines.push(cleanSentence(text));
  }

  const consumedWords = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (consumedWords < words.length) {
    const last = lines[lines.length - 1] || "";
    lines[lines.length - 1] = truncate(last, Math.max(maxChars - 1, 8));
    if (!lines[lines.length - 1].endsWith("…")) {
      lines[lines.length - 1] = truncate(`${lines[lines.length - 1]}…`, maxChars);
    }
  }

  return lines.slice(0, maxLines).map(escapeXml);
}

function renderLines(lines, options) {
  const { x, startY, lineHeight, size, weight, color } = options;
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${startY + index * lineHeight}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}">${line}</text>`,
    )
    .join("");
}

async function fetchOwnedRepositories(token) {
  const repos = [];
  for (let page = 1; ; page += 1) {
    const batch = await githubRequest(`/user/repos?visibility=all&affiliation=owner&per_page=100&page=${page}`, token);
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch.filter((repo) => repo.owner && repo.owner.login === OWNER));
    if (batch.length < 100) break;
  }
  return repos;
}

async function fetchReadme(fullName, token) {
  try {
    const response = await fetch(`${API_BASE}/repos/${fullName}/readme`, {
      headers: headers(token, { Accept: "application/vnd.github.raw+json" }),
    });
    if (response.status === 404) return "";
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return stripMarkdown(await response.text());
  } catch {
    return "";
  }
}

async function fetchCommitMessages(fullName, token) {
  const messages = [];
  for (let page = 1; ; page += 1) {
    try {
      const commits = await githubRequest(`/repos/${fullName}/commits?per_page=100&page=${page}`, token);
      if (!Array.isArray(commits) || commits.length === 0) break;
      for (const commit of commits) {
        const message = commit?.commit?.message;
        if (message) messages.push(cleanSentence(message));
      }
      if (commits.length < 100) break;
    } catch {
      break;
    }
  }
  return messages;
}

async function githubRequest(route, token) {
  const response = await fetch(`${API_BASE}${route}`, { headers: headers(token) });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function headers(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    "User-Agent": "repo-catalog-builder",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...extra,
  };
}

async function getGitHubToken() {
  const { stdout } = await execFileAsync("gh", ["auth", "token"]);
  return stdout.trim();
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const current = next;
      next += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function firstUsefulParagraph(readme) {
  const paragraphs = String(readme)
    .split(/\n{2,}/)
    .map((part) => cleanSentence(part))
    .filter(Boolean);

  return paragraphs.find((paragraph) => paragraph.length >= 25 && paragraph.length <= 180 && !isLowSignal(paragraph)) || "";
}

function isLowSignal(text) {
  return [
    /getting started/i,
    /bootstrapped with/i,
    /environment variables/i,
    /npm run/i,
    /pip3 install/i,
    /localhost/i,
    /vercel\.json/i,
    /serverless function/i,
    /^todo\b/i,
    /openai_api_key/i,
    /^create\b/i,
    /^update\b/i,
    /^add\b/i,
    /^copy\b/i,
    /^import\b/i,
    /^deploy\b/i,
    /^push\b/i,
    /^go to\b/i,
    /^open\b/i,
    /const response =/i,
    /fetch\('/i,
    /^homework\b/i,
    /^run\b/i,
    /^backend\b/i,
    /^frontend\b/i,
  ].some((pattern) => pattern.test(text));
}

function stripMarkdown(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, "\n")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]+]\(([^)]+)\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[_*~|]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanSentence(text) {
  return truncate(
    String(text || "")
      .replace(/\s+/g, " ")
      .replace(/\s+([.,!?;:])/g, "$1")
      .trim(),
    180,
  );
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function startsWithArticle(text) {
  return /^(a|an)\b/i.test(text);
}

function joinList(values) {
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(value);
}

function paletteFor(text) {
  const palettes = [
    ["#06245A", "#1292E7", "#63C8FF", "#BFEFFF"],
    ["#0A2A66", "#1477D6", "#6FCFFF", "#C8F0FF"],
    ["#0B2E6E", "#1D88DE", "#78D8FF", "#D3F4FF"],
    ["#082A64", "#1A7ED4", "#73D3FF", "#CBEFFF"],
    ["#08306B", "#0FA0EA", "#7CD8FF", "#D8F5FF"],
  ];
  return palettes[hash(text) % palettes.length];
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
