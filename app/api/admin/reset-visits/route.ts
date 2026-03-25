import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { neon } from '@neondatabase/serverless'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const isAuthed = cookieStore.get('portfolio_admin_auth')?.value === '1'
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL missing' }, { status: 500 })
    }

    const sql = neon(dbUrl)
    await sql`DELETE FROM visits WHERE user_id = 1`

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reset visits failed:', error)
    return NextResponse.json({ error: 'Failed to reset visits' }, { status: 500 })
  }
}

