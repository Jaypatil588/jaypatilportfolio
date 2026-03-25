const fs = require('fs');
const path = require('path');

// --- Tech keyword list ---
const TECH_KEYWORDS = [
    // Languages
    'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'golang', 'rust', 'ruby',
    'swift', 'kotlin', 'scala', 'php', 'perl', 'matlab', 'lua', 'dart', 'objective-c',
    'bash', 'shell', 'sql', 'nosql', 'html', 'html5', 'css', 'css3', 'scss',
    // Frontend
    'react', 'react.js', 'reactjs', 'angular', 'angularjs', 'vue', 'vue.js', 'vuejs',
    'next.js', 'nextjs', 'svelte', 'material design', 'bootstrap',
    'tailwind', 'jquery', 'redux', 'webpack', 'vite',
    // Backend
    'node.js', 'nodejs', 'express', 'express.js', 'fastify', 'django', 'flask', 'spring',
    'spring boot', 'laravel', 'rails', 'ruby on rails', 'asp.net', '.net', 'graphql', 'rest api',
    'rest apis', 'grpc', 'protocol buffers', 'protobuf',
    // ML/AI
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
    'opencv', 'nlp', 'natural language processing', 'computer vision', 'transformers',
    'bert', 'gpt', 'roberta', 'onnx', 'hugging face',
    // Data
    'pandas', 'numpy', 'spark', 'hadoop', 'kafka', 'airflow', 'bigquery', 'big query',
    'elasticsearch', 'redis', 'mongodb', 'postgresql', 'mysql', 'mssql', 'dynamodb',
    'firebase', 'cassandra', 'sqlite',
    // Cloud & Infra
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'docker', 'kubernetes', 'k8s',
    'terraform', 'jenkins', 'ci/cd', 'github actions', 'gitlab', 'vercel', 'netlify',
    // Systems
    'linux', 'unix', 'distributed systems', 'microservices', 'data structures', 'algorithms',
    'operating systems', 'compilers', 'networking',
    // Mobile
    'android', 'ios', 'react native', 'flutter',
    // Other
    'git', 'agile', 'scrum', 'jira', 'figma', 'auth0', 'oauth', 'websocket',
    'blockchain', 'web3', 'api', 'aes', 'encryption'
];

function detectTech(text) {
    if (!text) return [];
    const lower = text.toLowerCase();
    const found = new Set();
    for (const kw of TECH_KEYWORDS) {
        // Use word boundary matching for short keywords to avoid false positives
        if (kw.length <= 3) {
            const regex = new RegExp(`(?:^|[\\s,;()\\[\\]|/])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[\\s,;()\\[\\]|/])`, 'i');
            if (regex.test(lower)) found.add(kw);
        } else {
            if (lower.includes(kw)) found.add(kw);
        }
    }
    return [...found].sort();
}

