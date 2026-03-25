'use client'

import { FileText, Download, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

export function ResumeSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-sm text-primary font-medium mb-4">
            Resume
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            View My <span className="gradient-text">Full Resume</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Download or view my complete resume with detailed experience and qualifications
          </p>
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {/* Resume Preview */}
          <div className="glass rounded-2xl overflow-hidden hover-glow">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/50 bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Jay_Patil_Resume.pdf</h3>
                  <p className="text-xs text-muted-foreground">Software Engineer Resume</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/80 hover:bg-secondary text-sm font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </motion.a>
                <motion.a
                  href="/resume.pdf"
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all shadow-lg shadow-primary/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </motion.a>
              </div>
            </div>

            {/* PDF Embed */}
            <div className="aspect-[8.5/11] w-full bg-secondary/20">
              <iframe
                src="/resume.pdf"
                className="w-full h-full"
                title="Resume PDF"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
