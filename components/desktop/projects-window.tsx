'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Star, GitFork, ChevronLeft, ChevronRight } from 'lucide-react'
import { OSWindow } from './os-window'
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
}

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#1572B6',
  default: '#6e7681',
}

export function ProjectsWindow() {
  const [projects, setProjects] = useState<GithubProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { setWindowLoading } = useWindowManager()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        setWindowLoading('projects', true)
        const response = await fetch('/api/github')
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch projects')
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

  const projectsList = Array.isArray(projects) ? projects : []

  const nextCard = () => {
    if (projectsList.length === 0) return
    setActiveIndex((prev) => (prev + 1) % projectsList.length)
  }

  const prevCard = () => {
    if (projectsList.length === 0) return
    setActiveIndex((prev) => (prev - 1 + projectsList.length) % projectsList.length)
  }

  const getCardStyle = (index: number) => {
    if (projectsList.length === 0) return { transform: 'none', opacity: 0, zIndex: 0 }
    const diff = index - activeIndex
    const normalizedDiff = ((diff % projectsList.length) + projectsList.length) % projectsList.length
    const isBack = normalizedDiff > projectsList.length / 2
    const adjustedDiff = isBack ? normalizedDiff - projectsList.length : normalizedDiff
    
    const translateX = adjustedDiff * 30
    const translateZ = -Math.abs(adjustedDiff) * 60
    const rotateY = adjustedDiff * -8
    const scale = 1 - Math.abs(adjustedDiff) * 0.08
    const opacity = Math.abs(adjustedDiff) <= 3 ? 1 - Math.abs(adjustedDiff) * 0.2 : 0

    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex: 10 - Math.abs(adjustedDiff),
    }
  }

  return (
    <OSWindow 
      id="projects"
      title="Projects" 
      icon="🚀" 
      defaultPosition={{ x: 100, y: 80 }}
      defaultSize={{ width: 600, height: 480 }}
      headerColor="bg-gradient-to-r from-[#667eea]/90 to-[#764ba2]/90"
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-[#0f172a] to-[#1e293b] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Selected Work</h2>
          <p className="text-xs text-white/60 mt-1">My GitHub repositories</p>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-white/70">Loading projects...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-red-400 text-center px-4">{error}</p>
            </div>
          ) : projectsList.length > 0 ? (
            <div className="h-full flex flex-col">
              {/* 3D Card Stack */}
              <div className="flex-1 relative flex items-center justify-center" style={{ perspective: '1000px' }}>
                <div className="relative w-64 h-80" style={{ transformStyle: 'preserve-3d' }}>
                  {projectsList.slice(0, 10).map((project, index) => {
                    const style = getCardStyle(index)
                    const langColor = languageColors[project.language || ''] || languageColors.default
                    
                    return (
                      <a
                        key={project.id}
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'absolute inset-0 rounded-xl overflow-hidden transition-all duration-500 cursor-pointer',
                          'bg-gradient-to-br from-white to-gray-100 shadow-2xl',
                          'hover:scale-105 hover:shadow-purple-500/30',
                          index === activeIndex ? 'pointer-events-auto' : 'pointer-events-none'
                        )}
                        style={style}
                        onClick={(e) => {
                          if (index !== activeIndex) {
                            e.preventDefault()
                            setActiveIndex(index)
                          }
                        }}
                      >
                        {/* Card gradient header */}
                        <div 
                          className="h-28 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] relative"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${langColor}33 0%, ${langColor}66 100%)`
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl opacity-30">
                              {project.language === 'Python' ? '🐍' : 
                               project.language === 'TypeScript' ? '📘' :
                               project.language === 'JavaScript' ? '📒' :
                               project.language === 'Java' ? '☕' :
                               project.language === 'C++' ? '⚡' : '💻'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Card content */}
                        <div className="p-4 bg-white">
                          {/* Language badge */}
                          {project.language && (
                            <div className="flex items-center gap-2 mb-2">
                              <span 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: langColor }}
                              />
                              <span className="text-xs font-medium text-gray-600">
                                {project.language}
                              </span>
                            </div>
                          )}
                          
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-lg">
                            {project.name}
                          </h3>
                          
                          <p className="text-xs text-gray-600 line-clamp-2 mb-3 min-h-[32px]">
                            {project.description || 'No description available'}
                          </p>
                          
                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-500" />
                              {project.stars}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork size={12} />
                              {project.forks}
                            </span>
                            <ExternalLink size={12} className="ml-auto text-purple-500" />
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 pb-4">
                <button
                  onClick={prevCard}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-1.5">
                  {projectsList.slice(0, 10).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all',
                        index === activeIndex 
                          ? 'bg-purple-500 w-6' 
                          : 'bg-white/30 hover:bg-white/50'
                      )}
                    />
                  ))}
                </div>
                
                <button
                  onClick={nextCard}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-white/60 text-center">No projects found</p>
            </div>
          )}
        </div>
      </div>
    </OSWindow>
  )
}
