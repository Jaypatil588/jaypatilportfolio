'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OSWindowProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  windowClassName?: string
  headerColor?: string
  defaultPosition?: { x: number; y: number }
  isActive?: boolean
  onFocus?: () => void
  zIndex?: number
  minimized?: boolean
  onMinimize?: () => void
  onClose?: () => void
}

export function OSWindow({
  title,
  icon,
  children,
  className,
  windowClassName,
  headerColor = 'bg-gradient-to-r from-[#ff6b9d]/90 via-[#c44cce]/90 to-[#5e60ce]/90',
  isActive = true,
  onFocus,
  zIndex = 10,
  onMinimize,
  onClose,
}: OSWindowProps) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <motion.div
      className={cn(
        'absolute rounded-xl overflow-hidden shadow-2xl',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        !isActive && 'opacity-95',
        windowClassName
      )}
      style={{ zIndex }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      onPointerDown={onFocus}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}
    >
      {/* Window header with traffic lights */}
      <div className={cn('flex items-center gap-2 px-3 py-2 backdrop-blur-xl', headerColor)}>
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors border border-[#e0443e]/50 flex items-center justify-center group"
            aria-label="Close"
          >
            <span className="hidden group-hover:block text-[8px] text-[#4d0000] font-bold">x</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMinimize?.()
            }}
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors border border-[#dea123]/50 flex items-center justify-center group"
            aria-label="Minimize"
          >
            <span className="hidden group-hover:block text-[8px] text-[#995700] font-bold">-</span>
          </button>
          <button className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors border border-[#1aab29]/50 flex items-center justify-center group" aria-label="Maximize">
            <span className="hidden group-hover:block text-[8px] text-[#006500] font-bold">+</span>
          </button>
        </div>
        
        {/* Window title with icon */}
        <div className="flex items-center gap-2 flex-1 justify-center -ml-8">
          {icon && <span className="text-white/90">{icon}</span>}
          <span className="text-sm font-medium text-white/90 truncate">{title}</span>
        </div>
      </div>
      
      {/* Window content */}
      <div className={cn('bg-white/95 backdrop-blur-xl', className)}>
        {children}
      </div>
    </motion.div>
  )
}