function parseResume(content, filename) {
    const lines = content.split('\n');
    
    // Get person name from first heading
    let personName = 'Unknown';
    const h1Match = content.match(/^#\s+(.+)/m);
    if (h1Match) personName = h1Match[1].trim();

    // Parse sections
    const sections = {};
    let currentSection = null;
    let currentLines = [];

    for (const line of lines) {
        const sectionMatch = line.match(/^##\s+(.+)/);
        if (sectionMatch) {
            if (currentSection) {
                sections[currentSection.toLowerCase()] = currentLines.join('\n').trim();
            }
            currentSection = sectionMatch[1].trim();
            currentLines = [];
        } else if (currentSection) {
            currentLines.push(line);
        }
    }
    if (currentSection) {
        sections[currentSection.toLowerCase()] = currentLines.join('\n').trim();
    }

    // Parse experience entries
    const experienceEntries = [];
    const expText = sections['experience'] || '';
    if (expText && expText !== 'Not listed' && expText !== 'Not listed.') {
        // Split by patterns that look like role/company headers
        const expLines = expText.split('\n').filter(l => l.trim());
        let currentEntry = null;
        
        for (const line of expLines) {
            const trimmed = line.trim();
            // Detect company lines (contain · or common patterns)
            if (trimmed.includes('·') && (trimmed.includes('Full-time') || trimmed.includes('Internship') || trimmed.includes('Part-time') || trimmed.includes('Contract'))) {
                const parts = trimmed.split('·').map(p => p.trim());
                if (currentEntry) experienceEntries.push(currentEntry);
                currentEntry = { company: parts[0], role: '', type: parts[1] || '', description: '', rawLines: [] };
            } else if (currentEntry) {
                currentEntry.rawLines.push(trimmed);
            } else {
                // This might be a role title before the company line
                if (currentEntry === null) {
                    currentEntry = { company: '', role: trimmed, type: '', description: '', rawLines: [] };
                }
            }
        }
        if (currentEntry) experienceEntries.push(currentEntry);

        // Post-process: combine raw lines into description, detect tech
        for (const entry of experienceEntries) {
            entry.description = entry.rawLines.join(' ');
            entry.techStack = detectTech(entry.description + ' ' + entry.role + ' ' + entry.company);
            delete entry.rawLines;
        }
    }

    // Parse project entries
    const projectEntries = [];
    const projText = sections['projects'] || '';
    if (projText && projText !== 'Not listed' && projText !== 'Not listed.') {
        const projLines = projText.split('\n').filter(l => l.trim());
        let currentProj = null;

        for (const line of projLines) {
            const trimmed = line.trim();
            // Date patterns often indicate a new project boundary
            const dateMatch = trimmed.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i);
            const isDateRange = trimmed.match(/^\d{4}\s*[–-]\s*(Present|\d{4})/i) || trimmed.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*[–-]/i);
            
            if (isDateRange && currentProj) {
                currentProj.date = trimmed;
            } else if (trimmed === 'Show project' || trimmed === '… more' || trimmed === 'Other contributors' || trimmed === 'View all contributors') {
                continue;
            } else if (!isDateRange && trimmed.length > 3 && trimmed.length < 100 && !trimmed.startsWith('Associated with') && !trimmed.startsWith('•') && !trimmed.startsWith('-') && currentProj === null) {
                currentProj = { name: trimmed, description: '', rawLines: [] };
            } else if (!isDateRange && trimmed.length > 3 && trimmed.length < 100 && !trimmed.startsWith('Associated with') && !trimmed.startsWith('•') && !trimmed.startsWith('-') && currentProj && currentProj.rawLines.length > 0 && !trimmed.match(/^\d/)) {
                // Might be a new project name
                projectEntries.push(currentProj);
                currentProj = { name: trimmed, description: '', rawLines: [] };
            } else if (currentProj) {
                currentProj.rawLines.push(trimmed);
            }
        }
        if (currentProj) projectEntries.push(currentProj);

        for (const proj of projectEntries) {
            proj.description = proj.rawLines.join(' ');
            proj.techStack = detectTech(proj.name + ' ' + proj.description);
            delete proj.rawLines;
            delete proj.date;
        }
    }

    return {
        person: personName,
        file: filename,
        experience: experienceEntries,
        projects: projectEntries
    };
}

// --- Main ---
const resumeDir = './resumes';
const files = fs.readdirSync(resumeDir).filter(f => f.endsWith('.md'));

// Deduplicate by person name (keep the file with most content)
const byPerson = {};
for (const file of files) {
    const content = fs.readFileSync(path.join(resumeDir, file), 'utf-8');
    const h1Match = content.match(/^#\s+(.+)/m);
    const name = h1Match ? h1Match[1].trim().toLowerCase() : file;
    
    if (!byPerson[name] || content.length > byPerson[name].content.length) {
        byPerson[name] = { file, content };
    }
}

console.log(`Found ${files.length} files, ${Object.keys(byPerson).length} unique people.`);

const results = [];
for (const [name, { file, content }] of Object.entries(byPerson)) {
    const parsed = parseResume(content, file);
    if (parsed.experience.length > 0 || parsed.projects.length > 0) {
        results.push(parsed);
    }
}

fs.writeFileSync('./projects_techstack.json', JSON.stringify(results, null, 2));
console.log(`Extracted data for ${results.length} people with projects/experience.`);

// --- Keyword Frequency Ranking ---
const kwFreq = {};
for (const person of results) {
    const allTech = new Set();
    for (const exp of person.experience) {
        for (const t of exp.techStack) allTech.add(t);
    }
    for (const proj of person.projects) {
        for (const t of proj.techStack) allTech.add(t);
    }
    for (const t of allTech) {
        kwFreq[t] = (kwFreq[t] || 0) + 1;
    }
}

const ranked = Object.entries(kwFreq).sort((a, b) => b[1] - a[1]);
console.log('\n=== TECH STACK KEYWORD RANKING (by # of people) ===');
console.log('Rank | Keyword | People Count');
console.log('-----|---------|-------------');
ranked.forEach(([kw, count], i) => {
    console.log(`${String(i + 1).padStart(4)} | ${kw.padEnd(25)} | ${count}`);
});

// Save ranking too
const rankingOutput = ranked.map(([keyword, count], i) => ({ rank: i + 1, keyword, peopleCount: count }));
fs.writeFileSync('./tech_ranking.json', JSON.stringify(rankingOutput, null, 2));
console.log('\nSaved tech_ranking.json');
