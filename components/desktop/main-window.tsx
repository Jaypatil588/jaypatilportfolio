'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Github, Linkedin, MapPin, Download,
  Bot, FolderGit2, Briefcase, Activity,
  FileText, Mail, ChevronRight, Send,
  Terminal, Code2, Layers
} from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { useWindowManager } from './window-manager'
import { cn } from '@/lib/utils'

type ActiveView = 'home' | 'about' | 'contact'

const NAV_LINKS: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Terminal className="w-3.5 h-3.5" /> },
  { id: 'about', label: 'About', icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: 'contact', label: 'Contact', icon: <Mail className="w-3.5 h-3.5" /> },
]

const WINDOW_LINKS = [
  { id: 'projects', label: 'Projects', icon: FolderGit2, color: 'text-purple-400' },
  { id: 'experience', label: 'Experience', icon: Briefcase, color: 'text-blue-400' },
  { id: 'heatmap', label: 'Activity', icon: Activity, color: 'text-emerald-400' },
]

const SKILL_COLORS: Record<string, string> = {
  Python: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  TypeScript: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  JavaScript: 'bg-yellow-400/15 text-yellow-200 border-yellow-400/30',
  Java: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Go: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  Rust: 'bg-orange-600/15 text-orange-400 border-orange-600/30',
  default: 'bg-white/10 text-white/70 border-white/20',
}

function getSkillColor(skill: string) {
  return SKILL_COLORS[skill] ?? SKILL_COLORS.default
}

