import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function normalizeProjectsSanitized(rows) {
  if (!rows?.length) return [];

  // Legacy shape: single row with `data` = full array
  if (rows.length === 1 && Array.isArray(rows[0].data)) {
    return rows[0].data.map(item => {
      const copy = { ...item };
      delete copy.person; // SANITIZE
      return copy;
    });
  }

  // New shape: one row per project with metadata columns
  const mapped = rows.map((row) => {
    const item = row.data && typeof row.data === 'object' ? row.data : {};
    const cleanItem = { ...item };
    delete cleanItem.person; // SANITIZE

    return {
      ...cleanItem,
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
  // NO AUTH REQUIRED
  const sql = neon(process.env.DATABASE_URL);
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'projects';

  try {
    if (type === 'projects') {
      const rows = await sql`
        SELECT data, project_id, company, created_at
        FROM projects_data
        ORDER BY id DESC
      `;
      // We return all projects, but could filter by 'user_id = 1' if needed.
      return NextResponse.json(normalizeProjectsSanitized(rows));
    }

    if (type === 'distributions') {
      const rows = await sql`
        SELECT data, dist_type, company, created_at
        FROM distributions_data
        ORDER BY id DESC
      `;
      return NextResponse.json(normalizeDistributions(rows));
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Public API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
