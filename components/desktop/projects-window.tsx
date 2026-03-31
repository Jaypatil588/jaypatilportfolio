'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useWindowManager } from './window-manager'
import { cn } from '@/lib/utils'

interface GithubProject {
  id: number
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  topics: string[]
  image?: string
}

export function ProjectsWindow() {
  const [projects, setProjects] = useState<GithubProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const { setWindowLoading, getWindowState } = useWindowManager()
  
  const windowState = getWindowState('projects')
  const isMaximized = windowState === 'maximized'

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        setWindowLoading('projects', true)
        const response = await fetch('/api/github')
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        
        const data = await response.json()
        const repos = Array.isArray(data?.repos) ? data.repos : []
        setProjects(repos)
      } catch (err) {
        console.error('[v0] Projects fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setProjects([])
      } finally {
        setIsLoading(false)
        setWindowLoading('projects', false)
      }
    }

    fetchProjects()
  }, [setWindowLoading])

  const handlePrev = () => {
    if (projects.length === 0) return
    setActiveIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const handleNext = () => {
    if (projects.length === 0) return
    setActiveIndex((prev) => (prev + 1) % projects.length)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    const dragEnd = e.clientX
    const diff = dragStart - dragEnd
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
  }

  if (windowState === 'minimized' || windowState === 'closed') return null

  return (
    <div
      className="fixed inset-0 bg-[#0f0f1a] z-40 flex flex-col"
      style={isMaximized ? { zIndex: 40 } : {}}
    >
      {/* Header */}
      <div className="h-12 bg-[#1a1a2e]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-6 justify-between shrink-0">
        <h1 className="text-lg font-semibold text-white">Projects</h1>
        <span className="text-sm text-white/50">
          {projects.length > 0 ? `${activeIndex + 1} / ${projects.length}` : 'Loading...'}
        </span>
      </div>

      {/* Main Carousel */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/70">Loading projects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-red-400 text-center px-8">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/60">No projects found</p>
          </div>
        ) : (
          <>
            {/* Left Nav Area */}
            <button
              onClick={handlePrev}
              className="absolute left-0 top-0 bottom-0 w-32 flex items-center justify-start pl-6 hover:bg-gradient-to-r hover:from-black/30 hover:to-transparent group z-10 transition-all"
            >
              <ChevronLeft className="w-12 h-12 text-white/20 group-hover:text-white/60 transition-colors" />
            </button>

            {/* Right Nav Area */}
            <button
              onClick={handleNext}
              className="absolute right-0 top-0 bottom-0 w-32 flex items-center justify-end pr-6 hover:bg-gradient-to-l hover:from-black/30 hover:to-transparent group z-10 transition-all"
            >
              <ChevronRight className="w-12 h-12 text-white/20 group-hover:text-white/60 transition-colors" />
            </button>

            {/* Cards Container */}
            <div 
              className="w-full h-full flex items-center justify-center px-32 select-none"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDragging(false)}
            >
              {projects.map((project, idx) => {
                const diff = idx - activeIndex
                const normalizedDiff = ((diff % projects.length) + projects.length) % projects.length
                const isBack = normalizedDiff > projects.length / 2
                const adjustedDiff = isBack ? normalizedDiff - projects.length : normalizedDiff

                const opacity = adjustedDiff === 0 ? 1 : Math.max(0, 1 - Math.abs(adjustedDiff) * 0.3)
                const scale = adjustedDiff === 0 ? 1 : 0.85 - Math.abs(adjustedDiff) * 0.05
                const translateX = adjustedDiff * 50

                return (
                  <a
                    key={project.id}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'absolute w-80 h-96 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500',
                      'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/[0.06]',
                      adjustedDiff === 0 ? 'cursor-pointer hover:shadow-purple-500/30 hover:border-purple-500/30' : 'pointer-events-none'
                    )}
                    style={{
                      opacity,
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      zIndex: 10 - Math.abs(adjustedDiff),
                    }}
                  >
                    {/* Image Section */}
                    <div className="w-full h-48 bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#16213e]" />
                      <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                        {project.language === 'TypeScript' ? '📘' :
                         project.language === 'JavaScript' ? '📒' :
                         project.language === 'Python' ? '🐍' :
                         project.language === 'Go' ? '🐹' :
                         project.language === 'Rust' ? '🦀' :
                         '💻'}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 h-48 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                          {project.name}
                        </h3>
                        <p className="text-sm text-white/60 line-clamp-3 min-h-[60px]">
                          {project.description || 'Project description will be added from database'}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                        <div className="flex gap-4 text-xs text-white/50">
                          <span>⭐ {project.stars}</span>
                          <span>🔀 {project.forks}</span>
                        </div>
                        {project.language && (
                          <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                            {project.language}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Bottom Indicator */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
              {projects.slice(0, Math.min(10, projects.length)).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all pointer-events-auto',
                    idx === activeIndex ? 'bg-purple-500 w-6' : 'bg-white/30 hover:bg-white/50'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
