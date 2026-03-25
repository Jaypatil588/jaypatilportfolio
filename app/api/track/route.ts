import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { createHash } from 'crypto'

function detectDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile'
  if (/ipad|tablet/.test(ua)) return 'tablet'
  return 'desktop'
}

export async function GET(request: Request) {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return new NextResponse(null, { status: 204 })

    const sql = neon(dbUrl)
    const url = new URL(request.url)

    const refTag = url.searchParams.get('ref') || 'direct'
    const pageUrl = url.searchParams.get('page') || '/'
    const referer = request.headers.get('referer')
    const userAgent = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for') || ''
    const realIp = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''

    const ipHash = realIp
      ? createHash('sha256').update(realIp).digest('hex')
      : null

    await sql`
      INSERT INTO visits (user_id, ip_hash, user_agent, referer, ref_tag, page_url, country, device_type)
      VALUES (1, ${ipHash}, ${userAgent || null}, ${referer || null}, ${refTag}, ${pageUrl}, ${null}, ${detectDeviceType(userAgent)})
    `

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Track API error:', error)
    return new NextResponse(null, { status: 204 })
  }
}

