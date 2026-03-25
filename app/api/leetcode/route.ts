import { NextRequest, NextResponse } from 'next/server'

function levelFromCount(count: number): number {
  if (count === 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function buildYearDays(year: number, counts: Map<string, number>) {
  const days: Array<{ date: string; count: number; level: number }> = []
  const start = new Date(Date.UTC(year, 0, 1))
  const end = new Date(Date.UTC(year, 11, 31))

  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10)
    const count = counts.get(date) ?? 0
    days.push({ date, count, level: levelFromCount(count) })
  }

  return days
}

export async function GET(request: NextRequest) {
  const username =
    request.nextUrl.searchParams.get('username')?.trim() || process.env.LEETCODE_USERNAME || 'jaypatil588'
  const yearParam = request.nextUrl.searchParams.get('year')
  const parsedYear = yearParam ? Number(yearParam) : new Date().getFullYear()
  const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear()

  const query = {
    query: `
      query userCalendar($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          userCalendar {
            activeYears
            totalActiveDays
            submissionCalendar
          }
        }
      }
    `,
    variables: { username },
  }

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
      if (isoDate.startsWith(`${year}-`)) {
        countsByDate.set(isoDate, count)
      }
    }

    const heatmap = buildYearDays(year, countsByDate)
    const totalSubmissions = heatmap.reduce((sum, day) => sum + day.count, 0)

    return NextResponse.json(
      {
        username,
        year,
        profileUrl: `https://leetcode.com/${username}/`,
        totalSubmissions,
        totalActiveDays: user.userCalendar.totalActiveDays,
        activeYears: user.userCalendar.activeYears,
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
