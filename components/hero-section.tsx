'use client'

import { Github, Linkedin, Mail, MapPin, FileText, Download, Sparkles } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { RagChat } from './rag-chat'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { CursorSpotlight } from './cursor-spotlight'

export function HeroSection() {
  const cardX = useMotionValue(0)
  const cardY = useMotionValue(0)

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
              className="flex flex-col justify-center space-y-8 px-6 md:px-12 lg:px-16 xl:px-20 py-10 lg:py-16"
              initial={{ opacity: 0, x: -45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className="space-y-4">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary font-medium"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Sparkles className="w-4 h-4" />
                  {portfolioData.title}
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-balance"
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
                className="flex flex-wrap items-center gap-3"
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
                className="flex flex-wrap gap-4"
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
            </motion.div>

            <motion.div
              className="relative min-h-[58vh] lg:min-h-[calc(100vh-6rem)]"
              initial={{ opacity: 0, x: 45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut', delay: 0.2 }}
            >
              <CursorSpotlight className="relative h-full rounded-none">
                <motion.div
                  className="h-full"
                  style={{
                    rotateX: useMotionTemplate`${cardY}deg`,
                    rotateY: useMotionTemplate`${cardX}deg`,
                    transformPerspective: '1200px',
                  }}
                  onMouseMove={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect()
                    const px = (event.clientX - bounds.left) / bounds.width
                    const py = (event.clientY - bounds.top) / bounds.height
                    cardX.set((px - 0.5) * 7)
                    cardY.set((0.5 - py) * 7)
                  }}
                  onMouseLeave={() => {
                    cardX.set(0)
                    cardY.set(0)
                  }}
                >
                  <RagChat
                    className="h-full lg:rounded-none lg:border-l lg:border-r-0"
                    heightClass="h-[58vh] min-h-[520px] lg:h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-6rem)] lg:max-h-none"
                  />
                </motion.div>
              </CursorSpotlight>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
