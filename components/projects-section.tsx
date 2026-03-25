'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink, GitFork, Github, Star, Trophy } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { ContributionHeatmap } from './contribution-heatmap'

interface GithubPayload {
  username: string
  range: { from: string; to: string }
  profile: {
    login: string
    name: string | null
    avatarUrl: string
    followers: number
    following: number
    publicRepos: number
    profileUrl: string
  }
  metrics: {
    totalStars: number
    totalForks: number
    trackedRepos: number
    totalContributions: number
  }
  heatmap: Array<{ date: string; count: number; level: number }>
  repos: Array<{
    id: number
    name: string
    description: string | null
    language: string | null
    stars: number
    forks: number
    url: string
    homepage: string | null
    pushedAt: string
  }>
}

interface LeetcodePayload {
  username: string
  range: { from: string; to: string }
  profileUrl: string
  totalSubmissions: number
  totalActiveDays: number
  heatmap: Array<{ date: string; count: number; level: number }>
}

function githubUsernameFromUrl(url: string) {
  const username = url.split('github.com/')[1]
  return username?.replace(/\/.*/, '') || 'Jaypatil588'
}

export function ProjectsSection() {
  const [githubData, setGithubData] = useState<GithubPayload | null>(null)
  const [leetcodeData, setLeetcodeData] = useState<LeetcodePayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const githubUsername = githubUsernameFromUrl(portfolioData.github)
    const leetcodeUsername = portfolioData.leetcodeUsername || githubUsername.toLowerCase()

    async function loadData() {
      try {
        setIsLoading(true)

        const [githubResponse, leetcodeResponse] = await Promise.all([
          fetch(`/api/github?username=${githubUsername}`),
          fetch(`/api/leetcode?username=${leetcodeUsername}`),
        ])

        const githubPayload = await githubResponse.json()
        const leetcodePayload = await leetcodeResponse.json()

        if (!githubResponse.ok) {
          throw new Error(githubPayload.error || 'Failed to load GitHub data')
        }

        if (!leetcodeResponse.ok) {
          throw new Error(leetcodePayload.error || 'Failed to load LeetCode data')
        }

        setGithubData(githubPayload as GithubPayload)
        setLeetcodeData(leetcodePayload as LeetcodePayload)
        setError(null)
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load profile activity'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const mergedHeatmap = useMemo(() => {
    if (!githubData || !leetcodeData) return []

    const leetcodeMap = new Map(
      leetcodeData.heatmap.map((day) => [day.date, { count: day.count, level: day.level }])
    )

    return githubData.heatmap.map((day) => {
      const lc = leetcodeMap.get(day.date) || { count: 0, level: 0 }
      return {
        date: day.date,
        githubCount: day.count,
        githubLevel: day.level,
        leetcodeCount: lc.count,
        leetcodeLevel: lc.level,
      }
    })
  }, [githubData, leetcodeData])

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-sm text-primary font-medium mb-4">
            Combined Activity Showcase
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Last 365 Days, <span className="gradient-text">Merged Heatmap</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            A single unified timeline from the current date, blending GitHub (green) and LeetCode (yellow) activity.
          </p>
        </motion.div>

        {isLoading && (
          <div className="rounded-2xl glass p-8 text-center text-muted-foreground">Loading activity...</div>
        )}

        {error && !isLoading && (
          <div className="rounded-2xl glass p-8 text-center">
            <p className="text-foreground font-semibold mb-2">Could not load activity data</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && githubData && leetcodeData && (
          <>
            <ContributionHeatmap
              title="GitHub + LeetCode Activity"
              subtitle={`${githubData.range.from} to ${githubData.range.to} • GitHub takes priority on overlap days`}
              days={mergedHeatmap}
            />

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl glass p-5">
                <div className="text-sm text-muted-foreground mb-1">GitHub Contributions</div>
                <div className="text-3xl font-bold text-emerald-300">{githubData.metrics.totalContributions}</div>
              </div>
              <div className="rounded-2xl glass p-5">
                <div className="text-sm text-muted-foreground mb-1">LeetCode Submissions</div>
                <div className="text-3xl font-bold text-amber-300">{leetcodeData.totalSubmissions}</div>
              </div>
              <div className="rounded-2xl glass p-5">
                <div className="text-sm text-muted-foreground mb-1">GitHub Stars</div>
                <div className="text-3xl font-bold text-foreground">{githubData.metrics.totalStars}</div>
              </div>
              <div className="rounded-2xl glass p-5">
                <div className="text-sm text-muted-foreground mb-1">LeetCode Active Days</div>
                <div className="text-3xl font-bold text-foreground">{leetcodeData.totalActiveDays}</div>
              </div>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {githubData.repos.map((repo, index) => (
                <motion.a
                  key={repo.id}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl glass p-6 hover-glow block"
                  whileHover={{ y: -6 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {repo.name}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                    {repo.description || 'No description provided.'}
                  </p>

                  <div className="mt-4 flex items-center flex-wrap gap-4 text-xs text-muted-foreground">
                    {repo.language && <span className="px-2 py-1 rounded-md bg-secondary/70">{repo.language}</span>}
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      {repo.stars}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      {repo.forks}
                    </span>
                  </div>

                  {repo.homepage && (
                    <div className="mt-4 text-sm text-primary inline-flex items-center gap-2">
                      Live Demo
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  )}
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className="rounded-2xl glass p-6 flex flex-wrap items-center justify-between gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <p className="text-lg font-semibold text-foreground">Explore full profiles</p>
                <p className="text-sm text-muted-foreground">See detailed activity and contributions directly on source platforms.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={githubData.profile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all"
                >
                  <Github className="w-4 h-4" />
                  GitHub Profile
                </a>
                <a
                  href={leetcodeData.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-all"
                >
                  <Trophy className="w-4 h-4" />
                  LeetCode Profile
                </a>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
