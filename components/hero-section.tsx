'use client'

import { Github, Linkedin, Mail, MapPin, FileText, Download, Sparkles, ChevronDown } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { RagChat } from './rag-chat'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-glow" />
      </div>

      {/* Hero Content */}
      <div className="min-h-screen flex flex-col justify-center py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Introduction */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="space-y-4">
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="w-4 h-4" />
                  {portfolioData.title}
                </motion.div>
                
                <motion.h1 
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-foreground">Hi, I&apos;m </span>
                  <span className="gradient-text">{portfolioData.name.split(' ')[0]}</span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {portfolioData.tagline}
                </motion.p>
              </div>
              
              <motion.p 
                className="text-lg text-muted-foreground leading-relaxed max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {portfolioData.summary}
              </motion.p>

              <motion.div 
                className="flex items-center gap-2 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span>{portfolioData.location}</span>
              </motion.div>

              {/* Social Links */}
              <motion.div 
                className="flex flex-wrap items-center gap-3 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
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

              {/* Resume CTA */}
              <motion.div
                className="flex flex-wrap gap-4 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
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

            {/* Right Column - Animated Visual */}
            <motion.div 
              className="hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              <div className="relative w-80 h-80">
                {/* Animated rings */}
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-spin-slow" />
                <div className="absolute inset-4 border-2 border-primary/30 rounded-full animate-spin-slow-reverse" />
                <div className="absolute inset-8 border-2 border-primary/40 rounded-full animate-spin-slow" />
                
                {/* Center content */}
                <div className="absolute inset-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-5xl font-bold gradient-text">4+</div>
                    <div className="text-sm text-muted-foreground mt-1">Years of</div>
                    <div className="text-sm text-muted-foreground">Experience</div>
                  </div>
                </div>
                
                {/* Floating tech badges */}
                <motion.div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Python
                </motion.div>
                <motion.div 
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  AWS
                </motion.div>
                <motion.div 
                  className="absolute top-1/2 -left-4 -translate-y-1/2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary"
                  animate={{ x: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.25 }}
                >
                  React
                </motion.div>
                <motion.div 
                  className="absolute top-1/2 -right-4 -translate-y-1/2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.75 }}
                >
                  Kubernetes
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs font-medium">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>

      {/* Full Width RAG Chat Section */}
      <div className="relative z-10 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold gradient-text mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Ask Me Anything
              </motion.h2>
              <motion.p 
                className="text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Curious about my experience, skills, or projects? Chat with my RAG-powered AI assistant to learn more about me.
              </motion.p>
            </div>
            <RagChat fullWidth />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
