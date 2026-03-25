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

interface RenderCell {
  key: string
  day?: CombinedDay
}

function styleForCell(githubLevel: number, leetcodeLevel: number) {
  const githubShades = ['#1a6a45', '#22a95b', '#39e27a', '#8dffb8']
  const leetcodeShades = ['#8a6a18', '#c89b1f', '#efc62e', '#ffe27a']

  if (githubLevel === 0 && leetcodeLevel === 0) {
    return { className: 'border-[#1f3550] bg-[#122033]', style: undefined as CSSProperties | undefined }
  }

  // GitHub priority on overlap days
  if (githubLevel > 0) {
    const color = githubShades[Math.max(githubLevel - 1, 0)] || githubShades[3]
    return { className: 'border-transparent', style: { background: color } }
  }

  const color = leetcodeShades[Math.max(leetcodeLevel - 1, 0)] || leetcodeShades[3]
  return { className: 'border-transparent', style: { background: color } }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function computeMaxStreak(days: CombinedDay[]) {
  let best = 0
  let running = 0

  for (const day of days) {
    if (day.githubCount > 0 || day.leetcodeCount > 0) {
      running += 1
      if (running > best) best = running
    } else {
      running = 0
    }
  }

  return best
}

export function ContributionHeatmap({ title, subtitle, days }: ContributionHeatmapProps) {
  const [hovered, setHovered] = useState<CombinedDay | null>(null)

  const monthBlocks = useMemo(() => {
    const monthMap = new Map<string, { month: string; days: CombinedDay[] }>()

    for (const day of days) {
      const dt = new Date(`${day.date}T00:00:00`)
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      const month = dt.toLocaleString('en-US', { month: 'short' })

      if (!monthMap.has(key)) monthMap.set(key, { month, days: [] })
      monthMap.get(key)!.days.push(day)
    }

    const entries = Array.from(monthMap.entries()).map(([key, value]) => ({ key, ...value }))

    // Match the reference style: skip the tiny first partial month in a rolling year window.
    if (entries.length > 1 && entries[0].days.length < 10) {
      return entries.slice(1)
    }

    return entries
  }, [days])

  const renderMonths = useMemo(() => {
    return monthBlocks.map((block) => {
      const firstDate = new Date(`${block.days[0].date}T00:00:00`)
      const leading = firstDate.getDay()
      const cells: RenderCell[] = []

      for (let i = 0; i < leading; i += 1) {
        cells.push({ key: `${block.key}-blank-${i}` })
      }

      for (const day of block.days) {
        cells.push({ key: day.date, day })
      }

      const trailing = (7 - (cells.length % 7)) % 7
      for (let i = 0; i < trailing; i += 1) {
        cells.push({ key: `${block.key}-tail-${i}` })
      }

      return { key: block.key, month: block.month, cells }
    })
  }, [monthBlocks])

  const stats = useMemo(() => {
    const total = days.reduce((acc, day) => acc + day.githubCount + day.leetcodeCount, 0)
    const activeDays = days.filter((day) => day.githubCount > 0 || day.leetcodeCount > 0).length
    const maxStreak = computeMaxStreak(days)

    return { total, activeDays, maxStreak }
  }, [days])

  return (
    <div className="rounded-2xl border border-[#1f3550] bg-[#0b1423] px-4 py-3 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-zinc-100 text-3xl font-bold leading-none">
            {formatNumber(stats.total)}
            <span className="ml-2 text-zinc-300 text-sm font-medium">activities in the past one year</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">{title} • {subtitle}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-zinc-300">
          <span>Total active days: {stats.activeDays}</span>
          <span>Max streak: {stats.maxStreak}</span>
          <span className="rounded-md bg-[#1a2a3f] px-3 py-1 text-zinc-200">Current</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-x-2 gap-y-2" onMouseLeave={() => setHovered(null)}>
        {renderMonths.map((month) => (
          <div key={month.key} className="min-w-0">
            <div className="grid grid-rows-7 grid-flow-col auto-cols-max gap-[3px]">
              {month.cells.map((cell) => {
                if (!cell.day) {
                  return <span key={cell.key} className="h-3 w-3 rounded-[2px] opacity-0" />
                }

                const cellStyle = styleForCell(cell.day.githubLevel, cell.day.leetcodeLevel)
                const dateText = new Date(`${cell.day.date}T00:00:00`).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      className={`h-3 w-3 rounded-[2px] border transition-transform hover:scale-115 ${cellStyle.className}`}
                      style={cellStyle.style}
                      onMouseEnter={() => setHovered(cell.day!)}
                      aria-label={`${dateText} - GitHub ${cell.day.githubCount}, LeetCode ${cell.day.leetcodeCount}`}
                    />
                  )
              })}
            </div>
            <p className="mt-1 text-[11px] text-zinc-300 text-center">{month.month}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-md border border-[#1f3550] bg-[#0e1b2f]/80 px-3 py-2 text-xs text-zinc-300 min-h-[34px] flex items-center justify-between gap-3">
        {hovered ? (
          <>
            <span>{hovered.date}</span>
            <span className="text-emerald-300">GitHub: {hovered.githubCount}</span>
            <span className="text-yellow-300">LeetCode: {hovered.leetcodeCount}</span>
          </>
        ) : (
          <span>Hover any box to see daily stats</span>
        )}
      </div>
    </div>
  )
}
