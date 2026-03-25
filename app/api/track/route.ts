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
    const durationSec = Number(url.searchParams.get('duration') || '0')
    const referer = request.headers.get('referer')
    const userAgent = request.headers.get('user-agent') || ''
    const forwardedFor = request.headers.get('x-forwarded-for') || ''
    const realIp = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || ''
    const country = request.headers.get('x-vercel-ip-country')
    const region = request.headers.get('x-vercel-ip-country-region')
    const city = request.headers.get('x-vercel-ip-city')

    const ipHash = realIp
      ? createHash('sha256').update(realIp).digest('hex')
      : null

    // Schema upgrades for richer tracking data.
    await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS region VARCHAR(100)`
    await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS city VARCHAR(100)`
    await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS time_on_page_seconds INTEGER DEFAULT 0`
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS visits_user_ip_unique
      ON visits (user_id, ip_hash)
      WHERE ip_hash IS NOT NULL
    `

    const safeDuration = Number.isFinite(durationSec) && durationSec > 0 ? Math.round(durationSec) : 0

    const deviceType = detectDeviceType(userAgent)

    if (ipHash) {
      await sql`
        INSERT INTO visits (
          user_id, ip_hash, user_agent, referer, ref_tag, page_url, country, region, city, device_type, time_on_page_seconds
        )
        VALUES (
          1,
          ${ipHash},
          ${userAgent || null},
          ${referer || null},
          ${refTag},
          ${pageUrl},
          ${country || null},
          ${region || null},
          ${city || null},
          ${deviceType},
          ${safeDuration}
        )
        ON CONFLICT (user_id, ip_hash) DO UPDATE
        SET
          timestamp = NOW(),
          user_agent = COALESCE(EXCLUDED.user_agent, visits.user_agent),
          referer = COALESCE(EXCLUDED.referer, visits.referer),
          ref_tag = COALESCE(EXCLUDED.ref_tag, visits.ref_tag),
          page_url = COALESCE(EXCLUDED.page_url, visits.page_url),
          country = COALESCE(EXCLUDED.country, visits.country),
          region = COALESCE(EXCLUDED.region, visits.region),
          city = COALESCE(EXCLUDED.city, visits.city),
          device_type = COALESCE(EXCLUDED.device_type, visits.device_type),
          time_on_page_seconds = COALESCE(visits.time_on_page_seconds, 0) + ${safeDuration}
      `
    } else {
      // If IP isn't available, fall back to plain insert.
      await sql`
        INSERT INTO visits (
          user_id, ip_hash, user_agent, referer, ref_tag, page_url, country, region, city, device_type, time_on_page_seconds
        )
        VALUES (
          1,
          NULL,
          ${userAgent || null},
          ${referer || null},
          ${refTag},
          ${pageUrl},
          ${country || null},
          ${region || null},
          ${city || null},
          ${deviceType},
          ${safeDuration}
        )
      `
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Track API error:', error)
    return new NextResponse(null, { status: 204 })
  }
}
