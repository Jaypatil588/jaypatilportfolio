'use client'

import { useState, useEffect } from 'react'
import { portfolioData } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'Skills', href: '#skills' },
  { label: 'GitHub', href: '#projects' },
  { label: 'Dashboard', href: '/auth' },
  { label: 'Experience', href: '#experience' },
  { label: 'Resume', href: '/resume.pdf' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass py-4'
          : 'bg-transparent py-6'
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <motion.a 
          href="#" 
          className="text-xl font-bold text-foreground flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="gradient-text">{portfolioData.name.split(' ')[0]}</span>
          <span className="text-primary">.</span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.href === '/resume.pdf' ? '_blank' : undefined}
              rel={link.href === '/resume.pdf' ? 'noopener noreferrer' : undefined}
              className={cn(
                "px-4 py-2 text-sm rounded-lg transition-all",
                link.label === 'Resume' || link.label === 'Dashboard'
                  ? "text-primary font-medium hover:bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <motion.a
          href={`mailto:${portfolioData.email}`}
          className="hidden md:flex px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get in Touch
        </motion.a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="md:hidden glass mt-4 mx-4 rounded-2xl p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`mailto:${portfolioData.email}`}
              className="px-4 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground text-center mt-2"
            >
              Get in Touch
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
