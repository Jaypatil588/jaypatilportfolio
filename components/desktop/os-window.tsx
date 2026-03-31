'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OSWindowProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  windowClassName?: string
  headerColor?: string
  defaultPosition?: { x: number; y: number }
  defaultSize?: { width: number; height: number }
  onClose?: () => void
}

export function OSWindow({
  title,
  icon,
  children,
  className,
  windowClassName,
  headerColor = 'bg-gradient-to-r from-[#ff6b9d]/90 via-[#c44cce]/90 to-[#5e60ce]/90',
  defaultPosition = { x: 0, y: 0 },
  defaultSize,
  onClose,
}: OSWindowProps) {
  const [position, setPosition] = useState(defaultPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  return (
    <div
      ref={windowRef}
      className={cn(
        'absolute rounded-xl overflow-hidden shadow-2xl transition-shadow duration-200',
        isDragging ? 'cursor-grabbing shadow-3xl' : 'cursor-default',
        'animate-in fade-in zoom-in-95 duration-300',
        windowClassName
      )}
      style={{ 
        left: position.x,
        top: position.y,
        width: defaultSize?.width,
        height: defaultSize?.height,
        zIndex: isDragging ? 50 : 10,
      }}
    >
      {/* Window header with traffic lights */}
      <div 
        className={cn('flex items-center gap-2 px-3 py-2 backdrop-blur-xl cursor-grab select-none', headerColor)}
        onMouseDown={handleMouseDown}
      >
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
    </div>
  )
}
