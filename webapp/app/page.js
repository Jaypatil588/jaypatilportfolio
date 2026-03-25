'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function PublicDashboard() {
  const [tab, setTab] = useState('rankings');
  const [projects, setProjects] = useState([]);
  const [dist, setDist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [p, d] = await Promise.all([
          fetch('/api/public-data?type=projects').then(r => r.json()),
          fetch('/api/public-data?type=distributions').then(r => r.json()),
        ]);
        setProjects(p);
        setDist(d);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  return (
    <div className="app">
      <style>{globalCSS}</style>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">🎯 Jay&apos;s Resume Intel Showcase</div>
        <div className="nav-tabs">
          <button className={`nav-tab ${tab === 'rankings' ? 'active' : ''}`} onClick={() => setTab('rankings')}>🏆 Project Rankings</button>
          <button className={`nav-tab ${tab === 'distributions' ? 'active' : ''}`} onClick={() => setTab('distributions')}>📈 Distributions</button>
          <button className={`nav-tab ${tab === 'analyzer' ? 'active' : ''}`} onClick={() => setTab('analyzer')}>🧠 Resume Analyzer</button>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Link href="/admin" className="nav-tab">Admin Login</Link>
        </div>
      </nav>

      <div className="main-content">
        {loading ? <div className="loading-msg">Loading public data...</div> : (
          <>
            {tab === 'rankings' && <RankingsView projects={projects} />}
            {tab === 'distributions' && <DistributionsView dist={dist} />}
            {tab === 'analyzer' && <AnalyzerView dist={dist} />}
          </>
        )}
      </div>
    </div>
  );
}

