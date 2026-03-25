import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
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

export async function POST(request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { username, password } = await request.json();
    if (!username || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid username or password (min 6 chars)' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    await sql`INSERT INTO users (username, password_hash) VALUES (${username}, ${hash})`;

    return NextResponse.json({ ok: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
