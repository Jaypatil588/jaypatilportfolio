import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

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

interface ProjectCardRepo {
  id: number
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  url: string
  homepage: string | null
  pushedAt: string
  image: string | null
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

interface RepoCatalogEntry {
  project_name: string
  picture?: string
  description?: string
}

interface RepoCatalogPayload {
  repositories?: RepoCatalogEntry[]
}

const LEVEL_TO_COUNT = [0, 1, 3, 6, 10]

function toRelativeLevel(value: number, maxValue: number) {
  if (value <= 0 || maxValue <= 0) return 0
  return Math.min(Math.max(Math.ceil((value / maxValue) * 4), 1), 4)
}

function buildRollingDays(from: string, to: string, sourceLevels: Map<string, number>) {
  const days: Array<{ date: string; count: number; level: number }> = []
  const start = new Date(`${from}T00:00:00Z`)
  const end = new Date(`${to}T00:00:00Z`)
  let maxCount = 0

  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10)
    const rawLevel = sourceLevels.get(date) ?? 0
    const count = LEVEL_TO_COUNT[rawLevel] ?? 0
    if (count > maxCount) maxCount = count
    days.push({ date, count, level: 0 })
  }

  return days.map((day) => ({
    ...day,
    level: toRelativeLevel(day.count, maxCount),
  }))
}

function extractDailyLevels(html: string) {
  const levels = new Map<string, number>()
  const dayCellRegex = /<td[^>]*class="ContributionCalendar-day"[^>]*>/g

  let match = dayCellRegex.exec(html)
  while (match) {
    const tag = match[0]
    const dateMatch = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)
    const levelMatch = tag.match(/data-level="([0-4])"/)
    if (dateMatch && levelMatch) {
      levels.set(dateMatch[1], Number(levelMatch[1]))
    }
    match = dayCellRegex.exec(html)
  }

  return levels
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

async function loadRepoCatalog() {
  try {
    const catalogPath = path.join(process.cwd(), 'public', 'projects', 'repos', 'repositories.json')
    const file = await readFile(catalogPath, 'utf8')
    const parsed = JSON.parse(file) as RepoCatalogPayload
    const repositories = Array.isArray(parsed.repositories) ? parsed.repositories : []
    return new Map(repositories.map((repo) => [repo.project_name, repo]))
  } catch {
    return new Map<string, RepoCatalogEntry>()
  }
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

  const { from, to } = getLastYearRange()

  try {
    const catalogPromise = loadRepoCatalog()
    const profilePromise = fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 },
    })

    const reposPromise = fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
      headers,
      next: { revalidate: 3600 },
    })

    const contributionsPromise = fetch(`https://github.com/users/${username}/contributions`, {
      headers: { 'User-Agent': 'jaypatilportfolio' },
      next: { revalidate: 3600 },
    })

    const [catalog, profileResponse, reposResponse, contributionsResponse] = await Promise.all([
      catalogPromise,
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
    const contributionsHtml = await contributionsResponse.text()
    const dailyLevels = extractDailyLevels(contributionsHtml)
    const heatmap = buildRollingDays(from, to, dailyLevels)

    const ownRepos = repos.filter((repo) => !repo.fork)
    const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0)

    const totalContributions = heatmap.reduce((sum, day) => sum + day.count, 0)

    const projectRepos: ProjectCardRepo[] = ownRepos
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 9)
      .map((repo) => {
        const catalogEntry = catalog.get(repo.name)

        return {
          id: repo.id,
          name: repo.name,
          description: catalogEntry?.description || repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
          homepage: repo.homepage,
          pushedAt: repo.pushed_at,
          image: catalogEntry?.picture ? `/projects/repos/${catalogEntry.picture}` : null,
        }
      })

    const response = {
      username,
      range: { from, to },
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
      repos: projectRepos,
      dataSource: {
        hasToken: Boolean(token),
        note: `GitHub contribution graph from ${from} to ${to}.`,
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Unexpected error while loading GitHub data.' }, { status: 500 })
  }
}
