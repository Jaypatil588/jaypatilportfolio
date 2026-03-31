'use client'

import { DesktopFrame } from '@/components/desktop/desktop-frame'
import { AboutWindow } from '@/components/desktop/about-window'
import { RAGWindow } from '@/components/desktop/rag-window'
import { ProjectsWindow } from '@/components/desktop/projects-window'
import { Dock } from '@/components/desktop/dock'

export default function DesktopPage() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden flex items-center justify-center p-4">
      <DesktopFrame>
        {/* Desktop Content */}
        <div className="relative w-full h-full">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-60" />
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-grid-pattern" />

          {/* Windows */}
          <div className="absolute inset-0">
            <AboutWindow />
            <RAGWindow />
            <ProjectsWindow />
          </div>

          {/* Dock/Taskbar */}
          <Dock />
        </div>
      </DesktopFrame>
    </div>
  )
}
