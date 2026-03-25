'use client'

import { Github, Linkedin, Mail, Heart, ArrowUp } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { motion } from 'framer-motion'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="py-16 px-4 border-t border-border/50 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Logo & Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-foreground mb-2">
              <span className="gradient-text">{portfolioData.name.split(' ')[0]}</span>
              <span className="text-primary">.</span>
            </h3>
            <p className="text-muted-foreground">{portfolioData.title}</p>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <motion.a
              href={portfolioData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl glass hover-glow flex items-center justify-center group"
              aria-label="GitHub"
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.a>
            <motion.a
              href={portfolioData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl glass hover-glow flex items-center justify-center group"
              aria-label="LinkedIn"
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.a>
            <motion.a
              href={`mailto:${portfolioData.email}`}
              className="w-12 h-12 rounded-xl glass hover-glow flex items-center justify-center group"
              aria-label="Email"
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.a>
          </motion.div>

          {/* Divider */}
          <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Copyright */}
          <motion.div 
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Built with <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> using Next.js & AI
            </p>
            <p className="text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} {portfolioData.name}. All rights reserved.
            </p>
          </motion.div>

          {/* Back to top */}
          <motion.button
            onClick={scrollToTop}
            className="mt-4 p-3 rounded-xl glass hover-glow group"
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
