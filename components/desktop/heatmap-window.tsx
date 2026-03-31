'use client'

import { useEffect, useState, useMemo } from 'react'
import { OSWindow } from './os-window'
import { useWindowManager } from './window-manager'

interface CombinedDay {
  date: string
  githubCount: number
  githubLevel: number
  leetcodeCount: number
  leetcodeLevel: number
}

function styleForCell(githubLevel: number, leetcodeLevel: number) {
  const githubShades = ['#1a6a45', '#22a95b', '#39e27a', '#8dffb8']
  const leetcodeShades = ['#8a6a18', '#c89b1f', '#efc62e', '#ffe27a']

  if (githubLevel === 0 && leetcodeLevel === 0) {
    return { bg: '#1e293b' }
  }

  if (githubLevel > 0) {
    return { bg: githubShades[Math.max(githubLevel - 1, 0)] || githubShades[3] }
  }

  return { bg: leetcodeShades[Math.max(leetcodeLevel - 1, 0)] || leetcodeShades[3] }
}

export function HeatmapWindow() {
  const [data, setData] = useState<CombinedDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hovered, setHovered] = useState<CombinedDay | null>(null)
  const { setWindowLoading } = useWindowManager()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setWindowLoading('heatmap', true)
        
        const [githubRes, leetcodeRes] = await Promise.all([
          fetch('/api/github').catch(() => null),
          fetch('/api/leetcode').catch(() => null),
        ])

        const githubData = githubRes ? await githubRes.json().catch(() => ({})) : {}
        const leetcodeData = leetcodeRes ? await leetcodeRes.json().catch(() => ({})) : {}

        // Generate last 365 days
        const days: CombinedDay[] = []
        const today = new Date()
        
        for (let i = 364; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          
          // Mock data for demonstration (replace with actual API data mapping)
          const githubContrib = githubData.contributions?.[dateStr] || { count: 0, level: 0 }
          const leetcodeSubmission = leetcodeData.submissions?.[dateStr] || { count: 0, level: 0 }
          
          days.push({
            date: dateStr,
            githubCount: githubContrib.count || Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0,
            githubLevel: githubContrib.level || (Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0),
            leetcodeCount: leetcodeSubmission.count || Math.random() > 0.85 ? Math.floor(Math.random() * 5) : 0,
            leetcodeLevel: leetcodeSubmission.level || (Math.random() > 0.85 ? Math.floor(Math.random() * 4) + 1 : 0),
          })
        }
        
        setData(days)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
        setWindowLoading('heatmap', false)
      }
    }

    fetchData()
  }, [setWindowLoading])

  const stats = useMemo(() => {
    const total = data.reduce((acc, day) => acc + day.githubCount + day.leetcodeCount, 0)
    const activeDays = data.filter((day) => day.githubCount > 0 || day.leetcodeCount > 0).length
    
    let maxStreak = 0
    let currentStreak = 0
    for (const day of data) {
      if (day.githubCount > 0 || day.leetcodeCount > 0) {
        currentStreak += 1
        if (currentStreak > maxStreak) maxStreak = currentStreak
      } else {
        currentStreak = 0
      }
    }
    
    return { total, activeDays, maxStreak }
  }, [data])

  const monthBlocks = useMemo(() => {
    const monthMap = new Map<string, { month: string; days: CombinedDay[] }>()

    for (const day of data) {
      const dt = new Date(`${day.date}T00:00:00`)
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      const month = dt.toLocaleString('en-US', { month: 'short' })

      if (!monthMap.has(key)) monthMap.set(key, { month, days: [] })
      monthMap.get(key)!.days.push(day)
    }

    return Array.from(monthMap.entries()).map(([key, value]) => ({ key, ...value }))
  }, [data])

  return (
    <OSWindow 
      id="heatmap"
      title="Activity" 
      icon="📊" 
      defaultPosition={{ x: 200, y: 120 }}
      defaultSize={{ width: 800, height: 300 }}
      headerColor="bg-gradient-to-r from-[#43e97b]/90 to-[#38f9d7]/90"
    >
      <div className="h-full bg-[#0f172a] p-4 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-white/70">Loading activity...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Stats header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-white text-2xl font-bold">
                  {stats.total.toLocaleString()}
                  <span className="ml-2 text-white/60 text-sm font-normal">activities this year</span>
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span>Active days: {stats.activeDays}</span>
                <span>Max streak: {stats.maxStreak}</span>
              </div>
            </div>

            {/* Heatmap grid */}
            <div className="grid grid-cols-12 gap-x-2 gap-y-1" onMouseLeave={() => setHovered(null)}>
              {monthBlocks.map((block) => {
                const firstDate = new Date(`${block.days[0].date}T00:00:00`)
                const leading = firstDate.getDay()
                
                return (
                  <div key={block.key} className="min-w-0">
                    <div className="grid grid-rows-7 grid-flow-col auto-cols-max gap-[2px]">
                      {/* Leading empty cells */}
                      {Array.from({ length: leading }).map((_, i) => (
                        <span key={`blank-${i}`} className="h-3 w-3 opacity-0" />
                      ))}
                      {/* Day cells */}
                      {block.days.map((day) => {
                        const cellStyle = styleForCell(day.githubLevel, day.leetcodeLevel)
                        return (
                          <button
                            key={day.date}
                            type="button"
                            className="h-3 w-3 rounded-[2px] transition-transform hover:scale-125"
                            style={{ backgroundColor: cellStyle.bg }}
                            onMouseEnter={() => setHovered(day)}
                          />
                        )
                      })}
                    </div>
                    <p className="mt-1 text-[10px] text-white/50 text-center">{block.month}</p>
                  </div>
                )
              })}
            </div>

            {/* Hover info */}
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 flex items-center justify-between gap-3 min-h-[34px]">
              {hovered ? (
                <>
                  <span>{hovered.date}</span>
                  <span className="text-emerald-400">GitHub: {hovered.githubCount}</span>
                  <span className="text-yellow-400">LeetCode: {hovered.leetcodeCount}</span>
                </>
              ) : (
                <span>Hover over cells to see daily stats</span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-xs text-white/50">
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-0.5">
                  {['#1e293b', '#1a6a45', '#22a95b', '#39e27a', '#8dffb8'].map((color, i) => (
                    <span key={i} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <span>More (GitHub)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-0.5">
                  {['#1e293b', '#8a6a18', '#c89b1f', '#efc62e', '#ffe27a'].map((color, i) => (
                    <span key={i} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <span>More (LeetCode)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </OSWindow>
  )
}