export function MainWindow() {
  const [view, setView] = useState<ActiveView>('home')
  const [chatInput, setChatInput] = useState('')
  const { minimizeWindow, maximizeWindow, closeWindow, getWindowState, openWindow } = useWindowManager()
  const windowState = getWindowState('main')
  const isMaximized = windowState === 'maximized'

  if (windowState === 'minimized') return null

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-lg md:rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.6)]',
        isMaximized ? 'fixed inset-2 md:inset-4' : 'absolute'
      )}
      style={isMaximized
        ? { zIndex: 50 }
        : { left: '100px', top: 0, width: '80%', height: 'calc(100% - 28px)', zIndex: 20 }
      }
    >
      {/* ── macOS Title Bar ── */}
      <div className="h-10 bg-[#2a2a2a]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 gap-3 shrink-0 select-none">
        {/* Traffic lights */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => closeWindow('main')}
            className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/50 hover:brightness-90 transition-all flex items-center justify-center group"
          >
            <span className="hidden group-hover:block text-[7px] font-black text-[#4d0000]">✕</span>
          </button>
          <button
            onClick={() => minimizeWindow('main')}
            className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123]/50 hover:brightness-90 transition-all flex items-center justify-center group"
          >
            <span className="hidden group-hover:block text-[7px] font-black text-[#7a4000]">−</span>
          </button>
          <button
            onClick={() => maximizeWindow('main')}
            className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/50 hover:brightness-90 transition-all flex items-center justify-center group"
          >
            <span className="hidden group-hover:block text-[7px] font-black text-[#004d00]">+</span>
          </button>
        </div>

        <span className="flex-1 text-center text-[13px] font-medium text-white/60 pointer-events-none truncate">
          Jay Patil — Portfolio
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden bg-[#1c1c1e] flex-col lg:flex-row">

        {/* ── Sidebar ── */}
        <aside className="w-52 bg-[#161618] flex flex-col shrink-0 border-r border-white/[0.06] lg:border-r lg:border-b-0 border-b lg:border-b-0 max-h-32 lg:max-h-none lg:w-52 w-full overflow-x-auto lg:overflow-y-auto">
          {/* Profile block */}
          <div className="p-4 border-b border-white/[0.06] lg:border-b lg:border-r-0 border-r lg:border-b hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10 shrink-0">
                <Image
                  src="/mugshot.jpeg"
                  alt={portfolioData.name}
                  width={36} height={36}
                  className="w-full h-full object-cover object-[50%_28%]"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white leading-tight truncate">{portfolioData.name.split(' ')[0]} {portfolioData.name.split(' ')[1]}</p>
                <p className="text-[11px] text-white/40 truncate">{portfolioData.title.split(',')[0]}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2 lg:space-y-0.5 flex lg:flex-col gap-1 lg:gap-0 overflow-x-auto lg:overflow-x-hidden">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 pt-2 pb-1">Menu</p>
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => setView(link.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal',
                  view === link.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}
              >
                <span className={view === link.id ? 'text-white' : 'text-white/40'}>{link.icon}</span>
                {link.label}
                {view === link.id && <ChevronRight className="w-3 h-3 ml-auto text-white/40 hidden lg:block" />}
              </button>
            ))}

            <div className="my-3 border-t border-white/[0.06] mx-1" />

            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 pb-1">Windows</p>
            {WINDOW_LINKS.map(w => {
              const Icon = w.icon
              return (
                <button
                  key={w.id}
                  onClick={() => openWindow(w.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all text-left"
                >
                  <Icon className={cn('w-3.5 h-3.5 shrink-0', w.color)} />
                  {w.label}
                </button>
              )
            })}

            <div className="my-3 border-t border-white/[0.06] mx-1" />

            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 pb-1">Links</p>
            {[
              { href: portfolioData.github, icon: Github, label: 'GitHub' },
              { href: portfolioData.linkedin, icon: Linkedin, label: 'LinkedIn' },
              { href: '/resume.pdf', icon: FileText, label: 'Resume' },
              { href: `mailto:${portfolioData.email}`, icon: Mail, label: 'Email' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
              >
                <Icon className="w-3.5 h-3.5 shrink-0 text-white/30" />
                {label}
              </a>
            ))}
          </nav>

          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-white/20 shrink-0" />
              <p className="text-[11px] text-white/30 truncate">{portfolioData.location}</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#1c1c1e]">

          {/* HOME — About left + Ask Jay right */}
          {view === 'home' && (
            <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

              {/* Left: About */}
              <div className="flex-1 overflow-y-auto p-7 border-r border-white/[0.06] min-w-0 lg:border-r lg:border-b-0 border-b lg:border-b-0 order-2 lg:order-1">
                {/* Hero */}
                <div className="flex items-center gap-5 mb-7">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-white/10 shrink-0">
                    <Image
                      src="/mugshot.jpeg"
                      alt={portfolioData.name}
                      width={64} height={64}
                      className="w-full h-full object-cover object-[50%_28%]"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white leading-tight text-balance">
                      Hi, I&apos;m {portfolioData.name.split(' ')[0]}
                    </h1>
                    <p className="text-sm text-white/50 mt-0.5">{portfolioData.title}</p>
                  </div>
                </div>

                <p className="text-[13px] text-white/60 leading-relaxed mb-6">{portfolioData.summary}</p>

                {/* Resume CTA */}
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 mb-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white/80">Download Resume</p>
                    <p className="text-[11px] text-white/40">PDF · Updated 2025</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 ml-auto group-hover:text-white/60 transition-colors" />
                </a>

                {/* Skills */}
                <div className="mb-6">
                  <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {[...portfolioData.skills.languages, ...portfolioData.skills.frameworks].slice(0, 18).map(s => (
                      <span
                        key={s}
                        className={cn('px-2 py-0.5 text-[11px] rounded-md border font-medium', getSkillColor(s))}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="mb-6">
                  <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Education</h2>
                  <div className="space-y-3">
                    {portfolioData.education.map((edu, i) => (
                      <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
                        <p className="text-[13px] font-semibold text-white">{edu.degree}</p>
                        <p className="text-[12px] text-blue-400/80 mt-0.5">{edu.school}</p>
                        <p className="text-[11px] text-white/30 mt-1">{edu.period}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open other windows */}
                <div>
                  <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">Explore</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {WINDOW_LINKS.map(w => {
                      const Icon = w.icon
                      return (
                        <button
                          key={w.id}
                          onClick={() => openWindow(w.id)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/10 transition-all group"
                        >
                          <Icon className={cn('w-5 h-5 transition-transform group-hover:scale-110', w.color)} />
                          <span className="text-[11px] font-medium text-white/50 group-hover:text-white/80 transition-colors">{w.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Ask Jay */}
              <div className="w-72 flex flex-col shrink-0 bg-[#161618] lg:w-72 w-full order-1 lg:order-2 lg:max-h-none max-h-64 lg:border-0 border-b border-white/[0.06]">
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 shrink-0">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[13px] font-semibold text-white/80">Ask Jay</span>
                  <span className="ml-auto text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">AI</span>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Welcome bubble */}
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 bg-white/[0.06] rounded-2xl rounded-tl-sm px-3 py-2.5">
                      <p className="text-[12px] text-white/70 leading-relaxed">
                        Hey! I&apos;m Jay&apos;s AI assistant. Ask me anything about his background, skills, or projects.
                      </p>
                    </div>
                  </div>

                  {/* Suggestion chips */}
                  <div className="pl-8 flex flex-col gap-1.5 pt-1">
                    {[
                      'What are your top skills?',
                      'Tell me about your experience',
                      'What projects have you built?',
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => setChatInput(q)}
                        className="text-left text-[11px] px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/5 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="p-3 border-t border-white/[0.06] flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask me anything…"
                    className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white disabled:opacity-30 hover:brightness-110 transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ABOUT */}
          {view === 'about' && (
            <div className="flex-1 overflow-y-auto p-8">
              <h1 className="text-2xl font-bold text-white mb-1">About Me</h1>
              <p className="text-sm text-white/40 mb-6">{portfolioData.title}</p>
              <div className="border-t border-white/[0.06] pt-6">
                <p className="text-[14px] text-white/60 leading-relaxed max-w-2xl mb-8">{portfolioData.summary}</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Languages', items: portfolioData.skills.languages },
                    { label: 'Frameworks', items: portfolioData.skills.frameworks },
                    { label: 'Cloud', items: portfolioData.skills.cloud },
                    { label: 'Tools', items: portfolioData.skills.tools },
                  ].map(group => (
                    <div key={group.label}>
                      <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">{group.label}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map(s => (
                          <span key={s} className={cn('px-2 py-0.5 text-[11px] rounded-md border font-medium', getSkillColor(s))}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 border-t border-white/[0.06] pt-6">
                  <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-4">Education</h2>
                  <div className="space-y-3">
                    {portfolioData.education.map((edu, i) => (
                      <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                        <p className="text-[14px] font-semibold text-white">{edu.degree}</p>
                        <p className="text-[13px] text-blue-400/80 mt-0.5">{edu.school}</p>
                        <p className="text-[11px] text-white/30 mt-1.5">{edu.period}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT */}
          {view === 'contact' && (
            <div className="flex-1 overflow-y-auto p-8">
              <h1 className="text-2xl font-bold text-white mb-1">Contact</h1>
              <p className="text-sm text-white/40 mb-6">Get in touch</p>
              <div className="border-t border-white/[0.06] pt-6 space-y-3 max-w-sm">
                {[
                  { icon: Github, label: 'GitHub', value: portfolioData.github.replace('https://', ''), href: portfolioData.github, color: 'text-white/70' },
                  { icon: Linkedin, label: 'LinkedIn', value: 'Jay Patil', href: portfolioData.linkedin, color: 'text-blue-400' },
                  { icon: Mail, label: 'Email', value: portfolioData.email, href: `mailto:${portfolioData.email}`, color: 'text-emerald-400' },
                  { icon: MapPin, label: 'Location', value: portfolioData.location, href: undefined, color: 'text-orange-400' },
                ].map(({ icon: Icon, label, value, href, color }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex items-center gap-3 hover:border-white/10 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
                      <Icon className={cn('w-4.5 h-4.5', color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-white/30 uppercase tracking-wide">{label}</p>
                      {href ? (
                        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                          className="text-[13px] text-white/70 hover:text-white transition-colors truncate block">
                          {value}
                        </a>
                      ) : (
                        <p className="text-[13px] text-white/70 truncate">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
