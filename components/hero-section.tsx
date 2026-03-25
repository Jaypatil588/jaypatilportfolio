'use client'

import { Github, Linkedin, Mail, MapPin, FileText, Download } from 'lucide-react'
import Image from 'next/image'
import { portfolioData } from '@/lib/portfolio-data'
import { RagChat } from './rag-chat'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

export function HeroSection() {
  const router = useRouter()
  const clickTimesRef = useRef<number[]>([])

  const handleProfileClick = () => {
    const now = Date.now()
    const recentClicks = [...clickTimesRef.current, now].filter((timestamp) => now - timestamp < 1200)
    clickTimesRef.current = recentClicks

    if (recentClicks.length >= 3) {
      clickTimesRef.current = []
      router.push('/auth')
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/12 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-300" />
      </div>

      <div className="min-h-screen pt-24 pb-0 px-0 relative z-10">
        <div className="w-full h-full">
          <div className="grid lg:grid-cols-2 gap-0 items-stretch min-h-[calc(100vh-6rem)]">
            <motion.div
              className="flex items-center justify-center px-4 py-8 lg:py-12"
              initial={{ opacity: 0, x: -45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="w-full max-w-[620px] flex flex-col items-center text-center space-y-8">
                <div className="space-y-4 flex flex-col items-center">
                <motion.button
                  type="button"
                  onClick={handleProfileClick}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleProfileClick()
                    }
                  }}
                  title="Triple-click to open auth"
                  aria-label="Profile photo. Triple-click to open auth"
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl shadow-primary/20 mx-auto cursor-pointer transition-all hover:scale-[1.03] hover:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Image
                    src="/mugshot.webp"
                    alt="Jay Patil profile photo"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover object-[50%_28%]"
                    sizes="(max-width: 768px) 160px, 192px"
                    priority
                  />
                </motion.button>

                <motion.h1
                  className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-balance text-center"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className="text-foreground">Hi, I&apos;m </span>
                  <span className="gradient-text">{portfolioData.name.split(' ')[0]}</span>
                </motion.h1>

                <motion.p
                  className="text-xl text-muted-foreground"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {portfolioData.tagline}
                </motion.p>
                </div>

                <motion.p
                  className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  {portfolioData.summary}
                </motion.p>

                <motion.div
                  className="flex items-center gap-2 text-muted-foreground"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{portfolioData.location}</span>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center justify-center gap-3"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <a
                    href={portfolioData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl glass hover-glow text-sm font-medium group"
                  >
                    <Github className="w-5 h-5 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">GitHub</span>
                  </a>
                  <a
                    href={portfolioData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl glass hover-glow text-sm font-medium group"
                  >
                    <Linkedin className="w-5 h-5 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">LinkedIn</span>
                  </a>
                  <a
                    href={`mailto:${portfolioData.email}`}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl glass hover-glow text-sm font-medium group"
                  >
                    <Mail className="w-5 h-5 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">Email</span>
                  </a>
                </motion.div>

                <motion.div
                  className="flex flex-wrap justify-center gap-4"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                >
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 text-sm font-semibold shadow-lg shadow-primary/25"
                  >
                    <FileText className="w-5 h-5" />
                    View Resume
                  </a>
                  <a
                    href="/resume.pdf"
                    download
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary/10 transition-all hover:scale-105 text-sm font-semibold"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </a>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="relative min-h-[58vh] lg:min-h-[calc(100vh-6rem)]"
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut', delay: 0.2 }}
            >
              <RagChat
                className="h-full lg:rounded-none lg:border-l lg:border-r-0"
                heightClass="h-[58vh] min-h-[520px] lg:h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-6rem)] lg:max-h-none"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
