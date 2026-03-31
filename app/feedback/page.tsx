import { Header } from '@/components/header'
import { LeaveMessageSection } from '@/components/leave-message-section'
import { Footer } from '@/components/footer'

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <div className="pt-24">
        <LeaveMessageSection />
      </div>
      <Footer />
    </main>
  )
}
