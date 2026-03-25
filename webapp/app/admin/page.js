'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('analytics');
  const [data, setData] = useState(null);

  async function handleLogin(e) {
    if(e) e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (res.ok) { setAuthed(true); loadAll(); }
      else setError(json.error || 'Login failed');
    } catch { setError('Network error'); }
    setLoading(false);
  }

  // Auto check if already logged in by attempting a fetch
  useEffect(() => {
    fetch('/api/analytics?type=overview')
      .then(r => r.ok && r.json().then(j => { setData({ overview: j }); setAuthed(true); }))
      .catch(() => {});
  }, []);

  async function loadAll() {
    try {
      const overview = await fetch('/api/analytics?type=overview').then(r => r.json());
      setData({ overview });
    } catch (e) { console.error(e); }
  }

  // ======== LOGIN SCREEN ========
  if (!authed) {
    return (
      <div className="login-wrap">
        <style>{globalCSS}</style>
        <form onSubmit={handleLogin} className="login-box">
          <div className="lock-icon">🔒</div>
          <h2 className="login-title">Admin Access</h2>
          <p className="login-sub">Enter credentials to view analytics</p>
          {error && <div className="error-msg">{error}</div>}
          <input className="login-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          <input className="login-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="login-btn" disabled={loading}>{loading ? 'Verifying...' : 'Login'}</button>
          
          <div style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
            <Link href="/" className="dim hover-white" style={{ textDecoration: 'none' }}>← Back to Public Showcase</Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{globalCSS}</style>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">🎯 Resume Intel Admin</div>
        <div className="nav-tabs">
          <button className={`nav-tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>📊 Visitor Analytics</button>
          <button className={`nav-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Manage Users</button>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Link href="/" className="nav-tab">View Public Showcase</Link>
        </div>
      </nav>

      <div className="main-content">
        {tab === 'analytics' && <AnalyticsView data={data} />}
        {tab === 'users' && <UsersView />}
      </div>
    </div>
  );
}

// ======== ANALYTICS VIEW ========
function AnalyticsView({ data }) {
  if (!data || !data.overview) return <div className="loading-msg">Loading analytics...</div>;
  const { overview } = data;
  return (
    <>
      <h2 className="page-title">📊 Visitor Analytics</h2>
      <div className="metric-grid">
        <MetricCard val={overview.totalVisits} label="Total Visits" />
        <MetricCard val={overview.todayVisits} label="Today" />
        <MetricCard val={overview.uniqueVisitors} label="Unique Visitors" />
        <MetricCard val={overview.byRefTag?.length || 0} label="Traffic Sources" />
      </div>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">🔗 <span className="hl">Traffic Sources</span></h3>
          {overview.byRefTag?.length > 0 ? overview.byRefTag.map((r, i) => {
            const max = overview.byRefTag[0]?.count || 1;
            return <BarRow key={i} label={r.ref_tag} value={r.count} max={max} color="purple" tag />;
          }) : <p className="empty">No visits yet. Share your portfolio link!</p>}
        </div>
        <div className="card">
          <h3 className="card-title">📱 <span className="hl">Devices</span></h3>
          {overview.byDevice?.length > 0 ? overview.byDevice.map((d, i) => {
            const max = overview.byDevice[0]?.count || 1;
            return <BarRow key={i} label={d.device_type} value={d.count} max={max} color="cyan" />;
          }) : <p className="empty">No device data yet.</p>}
        </div>
      </div>
      {overview.byDay?.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className="card-title">📈 <span className="hl">Daily Visits</span> (30 Days)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, padding: '0 4px' }}>
            {overview.byDay.map((d, i) => {
              const max = Math.max(...overview.byDay.map(x => x.count));
              return <div key={i} title={`${d.day}: ${d.count}`} style={{
                flex: 1, background: 'linear-gradient(180deg,#6366f1,#4338ca)', borderRadius: '3px 3px 0 0',
                minWidth: 8, height: `${Math.max((d.count / max) * 100, 4)}%`
              }} />;
            })}
          </div>
        </div>
      )}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">🕐 <span className="hl">Recent Visits</span></h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Source</th><th>Device</th><th>Referer</th><th>IP Hash</th></tr></thead>
            <tbody>
              {overview.recent?.length > 0 ? overview.recent.map((v, i) => (
                <tr key={i}>
                  <td>{new Date(v.timestamp).toLocaleString()}</td>
                  <td><span className={`ref-tag ref-${v.ref_tag === 'post' ? 'post' : v.ref_tag === 'featured' ? 'featured' : 'direct'}`}>{v.ref_tag}</span></td>
                  <td>{v.device_type}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.referer || '-'}</td>
                  <td className="mono">{v.ip_hash}</td>
                </tr>
              )) : <tr><td colSpan={5} style={{ textAlign: 'center', color: '#71717a' }}>No visits yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="card-title">📋 <span className="hl">Tracking Snippet</span></h3>
        <p className="empty" style={{ marginBottom: 8 }}>Add this to your portfolio. Use <code style={{ color: '#818cf8' }}>?ref=post</code> for LinkedIn posts, <code style={{ color: '#818cf8' }}>?ref=featured</code> for featured.</p>
        <pre className="code-block">{`<script>\n(function(){\n  var r = new URLSearchParams(location.search).get('ref') || 'direct';\n  new Image().src = '${typeof window !== 'undefined' ? window.location.origin : ''}/api/track?ref=' + r;\n})();\n</script>`}</pre>
      </div>
    </>
  );
}

