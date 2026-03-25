import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret } = body;
    if (secret !== process.env.SEED_SECRET && secret !== 'initial-seed-2026') {
      return NextResponse.json({ error: 'Bad secret' }, { status: 403 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Create tables
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS projects_data (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      data JSONB NOT NULL,
      project_id TEXT UNIQUE,
      company TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS distributions_data (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      data JSONB NOT NULL,
      company TEXT,
      dist_type TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      timestamp TIMESTAMP DEFAULT NOW(),
      ip_hash VARCHAR(64),
      user_agent TEXT,
      referer TEXT,
      ref_tag VARCHAR(50),
      page_url TEXT,
      country VARCHAR(100),
      device_type VARCHAR(50)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS chat_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      timestamp TIMESTAMP DEFAULT NOW(),
      referer TEXT,
      message TEXT,
      response TEXT
    )`;

    // Create user jay
    const hash = await bcrypt.hash('F0rtN!te', 10);
    await sql`INSERT INTO users (username, password_hash) VALUES ('jay', ${hash}) ON CONFLICT (username) DO NOTHING`;

    const users = await sql`SELECT id FROM users WHERE username = 'jay'`;
    const userId = users[0].id;

    // Backfill columns for pre-existing databases
    await sql`ALTER TABLE projects_data ADD COLUMN IF NOT EXISTS project_id TEXT`;
    await sql`ALTER TABLE projects_data ADD COLUMN IF NOT EXISTS company TEXT`;
    await sql`ALTER TABLE distributions_data ADD COLUMN IF NOT EXISTS company TEXT`;
    await sql`ALTER TABLE distributions_data ADD COLUMN IF NOT EXISTS dist_type TEXT`;

    // Seed project data if provided in body
    if (body.projects) {
      await sql`DELETE FROM projects_data WHERE user_id = ${userId}`;
      const projects = Array.isArray(body.projects) ? body.projects : [];
      for (let i = 0; i < projects.length; i += 1) {
        const item = projects[i];
        const rankPart = Number(item?.rank) || i + 1;
        const projectId = `P${String(userId).padStart(3, '0')}-${String(rankPart).padStart(4, '0')}`;
        await sql`
          INSERT INTO projects_data (user_id, data, project_id, company)
          VALUES (${userId}, ${JSON.stringify(item)}, ${projectId}, 'Google')
        `;
      }
    }
    if (body.distributions) {
      await sql`DELETE FROM distributions_data WHERE user_id = ${userId}`;
      const dist = body.distributions && typeof body.distributions === 'object' ? body.distributions : {};
      for (const [distType, items] of Object.entries(dist)) {
        if (!Array.isArray(items)) continue;
        for (const item of items) {
          await sql`
            INSERT INTO distributions_data (user_id, data, company, dist_type)
            VALUES (${userId}, ${JSON.stringify(item)}, 'Google', ${distType})
          `;
        }
      }
    }

    return NextResponse.json({ ok: true, message: 'Database seeded successfully', userId });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
