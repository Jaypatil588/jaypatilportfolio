'use client'

import { FolderGit2, Briefcase, Activity, Github, FileText } from 'lucide-react'
import { useWindowManager } from './window-manager'
import { portfolioData } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

const APP_ICONS = [
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderGit2,
    gradient: 'from-[#667eea] to-[#764ba2]',
    type: 'window' as const,
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Briefcase,
    gradient: 'from-[#f093fb] to-[#f5576c]',
    type: 'window' as const,
  },
  {
    id: 'heatmap',
    label: 'Activity',
    icon: Activity,
    gradient: 'from-[#43e97b] to-[#38f9d7]',
    type: 'window' as const,
  },
  {
    id: 'github-link',
    label: 'GitHub',
    icon: Github,
    gradient: 'from-[#24292e] to-[#40464f]',
    type: 'link' as const,
    href: portfolioData.github,
  },
  {
    id: 'resume',
    label: 'Resume',
    icon: FileText,
    gradient: 'from-[#4facfe] to-[#00f2fe]',
    type: 'link' as const,
    href: '/resume.pdf',
  },
]

export function DesktopIcons() {
  const { openWindow } = useWindowManager()

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1 z-10 pointer-events-auto">
      {APP_ICONS.map((item) => {
        const Icon = item.icon
        const content = (
          <div className={cn(
            'flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer',
            'hover:bg-white/10 active:bg-white/15 transition-all group w-20'
          )}>
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br',
              'group-hover:scale-105 group-active:scale-95 transition-transform',
              item.gradient
            )}>
              <Icon className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
            <span className="text-[11px] font-medium text-white text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-1">
              {item.label}
            </span>
          </div>
        )

        if (item.type === 'link') {
          return (
            <a
              key={item.id}
              href={item.href}
              target={item.href?.startsWith('http') ? '_blank' : undefined}
              rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {content}
            </a>
          )
        }

        return (
          <button key={item.id} onClick={() => openWindow(item.id)}>
            {content}
          </button>
        )
      })}
    </div>
  )
}
