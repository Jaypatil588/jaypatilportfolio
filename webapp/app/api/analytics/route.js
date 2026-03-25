import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-me');

async function getUser(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

function normalizeProjects(rows) {
  if (!rows?.length) return [];

  // Legacy shape: single row with `data` = full array
  if (rows.length === 1 && Array.isArray(rows[0].data)) {
    return rows[0].data;
  }

  // New shape: one row per project with metadata columns
  const mapped = rows.map((row) => {
    const item = row.data && typeof row.data === 'object' ? row.data : {};
    return {
      ...item,
      project_id: row.project_id || item.project_id || null,
      company: row.company || item.company || null,
    };
  });

  return mapped.sort((a, b) => {
    const ar = Number(a.rank ?? Number.MAX_SAFE_INTEGER);
    const br = Number(b.rank ?? Number.MAX_SAFE_INTEGER);
    return ar - br;
  });
}

function normalizeDistributions(rows) {
  if (!rows?.length) return {};

  // Legacy shape: single row with `data` = { concepts, companies, techKeywords }
  if (rows.length === 1 && rows[0].data && !rows[0].dist_type) {
    return rows[0].data;
  }

  // New shape: one row per distribution item + `dist_type`
  const grouped = {
    concepts: [],
    companies: [],
    techKeywords: [],
  };

  for (const row of rows) {
    const key = row.dist_type;
    if (!key) continue;
    if (!grouped[key]) grouped[key] = [];
    if (row.data && typeof row.data === 'object') {
      grouped[key].push(row.data);
    }
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => {
      const ar = Number(a.rank ?? Number.MAX_SAFE_INTEGER);
      const br = Number(b.rank ?? Number.MAX_SAFE_INTEGER);
      return ar - br;
    });
  }

  return grouped;
}

export async function GET(request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = neon(process.env.DATABASE_URL);
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'overview';

  try {
    if (type === 'overview') {
      const totalVisits = await sql`SELECT COUNT(*) as count FROM visits WHERE user_id = ${user.userId}`;
      const today = await sql`SELECT COUNT(*) as count FROM visits WHERE user_id = ${user.userId} AND timestamp > NOW() - INTERVAL '24 hours'`;
      const uniqueVisitors = await sql`SELECT COUNT(DISTINCT ip_hash) as count FROM visits WHERE user_id = ${user.userId}`;
      const byRefTag = await sql`SELECT ref_tag, COUNT(*) as count FROM visits WHERE user_id = ${user.userId} GROUP BY ref_tag ORDER BY count DESC`;
      const byDevice = await sql`SELECT device_type, COUNT(*) as count FROM visits WHERE user_id = ${user.userId} GROUP BY device_type ORDER BY count DESC`;
      const recent = await sql`SELECT * FROM visits WHERE user_id = ${user.userId} ORDER BY timestamp DESC LIMIT 50`;
      const byDay = await sql`SELECT DATE(timestamp) as day, COUNT(*) as count FROM visits WHERE user_id = ${user.userId} AND timestamp > NOW() - INTERVAL '30 days' GROUP BY DATE(timestamp) ORDER BY day`;

      return NextResponse.json({
        totalVisits: totalVisits[0]?.count || 0,
        todayVisits: today[0]?.count || 0,
        uniqueVisitors: uniqueVisitors[0]?.count || 0,
        byRefTag,
        byDevice,
        recent,
        byDay,
      });
    }

    if (type === 'projects') {
      const rows = await sql`
        SELECT data, project_id, company, created_at
        FROM projects_data
        WHERE user_id = ${user.userId}
        ORDER BY id DESC
      `;
      return NextResponse.json(normalizeProjects(rows));
    }

    if (type === 'distributions') {
      const rows = await sql`
        SELECT data, dist_type, company, created_at
        FROM distributions_data
        WHERE user_id = ${user.userId}
        ORDER BY id DESC
      `;
      return NextResponse.json(normalizeDistributions(rows));
    }

    if (type === 'chatlogs') {
      const logs = await sql`SELECT * FROM chat_logs WHERE user_id = ${user.userId} ORDER BY timestamp DESC LIMIT 100`;
      return NextResponse.json(logs);
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