// ======== USERS VIEW ========
function UsersView() {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true); setMessage(''); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('User account created successfully!');
        setNewUsername('');
        setNewPassword('');
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <>
      <h2 className="page-title">👥 Manage Users</h2>
      <div className="card" style={{ maxWidth: 500 }}>
        <h3 className="card-title">Create New Admin Account</h3>
        <p className="dim" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Allow another user to log into this admin dashboard.</p>
        
        {message && <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{message}</div>}
        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Username</label>
            <input className="login-input" style={{ marginBottom: 0 }} value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Password (min 6 chars)</label>
            <input className="login-input" type="password" style={{ marginBottom: 0 }} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="login-btn" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
      </div>
    </>
  );
}

// ======== SHARED COMPONENTS ========
function MetricCard({ val, label }) {
  return <div className="metric-card"><div className="metric-val">{val}</div><div className="metric-lbl">{label}</div></div>;
}

function BarRow({ label, value, max, color, tag }) {
  return (
    <div className="bar-row">
      {tag ? <span className={`ref-tag ref-${label}`}>{label}</span> : <span className="bar-label">{label}</span>}
      <div className="bar-bg">
        <div className={`bar-fill ${color}`} style={{ width: `${(value / max) * 100}%` }}>{value}</div>
      </div>
    </div>
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
.hl { color:#818cf8; }
.mono { font-family:'JetBrains Mono',monospace; font-size:0.7rem; }
.dim { color:#71717a; }
.empty { color:#71717a; font-size:0.85rem; }
.hover-white:hover { color: #fff; }

/* Login */
.login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#07070b; }
.login-box { background:#0f0f16; border:1px solid #1a1a28; border-radius:16px; padding:2.5rem; width:360px; text-align:center; }
.lock-icon { font-size:2.5rem; margin-bottom:0.5rem; }
.login-title { font-size:1.3rem; font-weight:800; color:#e4e4e7; }
.login-sub { font-size:0.85rem; color:#71717a; margin-bottom:1.5rem; }
.error-msg { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#ef4444; padding:8px 12px; border-radius:8px; font-size:0.8rem; margin-bottom:1rem; }
.login-input { width:100%; background:#12121c; border:1px solid #1a1a28; color:#e4e4e7; padding:10px 14px; border-radius:8px; font-size:0.9rem; margin-bottom:0.75rem; outline:none; }
.login-btn { width:100%; background:linear-gradient(135deg,#6366f1,#4338ca); color:#fff; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer; margin-top:0.5rem; font-size:0.9rem; }

/* Cards */
.card { background:#0f0f16; border:1px solid #1a1a28; border-radius:14px; padding:1.25rem; }
.card:hover { border-color:rgba(99,102,241,0.2); }
.card-title { font-size:0.9rem; font-weight:700; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem; }
.metric-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem; margin-bottom:1.5rem; }
.metric-card { background:#0f0f16; border:1px solid #1a1a28; border-radius:12px; padding:1.25rem; text-align:center; }
.metric-val { font-family:'JetBrains Mono',monospace; font-size:2rem; font-weight:800; color:#818cf8; }
.metric-lbl { font-size:0.8rem; color:#71717a; margin-top:4px; }
.grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
@media(max-width:900px) { .grid-2,.metric-grid { grid-template-columns:1fr; } .nav-tabs { flex-wrap:wrap; } }

/* Bars */
.bar-row { display:flex; align-items:center; gap:8px; padding:4px 0; }
.bar-label { width:100px; font-size:0.8rem; font-weight:500; }
.bar-bg { flex:1; height:22px; background:rgba(255,255,255,0.02); border-radius:4px; overflow:hidden; }
.bar-fill { height:100%; border-radius:4px; display:flex; align-items:center; justify-content:flex-end; padding-right:8px; font-size:0.65rem; font-weight:700; color:#fff; transition:width 0.8s ease; }
.bar-fill.purple { background:linear-gradient(90deg,#6366f1,#818cf8); }
.bar-fill.cyan { background:linear-gradient(90deg,#0891b2,#06b6d4); }

/* Ref tags */
.ref-tag { display:inline-block; padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:600; }
.ref-post { background:rgba(34,197,94,0.15); color:#22c55e; }
.ref-featured { background:rgba(99,102,241,0.15); color:#818cf8; }
.ref-direct { background:rgba(245,158,11,0.15); color:#f59e0b; }

/* Tables */
.table-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; }
th { background:#12121c; padding:8px 12px; text-align:left; font-size:0.7rem; font-weight:700; color:#71717a; text-transform:uppercase; border-bottom:2px solid #1a1a28; position:sticky; top:0; z-index:5; }
td { padding:8px 12px; font-size:0.78rem; border-bottom:1px solid rgba(255,255,255,0.02); vertical-align:top; }
tr:hover { background:rgba(99,102,241,0.04); }

.code-block { background:#0a0a0f; border:1px solid #1a1a28; border-radius:8px; padding:1rem; font-size:0.75rem; color:#22c55e; overflow:auto; font-family:'JetBrains Mono',monospace; white-space:pre; }
`;
