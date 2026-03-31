import { Header } from '@/components/header'
import { ResumeSection } from '@/components/resume-section'
import { Footer } from '@/components/footer'

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <div className="pt-24">
        <ResumeSection />
      </div>
      <Footer />
    </main>
  )
}
