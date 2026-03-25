const { neon } = require('@neondatabase/serverless');

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

async function initDb() {
  const sql = getDb();

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

  // Backfill columns for pre-existing databases
  await sql`ALTER TABLE projects_data ADD COLUMN IF NOT EXISTS project_id TEXT`;
  await sql`ALTER TABLE projects_data ADD COLUMN IF NOT EXISTS company TEXT`;
  await sql`ALTER TABLE distributions_data ADD COLUMN IF NOT EXISTS company TEXT`;
  await sql`ALTER TABLE distributions_data ADD COLUMN IF NOT EXISTS dist_type TEXT`;

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

  return sql;
}

module.exports = { getDb, initDb };
