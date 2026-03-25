import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROOT_GATE_COOKIE = 'root_access_gate'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Visiting root grants short-lived access to auth/admin routes.
  if (pathname === '/') {
    const response = NextResponse.next()
    response.cookies.set(ROOT_GATE_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 30, // 30 minutes
    })
    return response
  }

  // Auth/Admin pages are reachable only after root is visited.
  if (pathname.startsWith('/auth') || pathname.startsWith('/admin')) {
    const hasRootGate = request.cookies.get(ROOT_GATE_COOKIE)?.value === '1'
    if (!hasRootGate) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/auth/:path*', '/admin/:path*'],
}

