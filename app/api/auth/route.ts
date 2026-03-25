import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const passcode = typeof body?.passcode === 'string' ? body.passcode : ''
    const expected = process.env.ADMIN_ACCESS_CODE || process.env.ADMIN_PASSWORD || 'F0rtN!te'

    if (!passcode || passcode !== expected) {
      return NextResponse.json({ ok: false, error: 'Invalid passcode' }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set('portfolio_admin_auth', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return response
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}

