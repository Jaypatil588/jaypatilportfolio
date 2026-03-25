'use client'

import { CSSProperties, useMemo } from 'react'

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

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekColumnWidth = 18
const monthGapWidth = 8

function styleForCell(githubLevel: number, leetcodeLevel: number) {
  const githubShades = ['#123924', '#1f7a3d', '#2dbf5c', '#67f58e']
  const leetcodeShades = ['#4a3b10', '#8e6e12', '#d8a719', '#ffe066']

  if (githubLevel === 0 && leetcodeLevel === 0) {
    return { className: 'border-[#1c2a38] bg-[#0b1621]', style: undefined as CSSProperties | undefined }
  }

  if (githubLevel > 0) {
    const color = githubShades[Math.max(githubLevel - 1, 0)] || githubShades[3]
    return { className: 'border-transparent', style: { background: color } }
  }

  if (leetcodeLevel > 0) {
    const color = leetcodeShades[Math.max(leetcodeLevel - 1, 0)] || leetcodeShades[3]
    return { className: 'border-transparent', style: { background: color } }
  }
  return { className: 'border-[#1c2a38] bg-[#0b1621]', style: undefined as CSSProperties | undefined }
}

export function ContributionHeatmap({ title, subtitle, days }: ContributionHeatmapProps) {
  const weeks = useMemo(() => {
    if (!days.length) return [] as CombinedDay[][]

    const firstDate = new Date(`${days[0].date}T00:00:00`)
    const start = new Date(firstDate)
    start.setDate(start.getDate() - start.getDay())

    const lastDate = new Date(`${days[days.length - 1].date}T00:00:00`)
    const end = new Date(lastDate)
    end.setDate(end.getDate() + (6 - end.getDay()))

    const dayMap = new Map(days.map((day) => [day.date, day]))
    const columns: CombinedDay[][] = []

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 7)) {
      const column: CombinedDay[] = []
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(cursor)
        d.setDate(cursor.getDate() + i)
        const iso = d.toISOString().slice(0, 10)
        column.push(
          dayMap.get(iso) ?? {
            date: iso,
            githubCount: 0,
            githubLevel: 0,
            leetcodeCount: 0,
            leetcodeLevel: 0,
          }
        )
      }
      columns.push(column)
    }

    return columns
  }, [days])

  const monthStarts = useMemo(() => {
    if (!days.length || !weeks.length) return [] as Array<{ month: string; week: number }>

    const firstDate = new Date(`${days[0].date}T00:00:00`)
    const start = new Date(firstDate)
    start.setDate(start.getDate() - start.getDay())
    const lastDate = new Date(`${days[days.length - 1].date}T00:00:00`)

    const labels: Array<{ month: string; week: number }> = []
    let monthCursor = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)

    while (monthCursor <= lastDate) {
      const diffDays = Math.floor((monthCursor.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      labels.push({
        month: monthCursor.toLocaleString('en-US', { month: 'short' }),
        week: Math.max(0, Math.floor(diffDays / 7)),
      })
      monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)
    }

    const minLabelGapWeeks = 2
    const result: Array<{ month: string; week: number }> = []
    let lastPlacedWeek = -9999

    for (let i = 0; i < labels.length; i += 1) {
      // Skip the first partial month label if the range starts late in the month.
      if (i === 0 && firstDate.getDate() > 7) continue

      if (labels[i].week - lastPlacedWeek < minLabelGapWeeks) continue

      result.push(labels[i])
      lastPlacedWeek = labels[i].week
    }

    return result
  }, [days, weeks])

  const monthStartWeeks = useMemo(() => {
    return monthStarts.map((item) => item.week).filter((week, index) => index > 0)
  }, [monthStarts])

  const weekLeft = (week: number) => {
    const boundariesBefore = monthStartWeeks.filter((startWeek) => startWeek < week).length
    return week * weekColumnWidth + boundariesBefore * monthGapWidth
  }

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
        <div className="min-w-[940px]">
          <div className="relative h-6 ml-8">
            {monthStarts.map((item) => (
              <span
                key={`${item.month}-${item.week}`}
                className="absolute text-xs text-muted-foreground"
                style={{ left: `${weekLeft(item.week)}px` }}
              >
                {item.month}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="w-7 grid grid-rows-7 gap-1">
              {weekdayLabels.map((label, rowIndex) => (
                <div key={label} className="h-3.5 text-[10px] leading-3 text-muted-foreground">
                  {rowIndex % 2 === 1 ? label : ''}
                </div>
              ))}
            </div>

            <div className="grid grid-flow-col auto-cols-max gap-1">
              {weeks.map((week, colIndex) => (
                <div
                  key={colIndex}
                  className={`grid grid-rows-7 gap-1 ${monthStartWeeks.includes(colIndex) ? 'ml-2' : ''}`}
                >
                  {week.map((day) => {
                    const cellStyle = styleForCell(day.githubLevel, day.leetcodeLevel)
                    const titleText = `${day.date}: GitHub ${day.githubCount}, LeetCode ${day.leetcodeCount}`

                    return (
                      <div
                        key={day.date}
                        title={titleText}
                        className={`h-3.5 w-3.5 rounded-[3px] border ${cellStyle.className}`}
                        style={cellStyle.style}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
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
