'use client'

import { WindowManagerProvider } from './window-manager'
import { AboutWindow } from './about-window'
import { RAGWindow } from './rag-window'
import { ProjectsWindow } from './projects-window'
import { ExperienceWindow } from './experience-window'
import { HeatmapWindow } from './heatmap-window'
import { Dock } from './dock'

// Initial window states
const initialWindows = [
  { id: 'about', state: 'open' as const },
  { id: 'chat', state: 'open' as const },
  { id: 'projects', state: 'minimized' as const, isLoading: true },
  { id: 'experience', state: 'minimized' as const, isLoading: true },
  { id: 'heatmap', state: 'minimized' as const, isLoading: true },
]

export function DesktopContent() {
  return (
    <WindowManagerProvider initialWindows={initialWindows}>
      {/* Windows */}
      <AboutWindow />
      <RAGWindow />
      <ProjectsWindow />
      <ExperienceWindow />
      <HeatmapWindow />

      {/* Dock/Taskbar */}
      <Dock />
    </WindowManagerProvider>
  )
}
