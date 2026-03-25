import { NextRequest, NextResponse } from 'next/server'

const MAX_EVENT_PAGES = 10
const HEATMAP_DAYS = 140

interface GithubRepo {
  id: number
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  html_url: string
  homepage: string | null
  pushed_at: string
  fork: boolean
}

interface GithubProfile {
  login: string
  name: string | null
  avatar_url: string
  followers: number
  following: number
  public_repos: number
  html_url: string
}

interface GithubEvent {
  type: string
  created_at: string
  payload?: {
    size?: number
    commits?: Array<unknown>
  }
}

function commitLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 8) return 3
  return 4
}

function buildRecentDays(counts: Map<string, number>) {
  const days: Array<{ date: string; count: number; level: number }> = []
  const now = new Date()

  for (let offset = HEATMAP_DAYS - 1; offset >= 0; offset -= 1) {
    const currentDate = new Date(now)
    currentDate.setDate(now.getDate() - offset)
    const isoDate = currentDate.toISOString().slice(0, 10)
    const commitCount = counts.get(isoDate) ?? 0
    days.push({
      date: isoDate,
      count: commitCount,
      level: commitLevel(commitCount),
    })
  }

  return days
}

export async function GET(request: NextRequest) {
  const username =
    request.nextUrl.searchParams.get('username')?.trim() || process.env.GITHUB_USERNAME || 'Jaypatil588'
  const token = process.env.GITHUB_TOKEN

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'jaypatilportfolio',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const profilePromise = fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 },
    })

    const reposPromise = fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
      headers,
      next: { revalidate: 3600 },
    })

    const [profileResponse, reposResponse] = await Promise.all([profilePromise, reposPromise])

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: 'Unable to load GitHub profile data. Check GITHUB_USERNAME.' },
        { status: profileResponse.status }
      )
    }

    if (!reposResponse.ok) {
      return NextResponse.json(
        { error: 'Unable to load GitHub repositories.' },
        { status: reposResponse.status }
      )
    }

    const profile = (await profileResponse.json()) as GithubProfile
    const repos = (await reposResponse.json()) as GithubRepo[]

    const eventRequests = Array.from({ length: MAX_EVENT_PAGES }, (_, index) =>
      fetch(`https://api.github.com/users/${username}/events/public?per_page=100&page=${index + 1}`, {
        headers,
        next: { revalidate: 3600 },
      })
    )

    const eventResponses = await Promise.all(eventRequests)
    const eventPayloads = await Promise.all(
      eventResponses.map(async (response) => {
        if (!response.ok) return [] as GithubEvent[]
        return (await response.json()) as GithubEvent[]
      })
    )

    const commitCounts = new Map<string, number>()

    for (const events of eventPayloads) {
      for (const event of events) {
        if (event.type !== 'PushEvent') continue
        const date = event.created_at.slice(0, 10)
        const commitCount = event.payload?.size ?? event.payload?.commits?.length ?? 1
        commitCounts.set(date, (commitCounts.get(date) ?? 0) + commitCount)
      }
    }

    const ownRepos = repos.filter((repo) => !repo.fork)
    const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0)

    const response = {
      username,
      profile: {
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        profileUrl: profile.html_url,
      },
      metrics: {
        totalStars,
        totalForks,
        trackedRepos: ownRepos.length,
      },
      heatmap: buildRecentDays(commitCounts),
      repos: ownRepos
        .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
        .slice(0, 9)
        .map((repo) => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
          homepage: repo.homepage,
          pushedAt: repo.pushed_at,
        })),
      dataSource: {
        hasToken: Boolean(token),
        note: token
          ? 'Commit counts are based on public push events and refreshed hourly.'
          : 'Commit counts are based on public events (rate-limited by GitHub API without token).',
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error while loading GitHub data.' },
      { status: 500 }
    )
  }
}
