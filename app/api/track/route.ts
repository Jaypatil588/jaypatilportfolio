import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { createHash } from 'crypto'

function detectDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile'
  if (/ipad|tablet/.test(ua)) return 'tablet'
  return 'desktop'
}

function normalizeGeoValue(value: string | null) {
  if (!value) return null
  try {
    return decodeURIComponent(value.replace(/\+/g, ' ')).trim()
  } catch {
    return value.trim()
  }
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
    const country = normalizeGeoValue(request.headers.get('x-vercel-ip-country'))
    const region = normalizeGeoValue(request.headers.get('x-vercel-ip-country-region'))
    const city = normalizeGeoValue(request.headers.get('x-vercel-ip-city'))

    const ipHash = realIp
      ? createHash('sha256').update(realIp).digest('hex')
      : null

    // Schema upgrades for richer tracking data.
    await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS region VARCHAR(100)`
    await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS city VARCHAR(100)`
    await sql`ALTER TABLE visits ADD COLUMN IF NOT EXISTS time_on_page_seconds INTEGER DEFAULT 0`
    const safeDuration = Number.isFinite(durationSec) && durationSec > 0 ? Math.round(durationSec) : 0

    const deviceType = detectDeviceType(userAgent)

    if (ipHash) {
      // Update latest known row for this IP; if none exists, insert a new row.
      const updated = await sql`
        UPDATE visits
        SET
          timestamp = NOW(),
          user_agent = COALESCE(${userAgent || null}, user_agent),
          referer = COALESCE(${referer || null}, referer),
          ref_tag = COALESCE(${refTag || null}, ref_tag),
          page_url = COALESCE(${pageUrl || null}, page_url),
          country = COALESCE(${country || null}, country),
          region = COALESCE(${region || null}, region),
          city = COALESCE(${city || null}, city),
          device_type = COALESCE(${deviceType}, device_type),
          time_on_page_seconds = COALESCE(time_on_page_seconds, 0) + ${safeDuration}
        WHERE id = (
          SELECT id
          FROM visits
          WHERE user_id = 1 AND ip_hash = ${ipHash}
          ORDER BY timestamp DESC
          LIMIT 1
        )
        RETURNING id
      `

      if (updated.length === 0) {
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
        `
      }
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
