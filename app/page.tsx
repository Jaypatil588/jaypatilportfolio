import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { ProjectsSection } from '@/components/projects-section'
import { ExperienceSection } from '@/components/experience-section'
import { Footer } from '@/components/footer'
import { VisitorTracker } from '@/components/visitor-tracker'

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <VisitorTracker />
      <Header />
      <HeroSection />
      <section id="experience">
        <ExperienceSection />
      </section>
      <section id="projects">
        <ProjectsSection />
      </section>
      <Footer />
    </main>
  )
}
