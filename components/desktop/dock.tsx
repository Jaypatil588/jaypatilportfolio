'use client'

import { User, FolderGit2, Briefcase, Activity, FileText, Mail, Github } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { useWindowManager } from './window-manager'
import { cn } from '@/lib/utils'

const windowItems = [
  { id: 'main', icon: <User className="w-5 h-5" />, label: 'Portfolio', gradient: 'from-[#4a90d9] to-[#357abd]' },
  { id: 'projects', icon: <FolderGit2 className="w-5 h-5" />, label: 'Projects', gradient: 'from-[#667eea] to-[#764ba2]' },
  { id: 'experience', icon: <Briefcase className="w-5 h-5" />, label: 'Experience', gradient: 'from-[#f093fb] to-[#f5576c]' },
  { id: 'heatmap', icon: <Activity className="w-5 h-5" />, label: 'Activity', gradient: 'from-[#43e97b] to-[#38f9d7]' },
]

const linkItems = [
  { id: 'github-link', icon: <Github className="w-5 h-5" />, label: 'GitHub', gradient: 'from-[#24292e] to-[#040d21]', href: portfolioData.github },
  { id: 'resume', icon: <FileText className="w-5 h-5" />, label: 'Resume', gradient: 'from-[#4facfe] to-[#00f2fe]', href: '/resume.pdf' },
  { id: 'contact', icon: <Mail className="w-5 h-5" />, label: 'Contact', gradient: 'from-[#fa709a] to-[#fee140]', href: `mailto:${portfolioData.email}` },
]

export function Dock() {
  const { openWindow, getWindowState, isWindowLoading } = useWindowManager()

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <div className="flex items-end gap-1 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        {/* Window items */}
        {windowItems.map((item) => {
          const state = getWindowState(item.id)
          const isOpen = state === 'open' || state === 'maximized'
          const loading = isWindowLoading(item.id)
          
          return (
            <button
              key={item.id}
              onClick={() => openWindow(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200',
                'hover:bg-white/20 focus:outline-none group hover:-translate-y-2 hover:scale-110',
                loading && 'animate-dock-bounce'
              )}
              title={item.label}
            >
              <div className={cn(
                'w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br transition-transform',
                item.gradient,
                loading && 'animate-pulse'
              )}>
                <span className="text-white drop-shadow-sm">{item.icon}</span>
              </div>
              
              {/* Active indicator dot */}
              {isOpen && (
                <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-white shadow-lg" />
              )}
              
              {/* Tooltip */}
              <span className="absolute -top-8 px-2 py-1 text-xs font-medium text-white bg-black/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Divider */}
        <div className="w-px h-10 bg-white/20 mx-1" />

        {/* Link items */}
        {linkItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target={item.href?.startsWith('http') ? '_blank' : undefined}
            rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 hover:bg-white/20 focus:outline-none group hover:-translate-y-2 hover:scale-110"
            title={item.label}
          >
            <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${item.gradient}`}>
              <span className="text-white drop-shadow-sm">{item.icon}</span>
            </div>
            
            {/* Tooltip */}
            <span className="absolute -top-8 px-2 py-1 text-xs font-medium text-white bg-black/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
