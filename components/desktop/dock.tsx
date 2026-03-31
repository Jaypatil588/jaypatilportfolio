'use client'

import { User, MessageSquare, FolderGit2, FileText, Mail, Github } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'

const dockItems = [
  { id: 'about', icon: <User className="w-5 h-5" />, label: 'About Me', gradient: 'from-[#ff9a9e] to-[#fecfef]' },
  { id: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Ask Me', gradient: 'from-[#a8edea] to-[#fed6e3]' },
  { id: 'github', icon: <Github className="w-5 h-5" />, label: 'GitHub', gradient: 'from-[#667eea] to-[#764ba2]', href: portfolioData.github },
  { id: 'resume', icon: <FileText className="w-5 h-5" />, label: 'Resume', gradient: 'from-[#4facfe] to-[#00f2fe]', href: '/resume.pdf' },
  { id: 'contact', icon: <Mail className="w-5 h-5" />, label: 'Contact', gradient: 'from-[#43e97b] to-[#38f9d7]', href: `mailto:${portfolioData.email}` },
]

export function Dock() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <div className="flex items-end gap-1 px-3 py-2 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
        {dockItems.map((item) => {
          const Component = item.href ? 'a' : 'button'
          return (
            <Component
              key={item.id}
              href={item.href}
              target={item.href?.startsWith('http') ? '_blank' : undefined}
              rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 hover:bg-white/30 focus:outline-none group hover:-translate-y-2 hover:scale-110"
              title={item.label}
            >
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${item.gradient}`}>
                <span className="text-white drop-shadow-sm">{item.icon}</span>
              </div>
              
              {/* Tooltip */}
              <span className="absolute -top-8 px-2 py-1 text-xs font-medium text-white bg-black/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </Component>
          )
        })}
      </div>
    </div>
  )
}