// ======== RANKINGS VIEW ========
function RankingsView({ projects }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [sortCol, setSortCol] = useState('rank');
  const [sortDir, setSortDir] = useState('asc');
  const [groupByCompany, setGroupByCompany] = useState(true);

  let filtered = projects.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (p.atsScore < minScore) return false;
    if (search) {
      const h = `${p.name} ${p.company} ${p.techStack?.join(' ')} ${p.concepts?.join(' ')} ${p.description}`.toLowerCase();
      if (!h.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  });

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir(col === 'rank' ? 'asc' : 'desc'); }
  }

  // Top 10
  const top10 = projects.slice(0, 10);

  // Render Rows
  let renderRows = [];
  if (groupByCompany) {
    const grouped = {};
    filtered.forEach(p => { 
      const c = p.company || 'Unknown';
      if (!grouped[c]) grouped[c] = []; 
      grouped[c].push(p); 
    });
    const sortedGroups = Object.entries(grouped).sort((a,b) => {
      const maxA = Math.max(...a[1].map(x => x.atsScore || 0));
      const maxB = Math.max(...b[1].map(x => x.atsScore || 0));
      return maxB - maxA;
    });
    sortedGroups.forEach(([comp, projs]) => {
      renderRows.push(
        <tr key={comp + '-header'} className="group-header">
          <td colSpan="10"><strong>🏢 {comp}</strong> <span className="dim">({projs.length} items)</span></td>
        </tr>
      );
      projs.forEach((p, i) => {
        renderRows.push(
          <tr key={comp + i}>
            <td className={`rank-cell ${p.rank <= 3 ? 'rank-' + p.rank : ''}`}>{p.rank}</td>
            <td className={`score-cell ${p.atsScore >= 20 ? 'score-high' : p.atsScore >= 10 ? 'score-mid' : 'score-low'}`}>{p.atsScore}</td>
            <td className="name-cell">{p.name}</td>
            <td><span className={`type-badge ${p.type === 'Project' ? 'type-project' : 'type-experience'}`}>{p.type}</span></td>
            <td className="mono" style={{ textAlign: 'center' }}>{p.techCount}</td>
            <td><div className="tag-row">{(p.techStack||[]).map((t, j) => <span key={j} className="tech-tag">{t}</span>)}</div></td>
            <td><div className="tag-row">{(p.concepts||[]).map((c, j) => <span key={j} className="concept-tag">{c}</span>)}</div></td>
            <td className="dim" style={{ maxWidth: 280, fontStyle: 'italic', fontSize: '0.73rem' }}>{p.whatItSolves}</td>
            <td className="dim" style={{ maxWidth: 300, fontSize: '0.73rem' }}>{p.description}</td>
          </tr>
        );
      });
    });
  } else {
    renderRows = filtered.map((p, i) => (
      <tr key={i}>
        <td className={`rank-cell ${p.rank <= 3 ? 'rank-' + p.rank : ''}`}>{p.rank}</td>
        <td className={`score-cell ${p.atsScore >= 20 ? 'score-high' : p.atsScore >= 10 ? 'score-mid' : 'score-low'}`}>{p.atsScore}</td>
        <td className="name-cell">{p.name}</td>
        <td><span className={`type-badge ${p.type === 'Project' ? 'type-project' : 'type-experience'}`}>{p.type}</span></td>
        <td className="mono" style={{ textAlign: 'center' }}>{p.techCount}</td>
        <td><div className="tag-row">{(p.techStack||[]).map((t, j) => <span key={j} className="tech-tag">{t}</span>)}</div></td>
        <td><div className="tag-row">{(p.concepts||[]).map((c, j) => <span key={j} className="concept-tag">{c}</span>)}</div></td>
        <td className="dim" style={{ maxWidth: 280, fontStyle: 'italic', fontSize: '0.73rem' }}>{p.whatItSolves}</td>
        <td className="dim" style={{ maxWidth: 300, fontSize: '0.73rem' }}>{p.description}</td>
      </tr>
    ));
  }

  return (
    <>
      <h2 className="page-title">🏆 Project Rankings — Google ATS Score</h2>

      {/* Top 10 Cards */}
      <div className="top10-grid">
        {top10.map((p, i) => (
          <div className="rec-card" key={i}>
            <div className="rec-badge">#{i + 1}</div>
            <div className="rec-name">{p.name}</div>
            <div className="rec-person">@ {p.company}</div>
            <div className="rec-score">ATS Score: {p.atsScore} pts · {p.techCount} technologies</div>
            <div className="tag-row">{(p.concepts||[]).map((c, j) => <span key={j} className="concept-tag">{c}</span>)}</div>
            <div className="rec-why">{p.whatItSolves}</div>
            <div className="tag-row">{(p.techStack||[]).map((t, j) => <span key={j} className="tech-tag">{t}</span>)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginTop: '2rem' }}>
        <input className="filter-input" placeholder="🔍 Search name, tech..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option><option value="Project">Projects</option><option value="Experience">Experience</option>
        </select>
        <select className="filter-select" value={minScore} onChange={e => setMinScore(Number(e.target.value))}>
          <option value={0}>Any Score</option><option value={5}>≥ 5</option><option value={10}>≥ 10</option><option value={15}>≥ 15</option><option value={20}>≥ 20</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e4e4e7', fontSize: '0.8rem', cursor: 'pointer', marginLeft: '1rem' }}>
          <input type="checkbox" checked={groupByCompany} onChange={e => setGroupByCompany(e.target.checked)} />
          Group by Company
        </label>
        <span className="filter-count">Showing {filtered.length} of {projects.length}</span>
      </div>

      {/* Full Table */}
      <div className="card">
        <div className="table-scroll">
          <table style={{ minWidth: 1400 }}>
            <thead><tr>
              {[['rank','Rank'],['atsScore','ATS'],['name','Project / Role'],['type','Type'],['techCount','#Tech']].map(([col, label]) => (
                <th key={col} onClick={() => toggleSort(col)} style={{ cursor: 'pointer' }}>{label}{sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>
              ))}
              <th>Tech Stack</th><th>Concepts</th><th>AI Analysis</th><th>Description</th>
            </tr></thead>
            <tbody>
              {renderRows}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ======== DISTRIBUTIONS VIEW ========
function DistributionsView({ dist }) {
  if (!dist) return <div className="loading-msg">Loading...</div>;
  return (
    <>
      <h2 className="page-title">📈 Distribution Rankings</h2>
      <div className="grid-3">
        <DistPanel title="🔑 Tech Keywords" items={dist.techKeywords||[]} labelKey="keyword" color="purple" extra={k => `×${k.atsWeight}`} />
        <DistPanel title="🧠 Concepts" items={dist.concepts||[]} labelKey="concept" color="cyan" />
        <DistPanel title="🏢 Pre-Google Companies" items={dist.companies||[]} labelKey="company" color="green" />
      </div>
    </>
  );
}

function DistPanel({ title, items, labelKey, color, extra }) {
  const max = items[0]?.count || 1;
  return (
    <div className="card dist-panel">
      <h3 className="card-title">{title} <span className="cnt">({items.length})</span></h3>
      <div className="dist-scroll">
        {items.map((k, i) => (
          <div className="dist-item" key={i}>
            <span className="dist-rank">{k.rank}</span>
            <span className="dist-label">{k[labelKey]}</span>
            <div className="dist-bar-wrap">
              <div className={`dist-bar ${color}`} style={{ width: `${(k.count / max) * 100}%` }}>{k.count}</div>
            </div>
            {extra && <span className="dist-extra">{extra(k)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ======== RESUME ANALYZER VIEW ========
function AnalyzerView({ dist }) {
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef(null);

  const ATS = {
    'python':5,'java':5,'c++':5,'golang':4,'javascript':3,'typescript':3,'rust':3,'scala':2,'kotlin':2,'swift':2,
    'distributed systems':8,'microservices':5,'kubernetes':5,'docker':4,'grpc':6,'protocol buffers':6,
    'google cloud':5,'gcp':5,'bigquery':4,
    'machine learning':7,'deep learning':6,'tensorflow':7,'pytorch':5,'transformers':6,'bert':6,'nlp':5,
    'natural language processing':5,'computer vision':5,
    'sql':3,'nosql':3,'api':2,'rest api':3,'graphql':3,'redis':3,'mongodb':2,'postgresql':3,'firebase':3,'spark':4,'kafka':4,
    'algorithms':6,'data structures':6,'operating systems':4,'compilers':5,'networking':3,
    'react':2,'angular':2,'vue':2,'node.js':2,'flask':2,'django':2,'spring':3,
    'aws':3,'azure':2,'ci/cd':3,'terraform':3,'linux':3,
    'android':3,'ios':2,'react native':2,'flutter':2,
  };

  async function handleFile(file) {
    setAnalyzing(true);
    let text = '';
    if (file.name.endsWith('.pdf')) {
      if (!window.pdfjsLib) {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        document.head.appendChild(s);
        await new Promise(r => { s.onload = r; });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      const ab = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it => it.str).join(' ') + '\\n';
      }
    } else {
      text = await file.text();
    }
    analyze(text);
  }

  function analyze(text) {
    const lower = text.toLowerCase();
    const found = {}, missing = {};
    for (const [kw, w] of Object.entries(ATS)) {
      if (kw.length <= 3) {
        const re = new RegExp(`(?:^|[\\s,;()\\[\\]|/])${kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:$|[\\s,;()\\[\\]|/])`, 'i');
        re.test(lower) ? found[kw] = w : missing[kw] = w;
      } else {
        lower.includes(kw) ? found[kw] = w : missing[kw] = w;
      }
    }
    const foundScore = Object.values(found).reduce((a, b) => a + b, 0);
    const totalScore = Object.values(ATS).reduce((a, b) => a + b, 0);
    const pct = Math.round((foundScore / totalScore) * 100);

    const CONCEPTS = [
      { p: /distribut|shard|consensus|raft/i, c: 'Distributed Systems' },
      { p: /machine learn|deep learn|neural/i, c: 'Machine Learning' },
      { p: /nlp|natural language|sentiment/i, c: 'NLP' },
      { p: /computer vision|image.*recogni/i, c: 'Computer Vision' },
      { p: /web.*app|full.*stack|frontend|backend/i, c: 'Full-Stack Dev' },
      { p: /api|rest|microservice/i, c: 'API / Microservices' },
      { p: /mobile|android|ios.*app/i, c: 'Mobile Dev' },
      { p: /data.*pipeline|etl/i, c: 'Data Engineering' },
      { p: /security|encrypt|auth|oauth/i, c: 'Security' },
      { p: /cloud|aws|gcp|azure|docker|kubernet/i, c: 'Cloud / DevOps' },
      { p: /database|sql|nosql|mongo|redis/i, c: 'Databases' },
      { p: /algorithm|data structure/i, c: 'Algorithms & DS' },
      { p: /test|ci.*cd|pipeline|deploy/i, c: 'Testing / CI-CD' },
      { p: /optimi|performance|latency|scale/i, c: 'Performance' },
    ];
    const userC = CONCEPTS.filter(({ p }) => p.test(lower)).map(({ c }) => c);
    const allC = CONCEPTS.map(({ c }) => c);

    const recs = [];
    if (!found['distributed systems'] && !found['microservices']) recs.push('Build a <strong>distributed systems project</strong> — #1 concept among Google SDEs.');
    if (!found['machine learning'] && !found['tensorflow'] && !found['pytorch']) recs.push('Add an <strong>ML project</strong> with TensorFlow/PyTorch.');
    if (!found['docker'] && !found['kubernetes'] && !found['ci/cd']) recs.push('<strong>Containerize</strong> your projects with Docker + CI/CD.');
    if (!found['grpc'] && !found['protocol buffers']) recs.push("Use <strong>gRPC + Protocol Buffers</strong> — Google's backbone tech (×6 weight).");
    if (!found['golang'] && !found['c++'] && !found['java']) recs.push('Learn <strong>Java, C++, or Go</strong> — top 3 languages at Google.');
    if (!found['sql'] && !found['postgresql']) recs.push('Mention <strong>SQL/database experience</strong> explicitly.');
    if (!found['algorithms'] && !found['data structures']) recs.push('Highlight <strong>algorithms & data structures</strong> work.');
    recs.push('<strong>Quantify your impact</strong> — "reduced latency 40%", "served 10K users".');

    setResult({ found, missing, pct, foundScore, totalScore, userC, allC, recs });
    setAnalyzing(false);
  }

  return (
    <>
      <h2 className="page-title">🧠 Resume Analyzer</h2>
      <div className="upload-zone" onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
        <div style={{ fontSize: '2.5rem' }}>📄</div>
        <div style={{ fontWeight: 600 }}>Drop your resume or click to upload</div>
        <div className="dim" style={{ fontSize: '0.8rem', marginTop: 4 }}>PDF, TXT, or MD</div>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md" style={{ display: 'none' }}
          onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
      </div>
      {analyzing && <div className="loading-msg">Analyzing...</div>}
      {result && (
        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
          <div className="card">
            <h3 className="card-title">🎯 ATS Match: <span style={{ color: result.pct >= 60 ? '#22c55e' : result.pct >= 35 ? '#f59e0b' : '#ef4444' }}>{result.pct}%</span></h3>
            <p className="dim">{Object.keys(result.found).length} of {Object.keys(ATS).length} keywords · {result.foundScore}/{result.totalScore} pts</p>
            <h4 style={{ marginTop: 12, fontSize: '0.85rem' }}>✅ Found ({Object.keys(result.found).length})</h4>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {Object.entries(result.found).sort((a, b) => b[1] - a[1]).map(([k, w]) => (
                <div className="gap-item" key={k}><span>✅</span><span className="gap-kw">{k}</span><span className="gap-found">×{w}</span></div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">❌ Missing ({Object.keys(result.missing).length})</h3>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {Object.entries(result.missing).sort((a, b) => b[1] - a[1]).map(([k, w]) => (
                <div className="gap-item" key={k}><span>❌</span><span className="gap-kw">{k}</span>
                  <span className="dim" style={{ flex: 1, fontSize: '0.7rem' }}>Used by {dist?.techKeywords?.find(t => t.keyword === k)?.count || 0} SDEs</span>
                  <span className="gap-missing">×{w}</span></div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">🧠 Concept Coverage</h3>
            {result.allC.map(c => {
              const has = result.userC.includes(c);
              return <div className="gap-item" key={c}><span>{has ? '✅' : '❌'}</span><span className="gap-kw">{c}</span><span className={has ? 'gap-found' : 'gap-missing'}>{has ? 'Found' : 'Missing'}</span></div>;
            })}
          </div>
          <div className="card">
            <h3 className="card-title">💡 Recommendations</h3>
            <ul style={{ listStyle: 'none' }}>
              {result.recs.map((r, i) => (
                <li key={i} className="rec-bullet"><span className="rec-num">{i + 1}.</span><span className="dim" dangerouslySetInnerHTML={{ __html: r }} /></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

// ======== GLOBAL CSS ========
const globalCSS = `
@keyframes spin { to { transform: rotate(360deg); } }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Inter',sans-serif; background:#07070b; color:#e4e4e7; }
.app { min-height:100vh; }

/* Navbar */
.navbar { background:#0a0a12; border-bottom:1px solid #1a1a28; display:flex; align-items:center; padding:0 1.5rem; height:52px; position:sticky; top:0; z-index:100; }
.nav-brand { font-weight:800; font-size:1rem; margin-right:2rem; background:linear-gradient(135deg,#fff,#a5b4fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.nav-tabs { display:flex; gap:4px; }
.nav-tab { background:none; border:none; color:#71717a; padding:8px 14px; border-radius:8px; font-size:0.8rem; font-weight:500; cursor:pointer; transition:all 0.2s; font-family:inherit; text-decoration:none; }
.nav-tab:hover { color:#e4e4e7; background:rgba(255,255,255,0.03); }
.nav-tab.active { color:#818cf8; background:rgba(99,102,241,0.1); }

.main-content { max-width:1600px; margin:0 auto; padding:1.5rem; }
.page-title { font-size:1.4rem; font-weight:800; margin-bottom:1.5rem; }
.dim { color:#71717a; }

/* Cards */
.card { background:#0f0f16; border:1px solid #1a1a28; border-radius:14px; padding:1.25rem; }
.card:hover { border-color:rgba(99,102,241,0.2); }
.card-title { font-size:0.9rem; font-weight:700; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem; }
.grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
.grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.5rem; }

/* Tables */
.table-wrap { overflow-x:auto; }
.table-scroll { max-height:80vh; overflow:auto; }
table { width:100%; border-collapse:collapse; }
th { background:#12121c; padding:8px 12px; text-align:left; font-size:0.7rem; font-weight:700; color:#71717a; text-transform:uppercase; border-bottom:2px solid #1a1a28; position:sticky; top:0; z-index:5; }
td { padding:8px 12px; font-size:0.78rem; border-bottom:1px solid rgba(255,255,255,0.02); vertical-align:top; }
tr:hover { background:rgba(99,102,241,0.04); }
.group-header { background: rgba(99,102,241,0.08); font-size:0.85rem; padding: 10px; border-bottom: 2px solid rgba(99,102,241,0.2); }

/* Rankings */
.rank-cell { font-family:'JetBrains Mono',monospace; font-weight:700; font-size:0.75rem; color:#71717a; text-align:center; }
.rank-1 { color:#fbbf24; } .rank-2 { color:#d1d5db; } .rank-3 { color:#cd7f32; }
.score-cell { font-family:'JetBrains Mono',monospace; font-weight:700; text-align:center; }
.score-high { color:#22c55e; } .score-mid { color:#f59e0b; } .score-low { color:#71717a; }
.name-cell { font-weight:600; max-width:250px; line-height:1.4; }
.person-cell { color:#71717a; font-size:0.75rem; white-space:nowrap; }
.type-badge { font-size:0.6rem; font-weight:600; padding:2px 6px; border-radius:4px; }
.type-project { background:rgba(99,102,241,0.15); color:#818cf8; }
.type-experience { background:rgba(34,197,94,0.15); color:#22c55e; }

/* Tags */
.tag-row { display:flex; flex-wrap:wrap; gap:3px; }
.tech-tag { background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2); color:#818cf8; padding:1px 7px; border-radius:999px; font-size:0.65rem; font-weight:500; }
.concept-tag { background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.25); color:#06b6d4; padding:1px 7px; border-radius:999px; font-size:0.65rem; font-weight:500; }

/* Top 10 */
.top10-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1rem; }
.rec-card { background:#0f0f16; border:1px solid #1a1a28; border-radius:14px; padding:1.25rem; position:relative; overflow:hidden; transition:all 0.3s; }
.rec-card:hover { border-color:#6366f1; transform:translateY(-2px); box-shadow:0 8px 32px rgba(99,102,241,0.1); }
.rec-badge { position:absolute; top:0; right:0; background:linear-gradient(135deg,#6366f1,#06b6d4); color:#fff; font-size:0.65rem; font-weight:800; padding:4px 12px 4px 16px; border-radius:0 14px 0 12px; }
.rec-name { font-weight:700; font-size:0.95rem; margin-bottom:2px; padding-right:60px; }
.rec-person { font-size:0.75rem; color:#71717a; margin-bottom:8px; }
.rec-score { font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:#22c55e; margin-bottom:6px; }
.rec-why { font-size:0.78rem; color:#71717a; line-height:1.5; margin-bottom:8px; }

/* Filters */
.filter-bar { display:flex; gap:0.75rem; margin-bottom:1rem; flex-wrap:wrap; align-items:center; }
.filter-input { background:#12121c; border:1px solid #1a1a28; color:#e4e4e7; padding:8px 14px; border-radius:8px; font-size:0.85rem; width:300px; outline:none; }
.filter-input:focus { border-color:#6366f1; }
.filter-select { background:#12121c; border:1px solid #1a1a28; color:#e4e4e7; padding:8px 12px; border-radius:8px; font-size:0.8rem; outline:none; cursor:pointer; }
.filter-count { font-size:0.8rem; color:#71717a; margin-left:auto; }

/* Distributions */
.dist-panel { max-height:520px; display:flex; flex-direction:column; }
.dist-scroll { flex:1; overflow-y:auto; }
.dist-scroll::-webkit-scrollbar { width:4px; }
.dist-scroll::-webkit-scrollbar-thumb { background:#1a1a28; border-radius:2px; }
.dist-item { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.02); }
.dist-rank { font-family:'JetBrains Mono',monospace; font-size:0.65rem; color:#52525b; width:22px; text-align:right; flex-shrink:0; }
.dist-label { font-size:0.78rem; font-weight:500; width:130px; flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dist-bar-wrap { flex:1; height:18px; background:rgba(255,255,255,0.02); border-radius:4px; overflow:hidden; }
.dist-bar { height:100%; border-radius:4px; display:flex; align-items:center; justify-content:flex-end; padding-right:6px; font-size:0.6rem; font-weight:700; color:#fff; transition:width 0.8s ease; }
.dist-bar.purple { background:linear-gradient(90deg,#6366f1,#818cf8); }
.dist-bar.cyan { background:linear-gradient(90deg,#0891b2,#06b6d4); }
.dist-bar.green { background:linear-gradient(90deg,#15803d,#22c55e); }
.dist-extra { font-family:'JetBrains Mono',monospace; font-size:0.6rem; color:#52525b; width:40px; text-align:right; flex-shrink:0; }

/* Upload / Analyzer */
.upload-zone { border:2px dashed #1a1a28; border-radius:14px; padding:2.5rem; text-align:center; cursor:pointer; transition:all 0.3s; background:#0f0f16; }
.upload-zone:hover { border-color:#6366f1; background:rgba(99,102,241,0.04); }
.gap-item { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.02); font-size:0.8rem; }
.gap-kw { font-weight:600; width:140px; flex-shrink:0; }
.gap-found { font-family:'JetBrains Mono',monospace; font-size:0.65rem; font-weight:700; padding:2px 6px; border-radius:4px; background:rgba(34,197,94,0.15); color:#22c55e; }
.gap-missing { font-family:'JetBrains Mono',monospace; font-size:0.65rem; font-weight:700; padding:2px 6px; border-radius:4px; background:rgba(239,68,68,0.15); color:#ef4444; }
.rec-bullet { padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.02); font-size:0.8rem; line-height:1.5; display:flex; gap:8px; }
.rec-bullet strong { color:#e4e4e7; }
.rec-num { font-family:'JetBrains Mono',monospace; font-size:0.65rem; font-weight:800; color:#818cf8; width:20px; flex-shrink:0; }
.loading-msg { padding:2rem; text-align:center; color:#818cf8; font-weight:600; }
`;
