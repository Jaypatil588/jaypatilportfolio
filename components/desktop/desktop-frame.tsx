'use client'

import { ReactNode, useEffect, useState } from 'react'

interface DesktopFrameProps {
  children: ReactNode
}

export function DesktopFrame({ children }: DesktopFrameProps) {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#2d1f3d] via-[#1a1a2e] to-[#0f0f1a] flex flex-col overflow-hidden">
      {/* Top Menu Bar - macOS style */}
      <div className="h-7 bg-[#1a1a1a]/90 backdrop-blur-sm flex items-center px-4 shrink-0 border-b border-white/5 z-[200]">
        <div className="flex items-center gap-4 text-[11px] text-white/80">
          <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span className="font-semibold">Portfolio</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">File</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">Edit</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">View</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">Window</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">Help</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-white/80">
          <span>{date}</span>
          <span className="font-medium">{time}</span>
        </div>
      </div>

      {/* Desktop Screen Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b9d] via-[#c44cce] to-[#5e60ce]" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/10 to-pink-600/20 animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Desktop Content */}
        <div className="relative w-full h-full pb-20">
          {children}
        </div>
      </div>
    </div>
  )
}
