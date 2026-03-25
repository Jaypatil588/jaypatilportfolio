'use client'

import { useMemo } from 'react'

interface HeatmapDay {
  date: string
  count: number
  level: number
}

interface ContributionHeatmapProps {
  title: string
  subtitle: string
  days: HeatmapDay[]
  scheme: 'github' | 'leetcode'
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const colorSchemes: Record<'github' | 'leetcode', Record<number, string>> = {
  github: {
    0: 'bg-[#0b1621] border-[#1c2a38]',
    1: 'bg-[#123924] border-[#1f4f33]',
    2: 'bg-[#1f7a3d] border-[#1f7a3d]',
    3: 'bg-[#2dbf5c] border-[#2dbf5c]',
    4: 'bg-[#67f58e] border-[#67f58e]',
  },
  leetcode: {
    0: 'bg-[#0f1622] border-[#1c2a38]',
    1: 'bg-[#4a3b10] border-[#5f4d14]',
    2: 'bg-[#8e6e12] border-[#8e6e12]',
    3: 'bg-[#d8a719] border-[#d8a719]',
    4: 'bg-[#ffe066] border-[#ffe066]',
  },
}

export function ContributionHeatmap({ title, subtitle, days, scheme }: ContributionHeatmapProps) {
  const weeks = useMemo(() => {
    if (!days.length) return [] as HeatmapDay[][]

    const firstDate = new Date(`${days[0].date}T00:00:00`)
    const start = new Date(firstDate)
    start.setDate(start.getDate() - start.getDay())

    const lastDate = new Date(`${days[days.length - 1].date}T00:00:00`)
    const end = new Date(lastDate)
    end.setDate(end.getDate() + (6 - end.getDay()))

    const dayMap = new Map(days.map((day) => [day.date, day]))
    const columns: HeatmapDay[][] = []

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 7)) {
      const column: HeatmapDay[] = []
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(cursor)
        d.setDate(cursor.getDate() + i)
        const iso = d.toISOString().slice(0, 10)
        column.push(dayMap.get(iso) ?? { date: iso, count: 0, level: 0 })
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

    const labels: Array<{ month: string; week: number }> = []
    const firstYear = new Date(`${days[0].date}T00:00:00`).getFullYear()

    for (let month = 0; month < 12; month += 1) {
      const firstOfMonth = new Date(firstYear, month, 1)
      const diffDays = Math.floor((firstOfMonth.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const week = Math.max(0, Math.floor(diffDays / 7))
      labels.push({ month: firstOfMonth.toLocaleString('en-US', { month: 'short' }), week })
    }

    return labels
  }, [days, weeks])

  const total = days.reduce((sum, day) => sum + day.count, 0)

  return (
    <div className="rounded-2xl glass p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{total} {subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[780px]">
          <div className="relative h-6 ml-8">
            {monthStarts.map((item) => (
              <span
                key={`${item.month}-${item.week}`}
                className="absolute text-xs text-muted-foreground"
                style={{ left: `${item.week * 14}px` }}
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
                <div key={colIndex} className="grid grid-rows-7 gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.count}`}
                      className={`h-3.5 w-3.5 rounded-[3px] border ${colorSchemes[scheme][day.level]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`h-3 w-3 rounded-[3px] border ${colorSchemes[scheme][level]}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
