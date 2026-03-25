'use client'

import { CSSProperties, useMemo, useState } from 'react'

interface CombinedDay {
  date: string
  githubCount: number
  githubLevel: number
  leetcodeCount: number
  leetcodeLevel: number
}

interface ContributionHeatmapProps {
  title: string
  subtitle: string
  days: CombinedDay[]
}

function styleForCell(githubLevel: number, leetcodeLevel: number) {
  const githubShades = ['#123924', '#1f7a3d', '#2dbf5c', '#67f58e']
  const leetcodeShades = ['#4a3b10', '#8e6e12', '#d8a719', '#ffe066']

  if (githubLevel === 0 && leetcodeLevel === 0) {
    return { className: 'border-[#1c2a38] bg-[#0b1621]', style: undefined as CSSProperties | undefined }
  }

  // GitHub priority on overlap days
  if (githubLevel > 0) {
    const color = githubShades[Math.max(githubLevel - 1, 0)] || githubShades[3]
    return { className: 'border-transparent', style: { background: color } }
  }

  const color = leetcodeShades[Math.max(leetcodeLevel - 1, 0)] || leetcodeShades[3]
  return { className: 'border-transparent', style: { background: color } }
}

export function ContributionHeatmap({ title, subtitle, days }: ContributionHeatmapProps) {
  const [hovered, setHovered] = useState<CombinedDay | null>(null)

  const months = useMemo(() => {
    const groups = new Map<string, { label: string; days: CombinedDay[] }>()

    for (const day of days) {
      const dt = new Date(`${day.date}T00:00:00`)
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      const label = dt.toLocaleString('en-US', { month: 'short' })

      if (!groups.has(key)) {
        groups.set(key, { label, days: [] })
      }

      groups.get(key)!.days.push(day)
    }

    return Array.from(groups.entries()).map(([key, value]) => ({ key, ...value }))
  }, [days])

  const totals = useMemo(() => {
    return days.reduce(
      (acc, day) => {
        acc.github += day.githubCount
        acc.leetcode += day.leetcodeCount
        return acc
      },
      { github: 0, leetcode: 0 }
    )
  }, [days])

  return (
    <div className="rounded-2xl glass p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="text-emerald-300">{totals.github} GitHub</span>
          {' • '}
          <span className="text-amber-300">{totals.leetcode} LeetCode</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px] flex items-start gap-5 pb-2" onMouseLeave={() => setHovered(null)}>
          {months.map((month) => (
            <div key={month.key} className="shrink-0">
              <p className="text-xs text-muted-foreground mb-2">{month.label}</p>
              <div className="grid grid-cols-7 gap-1.5">
                {month.days.map((day) => {
                  const cellStyle = styleForCell(day.githubLevel, day.leetcodeLevel)
                  const dateText = new Date(`${day.date}T00:00:00`).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })

                  return (
                    <button
                      key={day.date}
                      type="button"
                      className={`h-3.5 w-3.5 rounded-[3px] border transition-transform hover:scale-125 ${cellStyle.className}`}
                      style={cellStyle.style}
                      onMouseEnter={() => setHovered(day)}
                      aria-label={`${dateText} - GitHub ${day.githubCount}, LeetCode ${day.leetcodeCount}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground min-h-[40px] flex items-center justify-between gap-3">
        {hovered ? (
          <>
            <span>{hovered.date}</span>
            <span className="text-emerald-300">GitHub: {hovered.githubCount}</span>
            <span className="text-amber-300">LeetCode: {hovered.leetcodeCount}</span>
          </>
        ) : (
          <span>Hover a box to see daily stats</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>GitHub</span>
        {[1, 2, 3, 4].map((level) => (
          <span
            key={`g-${level}`}
            className="h-3 w-3 rounded-[3px]"
            style={{ background: ['#123924', '#1f7a3d', '#2dbf5c', '#67f58e'][level - 1] }}
          />
        ))}
        <span className="ml-2">LeetCode</span>
        {[1, 2, 3, 4].map((level) => (
          <span
            key={`l-${level}`}
            className="h-3 w-3 rounded-[3px]"
            style={{ background: ['#4a3b10', '#8e6e12', '#d8a719', '#ffe066'][level - 1] }}
          />
        ))}
      </div>
    </div>
  )
}
