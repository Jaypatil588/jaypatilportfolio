'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink, GitFork, Github, Star, Users } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'

interface GithubPayload {
  username: string
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
  }
  heatmap: Array<{
    date: string
    count: number
    level: number
  }>
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
  dataSource: {
    hasToken: boolean
    note: string
  }
}

const activityLevelClass: Record<number, string> = {
  0: 'bg-secondary/40',
  1: 'bg-primary/25',
  2: 'bg-primary/45',
  3: 'bg-primary/70',
  4: 'bg-primary',
}

function githubUsernameFromUrl(url: string) {
  const username = url.split('github.com/')[1]
  return username?.replace(/\/.*/, '') || 'Jaypatil588'
}

export function ProjectsSection() {
  const [githubData, setGithubData] = useState<GithubPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const username = githubUsernameFromUrl(portfolioData.github)

    async function loadGithubData() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/github?username=${username}`)
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load GitHub data')
        }

        setGithubData(payload as GithubPayload)
        setError(null)
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load GitHub data'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadGithubData()
  }, [])

  const heatmapStats = useMemo(() => {
    if (!githubData) return { totalCommits: 0, activeDays: 0 }

    const totalCommits = githubData.heatmap.reduce((sum, day) => sum + day.count, 0)
    const activeDays = githubData.heatmap.filter((day) => day.count > 0).length

    return { totalCommits, activeDays }
  }, [githubData])

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-sm text-primary font-medium mb-4">
            GitHub-Backed Showcase
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real Activity, <span className="gradient-text">Live Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            This section pulls my profile, commit activity, and repositories directly from GitHub.
          </p>
        </motion.div>

        {isLoading && (
          <div className="rounded-2xl glass p-8 text-center text-muted-foreground">Loading GitHub showcase...</div>
        )}

        {error && !isLoading && (
          <div className="rounded-2xl glass p-8 text-center">
            <p className="text-foreground font-semibold mb-2">Could not load GitHub data</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        )}

        {!isLoading && githubData && (
          <>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl glass p-5">
                <div className="text-sm text-muted-foreground mb-1">Commits (last 140 days)</div>
                <div className="text-3xl font-bold text-foreground">{heatmapStats.totalCommits}</div>
              </div>
              <div className="rounded-2xl glass p-5">
                <div className="text-sm text-muted-foreground mb-1">Active Days</div>
                <div className="text-3xl font-bold text-foreground">{heatmapStats.activeDays}</div>
              </div>
              <div className="rounded-2xl glass p-5">
                <div className="text-sm text-muted-foreground mb-1">Stars Across Repos</div>
                <div className="text-3xl font-bold text-foreground">{githubData.metrics.totalStars}</div>
              </div>
              <div className="rounded-2xl glass p-5">
                <div className="text-sm text-muted-foreground mb-1">Public Repositories</div>
                <div className="text-3xl font-bold text-foreground">{githubData.profile.publicRepos}</div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-2xl glass p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">Commit Heatmap</h3>
                  <p className="text-sm text-muted-foreground">{githubData.dataSource.note}</p>
                </div>
                <a
                  href={githubData.profile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 hover:border-primary/60 hover:text-primary transition-colors text-sm"
                >
                  <Github className="w-4 h-4" />
                  View Profile
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-max">
                  {githubData.heatmap.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.count} commits`}
                      className={`w-3.5 h-3.5 rounded-sm border border-border/30 ${activityLevelClass[day.level]}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <span key={level} className={`w-3 h-3 rounded-sm border border-border/30 ${activityLevelClass[level]}`} />
                ))}
                <span>More</span>
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
                <p className="text-lg font-semibold text-foreground">Follow my open-source journey</p>
                <p className="text-sm text-muted-foreground">
                  {githubData.profile.followers} followers • {githubData.profile.following} following
                </p>
              </div>
              <a
                href={githubData.profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Users className="w-4 h-4" />
                Connect on GitHub
              </a>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
