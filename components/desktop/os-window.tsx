'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useWindowManager } from './window-manager'

interface OSWindowProps {
  id: string
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  windowClassName?: string
  headerColor?: string
  defaultPosition?: { x: number | string; y: number | string }
  defaultSize?: { width: string | number; height: string | number }
}

export function OSWindow({
  id,
  title,
  icon,
  children,
  className,
  windowClassName,
  headerColor = 'bg-gradient-to-r from-[#ff6b9d]/90 via-[#c44cce]/90 to-[#5e60ce]/90',
  defaultPosition = { x: 0, y: 0 },
  defaultSize,
}: OSWindowProps) {
  const { windows, activeWindowId, minimizeWindow, maximizeWindow, closeWindow, focusWindow, getWindowState } = useWindowManager()
  const windowInfo = windows.get(id)
  const windowState = getWindowState(id)
  const isActive = activeWindowId === id
  const zIndex = windowInfo?.zIndex ?? 10

  const [position, setPosition] = useState<{ x: number | string; y: number | string }>(defaultPosition)
  const [hasDragged, setHasDragged] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setHasDragged(true)
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
    if (windowState === 'maximized') return
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      focusWindow(id)
    }
  }

  if (windowState === 'minimized') {
    return null
  }

  const isMaximized = windowState === 'maximized'

  return (
    <div
      ref={windowRef}
      className={cn(
        'rounded-xl overflow-hidden shadow-2xl transition-all duration-300',
        isDragging ? 'cursor-grabbing shadow-3xl' : 'cursor-default',
        'animate-in fade-in zoom-in-95 duration-300',
        isActive ? 'ring-2 ring-white/20' : 'opacity-95',
        isMaximized ? 'fixed inset-4 !left-4 !top-12' : 'absolute',
        windowClassName
      )}
      style={isMaximized ? { zIndex: zIndex + 100 } : { 
        left: hasDragged ? position.x : defaultPosition.x,
        top: hasDragged ? position.y : defaultPosition.y,
        width: defaultSize?.width,
        height: defaultSize?.height,
        zIndex,
      }}
      onClick={() => focusWindow(id)}
    >
      {/* Window header with traffic lights */}
      <div 
        className={cn(
          'flex items-center gap-2 px-3 py-2 backdrop-blur-xl select-none',
          isMaximized ? 'cursor-default' : 'cursor-grab',
          headerColor
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(id)
            }}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors border border-[#e0443e]/50 flex items-center justify-center group"
            aria-label="Close"
          >
            <span className="hidden group-hover:block text-[8px] text-[#4d0000] font-bold">x</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              minimizeWindow(id)
            }}
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors border border-[#dea123]/50 flex items-center justify-center group"
            aria-label="Minimize"
          >
            <span className="hidden group-hover:block text-[8px] text-[#995700] font-bold">-</span>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              maximizeWindow(id)
            }}
            className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors border border-[#1aab29]/50 flex items-center justify-center group" 
            aria-label="Maximize"
          >
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
      <div className={cn('bg-white/95 backdrop-blur-xl h-full', className)}>
        {children}
      </div>
    </div>
  )
}
