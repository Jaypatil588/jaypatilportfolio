import { NextRequest, NextResponse } from 'next/server'

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

function commitLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

function buildYearDays(year: number, counts: Map<string, number>) {
  const days: Array<{ date: string; count: number; level: number }> = []
  const start = new Date(Date.UTC(year, 0, 1))
  const end = new Date(Date.UTC(year, 11, 31))

  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10)
    const count = counts.get(date) ?? 0
    days.push({ date, count, level: commitLevel(count) })
  }

  return days
}

function extractContributionsFromSvg(svg: string) {
  const counts = new Map<string, number>()
  const regexDateFirst = /<rect[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-count="(\d+)"[^>]*>/g
  const regexCountFirst = /<rect[^>]*data-count="(\d+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g

  let match = regexDateFirst.exec(svg)
  while (match) {
    const [, date, count] = match
    counts.set(date, Number(count))
    match = regexDateFirst.exec(svg)
  }

  match = regexCountFirst.exec(svg)
  while (match) {
    const [, count, date] = match
    counts.set(date, Number(count))
    match = regexCountFirst.exec(svg)
  }

  return counts
}

export async function GET(request: NextRequest) {
  const username =
    request.nextUrl.searchParams.get('username')?.trim() || process.env.GITHUB_USERNAME || 'Jaypatil588'
  const yearParam = request.nextUrl.searchParams.get('year')
  const parsedYear = yearParam ? Number(yearParam) : new Date().getFullYear()
  const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear()
  const token = process.env.GITHUB_TOKEN

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'jaypatilportfolio',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const from = `${year}-01-01`
  const to = `${year}-12-31`

  try {
    const profilePromise = fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 },
    })

    const reposPromise = fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
      headers,
      next: { revalidate: 3600 },
    })

    const contributionsPromise = fetch(
      `https://github.com/users/${username}/contributions?from=${from}&to=${to}`,
      {
        headers: { 'User-Agent': 'jaypatilportfolio' },
        next: { revalidate: 3600 },
      }
    )

    const [profileResponse, reposResponse, contributionsResponse] = await Promise.all([
      profilePromise,
      reposPromise,
      contributionsPromise,
    ])

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

    if (!contributionsResponse.ok) {
      return NextResponse.json(
        { error: 'Unable to load GitHub contribution graph.' },
        { status: contributionsResponse.status }
      )
    }

    const profile = (await profileResponse.json()) as GithubProfile
    const repos = (await reposResponse.json()) as GithubRepo[]
    const contributionsSvg = await contributionsResponse.text()

    const contributionCounts = extractContributionsFromSvg(contributionsSvg)
    const heatmap = buildYearDays(year, contributionCounts)

    const ownRepos = repos.filter((repo) => !repo.fork)
    const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0)

    const totalContributions = heatmap.reduce((sum, day) => sum + day.count, 0)

    const response = {
      username,
      year,
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
        totalContributions,
      },
      heatmap,
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
        note: `GitHub contribution graph for ${year}.`,
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Unexpected error while loading GitHub data.' },
      { status: 500 }
    )
  }
}
