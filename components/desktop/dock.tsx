'use client'

import { motion } from 'framer-motion'
import { User, MessageSquare, FolderGit2, Briefcase, FileText, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DockItem {
  id: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
}

interface DockProps {
  items?: DockItem[]
  activeWindows?: string[]
  onItemClick?: (id: string) => void
}

const defaultItems: DockItem[] = [
  { id: 'about', icon: <User className="w-6 h-6" />, label: 'About Me' },
  { id: 'chat', icon: <MessageSquare className="w-6 h-6" />, label: 'Ask Me' },
  { id: 'projects', icon: <FolderGit2 className="w-6 h-6" />, label: 'Projects' },
  { id: 'experience', icon: <Briefcase className="w-6 h-6" />, label: 'Experience' },
  { id: 'resume', icon: <FileText className="w-6 h-6" />, label: 'Resume' },
  { id: 'contact', icon: <Mail className="w-6 h-6" />, label: 'Contact' },
]

export function Dock({ items = defaultItems, activeWindows = [], onItemClick }: DockProps) {
  return (
    <motion.div
      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', damping: 20 }}
    >
      <div className="flex items-end gap-1 px-2 py-1.5 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl">
        {items.map((item, index) => {
          const isActive = activeWindows.includes(item.id)
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={cn(
                'relative flex flex-col items-center justify-center p-2 rounded-xl transition-all',
                'hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50',
                'group'
              )}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ y: -8, scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon container with gradient background */}
              <div className={cn(
                'w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg transition-all',
                'bg-gradient-to-br',
                item.id === 'about' && 'from-[#ff9a9e] to-[#fecfef]',
                item.id === 'chat' && 'from-[#a8edea] to-[#fed6e3]',
                item.id === 'projects' && 'from-[#667eea] to-[#764ba2]',
                item.id === 'experience' && 'from-[#f093fb] to-[#f5576c]',
                item.id === 'resume' && 'from-[#4facfe] to-[#00f2fe]',
                item.id === 'contact' && 'from-[#43e97b] to-[#38f9d7]',
              )}>
                <span className="text-white drop-shadow-sm">{item.icon}</span>
              </div>
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
              
              {/* Tooltip */}
              <motion.span
                className="absolute -top-8 px-2 py-1 text-xs font-medium text-white bg-black/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
              >
                {item.label}
              </motion.span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
