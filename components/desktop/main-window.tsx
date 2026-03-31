'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  Github, Linkedin, MapPin, Download, ExternalLink,
  Send, Bot, User as UserIcon, Minus, Square, X,
  FolderGit2, Briefcase, Activity, FileText, Mail, ChevronRight
} from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { useWindowManager } from './window-manager'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ActiveView = 'home' | 'about' | 'contact'

const NAV_LINKS: { id: ActiveView; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'contact', label: 'CONTACT' },
]

const WINDOW_LINKS = [
  { id: 'experience', label: 'EXPERIENCE', icon: Briefcase },
  { id: 'projects', label: 'PROJECTS', icon: FolderGit2 },
  { id: 'heatmap', label: 'ACTIVITY', icon: Activity },
]

const SUGGESTIONS = [
  'What are your skills?',
  'Tell me about your experience',
  'What projects have you built?',
]

export function MainWindow() {
  const [view, setView] = useState<ActiveView>('home')
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { minimizeWindow, maximizeWindow, closeWindow, getWindowState, openWindow } = useWindowManager()
  const windowState = getWindowState('main')
  const isMaximized = windowState === 'maximized'

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })
  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (windowState === 'minimized' || windowState === 'closed') return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue('')
  }

  return (
    <div
      className={cn(
        'absolute flex flex-col shadow-2xl overflow-hidden',
        'border-2 border-[#c0c0c0]',
        isMaximized ? 'inset-0' : ''
      )}
      style={isMaximized
        ? { zIndex: 50 }
        : { left: 30, top: 16, width: 'calc(100% - 60px)', height: 'calc(100% - 36px)', zIndex: 20 }
      }
    >
      {/* ── Win95 Title Bar ── */}
      <div className="h-8 bg-gradient-to-r from-[#000080] to-[#1084d0] flex items-center px-2 gap-2 shrink-0 select-none cursor-default">
        <div className="w-4 h-4 bg-white/20 rounded-sm flex items-center justify-center shrink-0">
          <div className="w-2 h-2 bg-white rounded-sm" />
        </div>
        <span className="text-white text-xs font-bold flex-1 truncate">
          Jay Patil — Portfolio 2025
        </span>
        <div className="flex items-center gap-0.5">
          <button onClick={() => minimizeWindow('main')} title="Minimise"
            className="w-6 h-5 bg-[#c0c0c0] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
            <Minus className="w-3 h-3 text-black" />
          </button>
          <button onClick={() => maximizeWindow('main')} title="Maximise"
            className="w-6 h-5 bg-[#c0c0c0] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
            <Square className="w-3 h-3 text-black" />
          </button>
          <button onClick={() => closeWindow('main')} title="Close"
            className="w-6 h-5 bg-[#c0c0c0] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center hover:bg-red-500 hover:text-white active:border-t-[#808080] active:border-l-[#808080]">
            <X className="w-3 h-3 text-black" />
          </button>
        </div>
      </div>

      {/* ── Menu Bar ── */}
      <div className="h-6 bg-[#d4d0c8] border-b border-[#808080] flex items-center px-1 gap-1 shrink-0">
        {['File', 'Edit', 'View', 'Favourites', 'Help'].map(m => (
          <button key={m} className="text-[11px] text-black px-2 py-0.5 hover:bg-[#000080] hover:text-white">
            {m}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden bg-[#f0f0f0]">

        {/* ── Sidebar ── */}
        <aside className="w-44 bg-[#008080] flex flex-col shrink-0 border-r-2 border-[#006060]">
          {/* Profile */}
          <div className="p-3 border-b border-[#006060] flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-2 border-white/30 overflow-hidden rounded-sm">
              <Image src="/mugshot.webp" alt="Jay Patil" width={48} height={48}
                className="w-full h-full object-cover object-[50%_28%]" priority />
            </div>
            <div className="text-center">
              <p className="text-white text-[11px] font-bold leading-tight">{portfolioData.name}</p>
              <p className="text-[#a0ffd0] text-[9px] leading-tight truncate px-1">{portfolioData.title.split(',')[0]}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="py-1">
            <p className="text-[8px] font-bold text-[#a0ffd0] uppercase tracking-widest px-3 pt-2 pb-1">Navigate</p>
            {NAV_LINKS.map(link => (
              <button key={link.id} onClick={() => setView(link.id)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-[11px] font-medium flex items-center gap-1.5 transition-colors',
                  view === link.id ? 'bg-[#000080] text-white' : 'text-white hover:bg-[#006060]'
                )}>
                {view === link.id
                  ? <ChevronRight className="w-3 h-3 shrink-0" />
                  : <span className="w-3 h-3 shrink-0 text-center text-[8px]">▸</span>}
                {link.label}
              </button>
            ))}

            <div className="mx-3 my-2 border-t border-[#006060]" />
            <p className="text-[8px] font-bold text-[#a0ffd0] uppercase tracking-widest px-3 pb-1">Windows</p>
            {WINDOW_LINKS.map(w => {
              const Icon = w.icon
              return (
                <button key={w.id} onClick={() => openWindow(w.id)}
                  className="w-full text-left px-3 py-1.5 text-[11px] font-medium flex items-center gap-1.5 text-white hover:bg-[#006060] transition-colors">
                  <Icon className="w-3 h-3 shrink-0" />
                  {w.label}
                </button>
              )
            })}

            <div className="mx-3 my-2 border-t border-[#006060]" />
            <p className="text-[8px] font-bold text-[#a0ffd0] uppercase tracking-widest px-3 pb-1">Links</p>
            <a href={portfolioData.github} target="_blank" rel="noopener noreferrer"
              className="w-full text-left px-3 py-1.5 text-[11px] text-white hover:bg-[#006060] flex items-center gap-1.5 transition-colors">
              <Github className="w-3 h-3" /> GITHUB
            </a>
            <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer"
              className="w-full text-left px-3 py-1.5 text-[11px] text-white hover:bg-[#006060] flex items-center gap-1.5 transition-colors">
              <Linkedin className="w-3 h-3" /> LINKEDIN
            </a>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer"
              className="w-full text-left px-3 py-1.5 text-[11px] text-white hover:bg-[#006060] flex items-center gap-1.5 transition-colors">
              <FileText className="w-3 h-3" /> RESUME
            </a>
            <a href={`mailto:${portfolioData.email}`}
              className="w-full text-left px-3 py-1.5 text-[11px] text-white hover:bg-[#006060] flex items-center gap-1.5 transition-colors">
              <Mail className="w-3 h-3" /> EMAIL
            </a>
          </nav>

          <div className="mt-auto p-2 border-t border-[#006060]">
            <p className="text-[9px] text-[#a0ffd0] text-center">© 2025 Jay Patil</p>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-hidden bg-white flex flex-col">

          {/* HOME: split — About left, Chat right */}
          {view === 'home' && (
            <div className="flex flex-1 overflow-hidden divide-x divide-gray-200">

              {/* Left: About Me */}
              <div className="flex-1 overflow-y-auto p-6 min-w-0">
                <h1 className="text-4xl font-bold text-[#000080] mb-1 leading-tight text-balance">Welcome</h1>
                <p className="text-base font-semibold text-gray-600 mb-5">I&apos;m {portfolioData.name}</p>
                <hr className="border-gray-200 mb-5" />

                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 border-2 border-gray-200 overflow-hidden shrink-0">
                    <Image src="/mugshot.webp" alt="Jay Patil" width={64} height={64}
                      className="w-full h-full object-cover object-[50%_28%]" priority />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{portfolioData.title}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />{portfolioData.location}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-5">{portfolioData.summary}</p>

                {/* Resume callout */}
                <div className="border border-gray-200 p-3 mb-5 flex items-center gap-3 hover:border-[#000080] transition-colors">
                  <Download className="w-5 h-5 text-[#000080] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Looking for my resume?</p>
                    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[#000080] underline hover:text-blue-700">
                      Click here to download it!
                    </a>
                  </div>
                </div>
                <hr className="border-gray-200 mb-5" />

                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Skills</h2>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {[...portfolioData.skills.languages, ...portfolioData.skills.frameworks].slice(0, 14).map(s => (
                    <span key={s} className="px-2 py-0.5 text-[10px] border border-gray-200 text-gray-600 bg-gray-50">{s}</span>
                  ))}
                </div>
                <hr className="border-gray-200 mb-5" />

                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Education</h2>
                {portfolioData.education.map((edu, i) => (
                  <div key={i} className="border-l-4 border-[#000080] pl-3 mb-3">
                    <p className="text-xs font-bold text-gray-900">{edu.degree}</p>
                    <p className="text-xs text-[#000080]">{edu.school}</p>
                    <p className="text-[10px] text-gray-500">{edu.period}</p>
                  </div>
                ))}
                <hr className="border-gray-200 mb-5" />

                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Explore</h2>
                <div className="grid grid-cols-3 gap-2">
                  {WINDOW_LINKS.map(w => {
                    const Icon = w.icon
                    return (
                      <button key={w.id} onClick={() => openWindow(w.id)}
                        className="flex flex-col items-center gap-1.5 p-3 border-2 border-gray-200 hover:border-[#000080] hover:bg-[#000080]/5 transition-all group">
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#000080]" />
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-[#000080]">{w.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right: Ask Jay chat */}
              <div className="w-80 flex flex-col shrink-0 bg-gray-50">
                <div className="px-4 py-3 border-b border-gray-200 bg-[#000080] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white">ASK JAY</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="pt-4 text-center">
                      <Bot className="w-8 h-8 text-[#008080] mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-3">Ask about my background, skills, or projects.</p>
                      <div className="flex flex-col gap-1.5">
                        {SUGGESTIONS.map(q => (
                          <button key={q} onClick={() => { setInputValue(q); inputRef.current?.focus() }}
                            className="text-[11px] px-3 py-1.5 border border-gray-200 bg-white hover:bg-[#000080] hover:text-white hover:border-[#000080] transition-colors text-left text-gray-700">
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map(message => (
                    <div key={message.id}
                      className={cn('flex gap-2', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                      <div className={cn(
                        'w-6 h-6 shrink-0 flex items-center justify-center text-[10px] font-bold text-white',
                        message.role === 'user' ? 'bg-[#000080]' : 'bg-[#008080]'
                      )}>
                        {message.role === 'user' ? <UserIcon className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </div>
                      <div className={cn(
                        'max-w-[80%] px-2.5 py-2 text-[11px] leading-relaxed border',
                        message.role === 'user'
                          ? 'bg-[#000080] text-white border-[#000060]'
                          : 'bg-white text-gray-800 border-gray-200'
                      )}>
                        {message.parts.map((part, i) =>
                          part.type === 'text' ? (
                            message.role === 'assistant' ? (
                              <div key={i} className="prose prose-xs max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                              </div>
                            ) : <span key={i}>{part.text}</span>
                          ) : null
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 bg-[#008080] shrink-0 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 px-3 py-2 flex gap-1">
                        {[0, 150, 300].map(d => (
                          <span key={d} className="w-1.5 h-1.5 bg-[#008080] rounded-full animate-bounce"
                            style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-2 border-t border-gray-200 bg-[#d4d0c8] flex gap-1.5">
                  <input ref={inputRef} type="text" value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Ask me anything..." disabled={isLoading}
                    className="flex-1 border-2 border-[#808080] bg-white px-2 py-1.5 text-[11px] text-gray-900 focus:outline-none focus:border-[#000080] disabled:opacity-50" />
                  <button type="submit" disabled={isLoading || !inputValue.trim()}
                    className="px-3 py-1.5 bg-[#000080] text-white text-[11px] font-bold hover:bg-[#0000a0] disabled:opacity-40 border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center gap-1">
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ABOUT */}
          {view === 'about' && (
            <div className="flex-1 overflow-y-auto p-8">
              <h1 className="text-3xl font-bold text-[#000080] mb-6 text-balance">About Me</h1>
              <hr className="border-gray-200 mb-6" />
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 border-2 border-gray-200 overflow-hidden shrink-0">
                  <Image src="/mugshot.webp" alt="Jay Patil" width={96} height={96}
                    className="w-full h-full object-cover object-[50%_28%]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{portfolioData.name}</h2>
                  <p className="text-[#000080] font-medium">{portfolioData.title}</p>
                  <p className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin className="w-4 h-4" />{portfolioData.location}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-8 max-w-2xl">{portfolioData.summary}</p>
              <hr className="border-gray-200 mb-6" />
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Languages', items: portfolioData.skills.languages, color: 'border-blue-200 text-blue-800 bg-blue-50' },
                  { label: 'Frameworks', items: portfolioData.skills.frameworks, color: 'border-purple-200 text-purple-800 bg-purple-50' },
                  { label: 'Cloud', items: portfolioData.skills.cloud, color: 'border-sky-200 text-sky-800 bg-sky-50' },
                  { label: 'Tools', items: portfolioData.skills.tools, color: 'border-green-200 text-green-800 bg-green-50' },
                ].map(group => (
                  <div key={group.label}>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{group.label}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map(s => (
                        <span key={s} className={`px-2 py-0.5 text-[11px] border ${group.color}`}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <hr className="border-gray-200 mb-6" />
              <h2 className="text-base font-bold text-gray-900 mb-4">Education</h2>
              {portfolioData.education.map((edu, i) => (
                <div key={i} className="border-l-4 border-[#000080] pl-4 mb-4">
                  <p className="font-bold text-sm text-gray-900">{edu.degree}</p>
                  <p className="text-sm text-[#000080]">{edu.school}</p>
                  <p className="text-xs text-gray-500">{edu.period}</p>
                </div>
              ))}
              <hr className="border-gray-200 mb-6" />
              <div className="flex gap-2 flex-wrap">
                <a href={portfolioData.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
                <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#0077b5] text-white hover:bg-[#005f8d] transition-colors">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-2 border-[#000080] text-[#000080] hover:bg-[#000080]/10 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> View Resume
                </a>
              </div>
            </div>
          )}

          {/* CONTACT */}
          {view === 'contact' && (
            <div className="flex-1 overflow-y-auto p-8">
              <h1 className="text-3xl font-bold text-[#000080] mb-6 text-balance">Contact</h1>
              <hr className="border-gray-200 mb-6" />
              <p className="text-sm text-gray-700 leading-relaxed mb-8 max-w-lg">
                I&apos;m always open to new opportunities and interesting conversations. Feel free to reach out!
              </p>
              <div className="space-y-3 max-w-sm">
                <a href={`mailto:${portfolioData.email}`}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-[#000080] hover:bg-[#000080]/5 transition-all group">
                  <div className="w-10 h-10 bg-[#008080] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#000080] transition-colors">{portfolioData.email}</p>
                  </div>
                </a>
                <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-[#0077b5] hover:bg-[#0077b5]/5 transition-all group">
                  <div className="w-10 h-10 bg-[#0077b5] flex items-center justify-center shrink-0">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">LinkedIn</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#0077b5] transition-colors">Connect with me</p>
                  </div>
                </a>
                <a href={portfolioData.github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900/5 transition-all group">
                  <div className="w-10 h-10 bg-gray-900 flex items-center justify-center shrink-0">
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">GitHub</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">View my code</p>
                  </div>
                </a>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Status Bar ── */}
      <div className="h-5 bg-[#d4d0c8] border-t border-[#808080] flex items-center px-2 gap-3 shrink-0">
        <div className="border border-[#808080] border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-2 text-[10px] text-gray-700 capitalize">
          {view === 'home' ? 'Home' : view === 'about' ? 'About' : 'Contact'}
        </div>
        <div className="border border-[#808080] border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-2 text-[10px] text-gray-700">
          {portfolioData.location}
        </div>
        <div className="ml-auto border border-[#808080] border-t-[#404040] border-l-[#404040] border-b-white border-r-white px-2 text-[10px] text-gray-700">
          Ready
        </div>
      </div>
    </div>
  )
}


