'use client'

import { WindowManagerProvider } from './window-manager'
import { MainWindow } from './main-window'
import { ProjectsWindow } from './projects-window'
import { ExperienceWindow } from './experience-window'
import { HeatmapWindow } from './heatmap-window'
import { DesktopIcons } from './desktop-icons'
import { Dock } from './dock'

// Initial window states — main open, others minimized (bounce in dock)
const initialWindows = [
  { id: 'main', state: 'open' as const },
  { id: 'projects', state: 'minimized' as const, isLoading: true },
  { id: 'experience', state: 'minimized' as const, isLoading: true },
  { id: 'heatmap', state: 'minimized' as const, isLoading: true },
]

export function DesktopContent() {
  return (
    <WindowManagerProvider initialWindows={initialWindows}>
      {/* Desktop icons (top-left corner) */}
      <DesktopIcons />

      {/* Windows */}
      <MainWindow />
      <ProjectsWindow />
      <ExperienceWindow />
      <HeatmapWindow />

      {/* Dock */}
      <Dock />
    </WindowManagerProvider>
  )
}
