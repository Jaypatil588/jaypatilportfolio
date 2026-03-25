import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const url = new URL(request.url);
    const refTag = url.searchParams.get('ref') || 'direct';
    const ua = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ipHash = createHash('sha256').update(ip).digest('hex').substring(0, 16);

    // Detect device type
    let deviceType = 'desktop';
    if (/mobile|android|iphone/i.test(ua)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

    // Get default user (user "j")
    const users = await sql`SELECT id FROM users WHERE username = 'jay' LIMIT 1`;
    const userId = users.length > 0 ? users[0].id : null;

    if (userId) {
      await sql`INSERT INTO visits (user_id, ip_hash, user_agent, referer, ref_tag, page_url, device_type)
        VALUES (${userId}, ${ipHash}, ${ua}, ${referer}, ${refTag}, ${url.searchParams.get('page') || '/'}, ${deviceType})`;
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json({ ok: true });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
