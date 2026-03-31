'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { 
  Home, User, Briefcase, FolderGit2, Mail, FileText, 
  Github, Linkedin, MapPin, Download, ExternalLink,
  Send, Bot, User as UserIcon, BarChart3
} from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { OSWindow } from './os-window'
import { useWindowManager } from './window-manager'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ActiveView = 'home' | 'about' | 'experience' | 'projects' | 'contact'

const navItems = [
  { id: 'home' as const, label: 'HOME', icon: Home },
  { id: 'about' as const, label: 'ABOUT', icon: User },
  { id: 'experience' as const, label: 'EXPERIENCE', icon: Briefcase },
  { id: 'projects' as const, label: 'PROJECTS', icon: FolderGit2 },
  { id: 'contact' as const, label: 'CONTACT', icon: Mail },
]

const suggestedQuestions = [
  'What are your skills?',
  'Tell me about your experience',
  'What projects have you built?',
]

export function MainWindow() {
  const [activeView, setActiveView] = useState<ActiveView>('home')
  const { openWindow } = useWindowManager()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue('')
  }

  const handleNavClick = (id: ActiveView) => {
    if (id === 'projects') {
      openWindow('projects')
    } else if (id === 'experience') {
      openWindow('experience')
    } else {
      setActiveView(id)
    }
  }

  return (
    <OSWindow 
      id="main"
      title={`Jay Patil - Portfolio ${new Date().getFullYear()}`}
      icon="💼" 
      defaultPosition={{ x: 80, y: 20 }}
      defaultSize={{ width: 'calc(100% - 100px)', height: 'calc(100% - 100px)' }}
      headerColor="bg-gradient-to-r from-[#4a90d9] to-[#357abd]"
    >
      <div className="flex h-full bg-[#c0c0c0]">
        {/* Sidebar */}
        <div className="w-48 bg-gradient-to-b from-[#d4e5f7] to-[#b8d4e8] border-r-2 border-[#87ceeb] flex flex-col shrink-0">
          {/* Name Card */}
          <div className="p-4 border-b border-[#87ceeb]/50">
            <h2 className="text-xl font-bold text-[#1a1a2e] leading-tight">
              {portfolioData.name.split(' ')[0]}
              <br />
              {portfolioData.name.split(' ')[1]}
            </h2>
            <p className="text-sm text-[#5e60ce] mt-1">Showcase &apos;{new Date().getFullYear().toString().slice(-2)}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2 ${
                  activeView === item.id
                    ? 'text-[#5e60ce] bg-white/30'
                    : 'text-[#4a4a6a] hover:text-[#5e60ce] hover:bg-white/20'
                }`}
              >
                {activeView === item.id && <span className="text-[#5e60ce]">●</span>}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Bottom Links */}
          <div className="p-4 border-t border-[#87ceeb]/50 space-y-2">
            <a
              href={portfolioData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href={portfolioData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <button
              onClick={() => openWindow('heatmap')}
              className="flex items-center gap-2 text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors w-full"
            >
              <BarChart3 className="w-4 h-4" />
              Activity
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-[#e8f4f8] to-[#d4e5f7]">
          {activeView === 'home' && (
            <div className="h-full overflow-y-auto p-6">
              {/* Welcome Header */}
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-2 font-serif">Welcome</h1>
                <p className="text-lg text-[#4a4a6a]">I&apos;m {portfolioData.name}</p>
              </div>

              {/* Intro */}
              <p className="text-[#333] leading-relaxed mb-6">
                {portfolioData.summary} Thank you for taking the time to check out my portfolio. 
                Feel free to contact me using the sidebar or shoot me an email at{' '}
                <a href={`mailto:${portfolioData.email}`} className="text-[#5e60ce] underline hover:text-[#4a4ac0]">
                  {portfolioData.email}
                </a>
              </p>

              {/* Resume Card */}
              <div className="bg-white/60 rounded-lg p-4 mb-6 border border-[#87ceeb]/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#e8f4f8] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#5e60ce]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1a1a2e]">Looking for my resume?</p>
                  <a 
                    href="/resume.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#5e60ce] underline hover:text-[#4a4ac0]"
                  >
                    Click here to download it!
                  </a>
                </div>
              </div>

              <hr className="border-[#87ceeb]/30 my-6" />

              {/* About Me Section */}
              <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 font-serif">About Me</h2>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-[#87ceeb]/50 shadow-md shrink-0">
                  <Image
                    src="/mugshot.webp"
                    alt="Jay Patil"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover object-[50%_28%]"
                    priority
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1a1a2e]">{portfolioData.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-[#666] mt-1">
                    <MapPin className="w-3 h-3" />
                    {portfolioData.location}
                  </div>
                  <p className="text-sm text-[#333] mt-2">{portfolioData.tagline}</p>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-3">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {[...portfolioData.skills.languages.slice(0, 5), ...portfolioData.skills.frameworks.slice(0, 4)].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs font-medium bg-white/70 text-[#4a4a6a] rounded border border-[#87ceeb]/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education Preview */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-3">Education</h3>
                {portfolioData.education.slice(0, 1).map((edu, i) => (
                  <div key={i} className="bg-white/50 rounded-lg p-3 border border-[#87ceeb]/20">
                    <p className="font-medium text-[#1a1a2e] text-sm">{edu.degree}</p>
                    <p className="text-[#5e60ce] text-sm">{edu.school}</p>
                    <p className="text-xs text-[#888] mt-1">{edu.period}</p>
                  </div>
                ))}
              </div>

              <hr className="border-[#87ceeb]/30 my-6" />

              {/* Ask Me Section - Chat */}
              <h2 className="text-2xl font-bold text-[#1a1a2e] mb-4 font-serif">Ask Me Anything</h2>
              
              <div className="bg-white/70 rounded-lg border border-[#87ceeb]/30 overflow-hidden">
                {/* Chat Messages */}
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="w-10 h-10 text-[#5e60ce] mb-2" />
                      <p className="text-sm text-[#666] mb-3">Ask about my experience, skills, or projects</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {suggestedQuestions.map((q) => (
                          <button
                            key={q}
                            onClick={() => { setInputValue(q); inputRef.current?.focus() }}
                            className="text-xs px-3 py-1.5 rounded-full border border-[#87ceeb] bg-white hover:bg-[#e8f4f8] transition-colors text-[#4a4a6a]"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-full bg-[#5e60ce] flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                              message.role === 'user'
                                ? 'bg-[#5e60ce] text-white'
                                : 'bg-white text-[#333] border border-[#ddd]'
                            }`}
                          >
                            {message.parts.map((part, i) => {
                              if (part.type === 'text') {
                                if (message.role === 'assistant') {
                                  return (
                                    <div key={i} className="prose prose-sm max-w-none">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {part.text}
                                      </ReactMarkdown>
                                    </div>
                                  )
                                }
                                return <span key={i}>{part.text}</span>
                              }
                              return null
                            })}
                          </div>
                          {message.role === 'user' && (
                            <div className="w-7 h-7 rounded-full bg-[#ff6b9d] flex items-center justify-center shrink-0">
                              <UserIcon className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                      {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#5e60ce] flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white border border-[#ddd] rounded-lg px-3 py-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-[#5e60ce] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-[#5e60ce] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-[#5e60ce] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-[#87ceeb]/30 bg-[#f0f8ff]">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="Type your question..."
                      className="flex-1 px-3 py-2 text-sm border border-[#87ceeb] rounded focus:outline-none focus:ring-2 focus:ring-[#5e60ce]/50"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputValue.trim()}
                      className="px-4 py-2 bg-[#5e60ce] text-white rounded hover:bg-[#4a4ac0] disabled:opacity-50 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeView === 'about' && (
            <div className="h-full overflow-y-auto p-6">
              <h1 className="text-3xl font-bold text-[#1a1a2e] mb-6 font-serif">About Me</h1>
              
              <div className="flex items-start gap-6 mb-8">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-[#87ceeb]/50 shadow-lg shrink-0">
                  <Image
                    src="/mugshot.webp"
                    alt="Jay Patil"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover object-[50%_28%]"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a2e]">{portfolioData.name}</h2>
                  <p className="text-lg text-[#5e60ce]">{portfolioData.title}</p>
                  <div className="flex items-center gap-1 text-[#666] mt-2">
                    <MapPin className="w-4 h-4" />
                    {portfolioData.location}
                  </div>
                  <p className="mt-4 text-[#333] leading-relaxed">{portfolioData.summary}</p>
                </div>
              </div>

              {/* All Skills */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/60 rounded-lg p-4 border border-[#87ceeb]/30">
                  <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.languages.map((skill) => (
                      <span key={skill} className="px-3 py-1 text-xs font-medium bg-[#667eea]/10 text-[#667eea] rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-[#87ceeb]/30">
                  <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-3">Frameworks</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.frameworks.map((skill) => (
                      <span key={skill} className="px-3 py-1 text-xs font-medium bg-[#f093fb]/10 text-[#c44cce] rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-[#87ceeb]/30">
                  <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-3">Cloud & Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.cloud.map((skill) => (
                      <span key={skill} className="px-3 py-1 text-xs font-medium bg-[#4facfe]/10 text-[#4facfe] rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-[#87ceeb]/30">
                  <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-3">Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.tools.map((skill) => (
                      <span key={skill} className="px-3 py-1 text-xs font-medium bg-[#43e97b]/10 text-[#38b970] rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Education */}
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-4">Education</h3>
              <div className="space-y-4">
                {portfolioData.education.map((edu, i) => (
                  <div key={i} className="bg-white/60 rounded-lg p-4 border border-[#87ceeb]/30">
                    <p className="font-semibold text-[#1a1a2e]">{edu.degree}</p>
                    <p className="text-[#5e60ce]">{edu.school}</p>
                    <p className="text-sm text-[#888] mt-1">{edu.period}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'contact' && (
            <div className="h-full overflow-y-auto p-6">
              <h1 className="text-3xl font-bold text-[#1a1a2e] mb-6 font-serif">Contact</h1>
              
              <p className="text-[#333] mb-8">
                I&apos;m always open to discussing new opportunities, projects, or collaborations. 
                Feel free to reach out through any of the channels below.
              </p>

              <div className="grid gap-4 max-w-md">
                <a
                  href={`mailto:${portfolioData.email}`}
                  className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-[#87ceeb]/30 hover:bg-white/80 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#ff6b9d] rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a2e]">Email</p>
                    <p className="text-sm text-[#5e60ce]">{portfolioData.email}</p>
                  </div>
                </a>

                <a
                  href={portfolioData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-[#87ceeb]/30 hover:bg-white/80 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#0077b5] rounded-lg flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a2e]">LinkedIn</p>
                    <p className="text-sm text-[#5e60ce]">Connect with me</p>
                  </div>
                </a>

                <a
                  href={portfolioData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-[#87ceeb]/30 hover:bg-white/80 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#1a1a2e] rounded-lg flex items-center justify-center">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a2e]">GitHub</p>
                    <p className="text-sm text-[#5e60ce]">View my code</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-[#87ceeb]/30">
                  <div className="w-12 h-12 bg-[#5e60ce] rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a2e]">Location</p>
                    <p className="text-sm text-[#5e60ce]">{portfolioData.location}</p>
                  </div>
                </div>
              </div>

              {/* Resume */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 rounded-lg border border-[#87ceeb]/30">
                <h3 className="font-semibold text-[#1a1a2e] mb-2">Download Resume</h3>
                <p className="text-sm text-[#666] mb-4">Get a copy of my full resume in PDF format.</p>
                <div className="flex gap-3">
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#5e60ce] text-white rounded hover:bg-[#4a4ac0] transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                  <a
                    href="/resume.pdf"
                    download
                    className="flex items-center gap-2 px-4 py-2 border-2 border-[#5e60ce] text-[#5e60ce] rounded hover:bg-[#5e60ce]/10 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </OSWindow>
  )
}
