import { NextRequest, NextResponse } from 'next/server'

function levelFromCount(count: number, maxCount: number): number {
  if (count <= 0 || maxCount <= 0) return 0
  return Math.min(Math.max(Math.ceil((count / maxCount) * 4), 1), 4)
}

function buildRollingDays(from: string, to: string, counts: Map<string, number>) {
  const days: Array<{ date: string; count: number; level: number }> = []
  const start = new Date(`${from}T00:00:00Z`)
  const end = new Date(`${to}T00:00:00Z`)
  let maxCount = 0

  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10)
    const count = counts.get(date) ?? 0
    if (count > maxCount) maxCount = count
    days.push({ date, count, level: 0 })
  }

  return days.map((day) => ({
    ...day,
    level: levelFromCount(day.count, maxCount),
  }))
}

function getLastYearRange() {
  const toDate = new Date()
  const fromDate = new Date(toDate)
  fromDate.setDate(toDate.getDate() - 364)

  return {
    from: fromDate.toISOString().slice(0, 10),
    to: toDate.toISOString().slice(0, 10),
  }
}

export async function GET(request: NextRequest) {
  const username =
    request.nextUrl.searchParams.get('username')?.trim() || process.env.LEETCODE_USERNAME || 'jaypatil588'

  const query = {
    query: `
      query userCalendar($username: String!) {
        matchedUser(username: $username) {
          username
          userCalendar {
            totalActiveDays
            submissionCalendar
          }
        }
      }
    `,
    variables: { username },
  }

  const { from, to } = getLastYearRange()

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: `https://leetcode.com/${username}/`,
      },
      body: JSON.stringify(query),
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to load LeetCode data.' }, { status: response.status })
    }

    const payload = await response.json()
    const user = payload?.data?.matchedUser

    if (!user?.userCalendar?.submissionCalendar) {
      return NextResponse.json(
        { error: 'LeetCode user not found or calendar unavailable.' },
        { status: 404 }
      )
    }

    const calendar = JSON.parse(user.userCalendar.submissionCalendar) as Record<string, number>
    const countsByDate = new Map<string, number>()

    for (const [timestamp, count] of Object.entries(calendar)) {
      const date = new Date(Number(timestamp) * 1000)
      const isoDate = date.toISOString().slice(0, 10)
      if (isoDate >= from && isoDate <= to) {
        countsByDate.set(isoDate, count)
      }
    }

    const heatmap = buildRollingDays(from, to, countsByDate)
    const totalSubmissions = heatmap.reduce((sum, day) => sum + day.count, 0)

    return NextResponse.json(
      {
        username,
        range: { from, to },
        profileUrl: `https://leetcode.com/${username}/`,
        totalSubmissions,
        totalActiveDays: user.userCalendar.totalActiveDays,
        heatmap,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch {
    return NextResponse.json({ error: 'Unexpected error while loading LeetCode data.' }, { status: 500 })
  }
}
