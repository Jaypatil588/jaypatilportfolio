'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import { OSWindow } from './os-window'

interface GithubProject {
  id: number
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
}

export function ProjectsWindow() {
  const [projects, setProjects] = useState<GithubProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/github')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch projects')
        }
        
        // Ensure repos is an array
        const repos = Array.isArray(data.repos) ? data.repos : []
        setProjects(repos)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setProjects([]) // Ensure projects is always an array
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <OSWindow 
      title="Projects" 
      icon="🚀" 
      defaultPosition={{ x: 840, y: 20 }}
      defaultSize={{ width: 380, height: 520 }}
      headerColor="bg-gradient-to-r from-[#667eea]/90 to-[#764ba2]/90"
    >
      <div className="h-full flex flex-col bg-gradient-to-br from-amber-50 to-orange-50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <h2 className="text-sm font-semibold text-gray-800">My GitHub Projects</h2>
          <p className="text-xs text-gray-500 mt-1">Click to visit repositories</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading projects...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-orange-300 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-orange-500 flex-shrink-0 mt-0.5" />
                </div>

                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{project.description}</p>

                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {project.language && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                      {project.language}
                    </span>
                  )}
                  {project.stars > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      <Star size={12} />
                      {project.stars}
                    </span>
                  )}
                </div>
              </a>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-600 text-center">No projects found</p>
            </div>
          )}
        </div>
      </div>
    </OSWindow>
  )
}
