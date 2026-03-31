import { DesktopFrame } from '@/components/desktop/desktop-frame'
import { AboutWindow } from '@/components/desktop/about-window'
import { RAGWindow } from '@/components/desktop/rag-window'
import { ProjectsWindow } from '@/components/desktop/projects-window'
import { Dock } from '@/components/desktop/dock'

export default function Home() {
  return (
    <DesktopFrame>
      {/* Windows */}
      <AboutWindow />
      <RAGWindow />
      <ProjectsWindow />

      {/* Dock/Taskbar */}
      <Dock />
    </DesktopFrame>
  )
}
