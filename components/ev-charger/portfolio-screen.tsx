'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import Image from 'next/image'
import { Linkedin, Github, FileText, MessageSquare, Send, ArrowLeft, Briefcase, Code, Mail, Phone, User, Trophy, ExternalLink, GraduationCap, Star, Users, TrendingUp, Cpu, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { portfolioData } from '@/lib/portfolio-data'

type CardType = 'about' | 'projects' | 'experience' | 'contact' | null
const CONTACT_FORMSPREE_ENDPOINT = 'https://formspree.io/f/mlgorpjo'
const CARD_HEADER_TITLES: Record<Exclude<CardType, null>, string> = {
  about: 'About Me',
  projects: 'Project Showcase',
  experience: 'Experience',
  contact: 'Contact Me',
}
const SCREEN_SUMMARY_KEYWORDS = [
  'Python',
  'Java',
  'TypeScript',
  'React.js',
  'Next.js',
  'Node.js',
  'TensorFlow',
  'C#',
  '.NET',
  'Spring Boot',
  'AWS',
  'GCP',
  'Docker',
  'Kubernetes',
  'Kafka',
  'C',
  'C++',
  'Hardware',
  'Embedded',
  'EV Chargers',
  'SLM Quantization',
]

const SCREEN_KEYWORD_COLOR_CLASSES = [
  'border-sky-200 bg-sky-50 text-sky-700',
  'border-blue-200 bg-blue-50 text-blue-700',
  'border-indigo-200 bg-indigo-50 text-indigo-700',
  'border-cyan-200 bg-cyan-50 text-cyan-700',
  'border-emerald-200 bg-emerald-50 text-emerald-700',
  'border-violet-200 bg-violet-50 text-violet-700',
] as const

export function PortfolioScreen() {
  const router = useRouter()
  const [activeCard, setActiveCard] = useState<CardType>(null)
  const [chatInput, setChatInput] = useState('')
  const clickTimesRef = useRef<number[]>([])
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const closeCard = () => setActiveCard(null)
  const handleProfileClick = () => {
    const now = Date.now()
    const recentClicks = [...clickTimesRef.current, now].filter((timestamp) => now - timestamp < 1200)
    clickTimesRef.current = recentClicks

    if (recentClicks.length >= 3) {
      clickTimesRef.current = []
      router.push('/auth')
    }
  }

  useEffect(() => {
    console.log('[rag-ui] status/messages update', { status, messages: messages.length })
    const el = messagesContainerRef.current
    if (!el) return

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
      el.scrollTo({ top: el.scrollHeight, behavior })
    }

    // Immediate scroll on message/status changes.
    scrollToBottom('auto')
    const raf = requestAnimationFrame(() => scrollToBottom('smooth'))

    // Keep pinned while assistant is streaming token deltas.
    let interval: ReturnType<typeof setInterval> | undefined
    if (status === 'streaming') {
      interval = setInterval(() => scrollToBottom('auto'), 120)
    }

    return () => {
      cancelAnimationFrame(raf)
      if (interval) clearInterval(interval)
    }
  }, [messages, status])

  const suggestedQuestions = [
    'What are your main skills?',
    'Tell me about your experience',
    'What projects have you worked on?',
  ]

  const summaryAndSkills = (
    <div className="min-w-0">
      <p className="text-[0.92rem] sm:text-[15px] leading-relaxed text-slate-600">
        Building scalable cloud-native apps with strong backend systems, full-stack delivery, and practical AI/ML integration.
      </p>
      <div className="mt-3 flex flex-wrap gap-2 sm:gap-1.5">
        {SCREEN_SUMMARY_KEYWORDS.map((keyword, index) => (
          <span
            key={keyword}
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] sm:text-[11px] font-medium',
              SCREEN_KEYWORD_COLOR_CLASSES[index % SCREEN_KEYWORD_COLOR_CLASSES.length]
            )}
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'w-full h-full bg-white flex flex-col lg:flex-row relative',
        activeCard ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar lg:overflow-hidden'
      )}
    >
      {/* Left side - Profile & Cards (60%) */}
      <div
        className={cn(
          'w-full lg:w-[60%] h-auto lg:h-full p-4 sm:p-6 lg:p-8 flex flex-col relative z-10',
          activeCard ? 'overflow-hidden' : 'overflow-visible lg:overflow-y-auto no-scrollbar'
        )}
      >
        {/* Profile Section */}
        <div className="mb-5 sm:mb-7 lg:mb-8">
          {/* Profile Photo */}
          <div className="flex flex-row items-start gap-3 sm:gap-6">
            <button
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
              className="w-36 h-36 sm:w-36 sm:h-36 lg:w-36 lg:h-36 shrink-0 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 border-2 border-sky-200 p-0 flex items-center justify-center shadow-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.03] hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/70"
            >
              <div className="w-full h-full rounded-[0.875rem] overflow-hidden">
                <Image
                  src="/mugshot.jpeg"
                  alt="Jay Patil profile photo"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover object-[center_22%]"
                  priority
                />
              </div>
            </button>

            {/* Name, Links, Email */}
            <div className="flex-1 min-w-0 md:min-w-[15.5rem]">
              <h1 className="text-[1.95rem] sm:text-4xl font-bold text-slate-800 mb-0.5 sm:whitespace-nowrap">Jay Patil</h1>
              <p className="text-slate-500 text-base mb-3">Software Engineer</p>

              {/* Icon row */}
              <div className="flex gap-2.5">
                <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-sky-200/50">
                  <Linkedin className="w-5 h-5 text-sky-600" />
                </a>
                <a href={portfolioData.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg">
                  <Github className="w-5 h-5 text-slate-700" />
                </a>
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-200/50">
                  <FileText className="w-5 h-5 text-blue-600" />
                </a>
              </div>
              <a
                href={`mailto:${portfolioData.email}`}
                className="mt-1.5 inline-flex text-sm text-slate-600 hover:text-sky-700 transition-colors break-all"
              >
                {portfolioData.email}
              </a>
            </div>
          </div>

          {/* Summary full-width below profile row */}
          <div className="mt-3">
            {summaryAndSkills}
          </div>
        </div>

        {/* 2x2 Card Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* About Me Card */}
          <button
            onClick={() => setActiveCard('about')}
            className="group relative overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-2xl min-h-[11.25rem] p-5 sm:p-6 pb-10 sm:pb-12 text-left transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-2xl md:hover:shadow-sky-200/60 md:hover:border-sky-400"
          >
            <div className="pointer-events-none absolute top-4 right-4 opacity-30">
              <User className="h-20 w-20 text-sky-300" strokeWidth={1.7} />
            </div>
            <div className="relative z-10 mb-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center transition-all md:group-hover:scale-110 md:group-hover:shadow-lg md:group-hover:shadow-sky-300/70">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">About Me</h3>
            </div>
            <p className="relative z-10 text-base text-slate-500 line-clamp-2">Learn about my background, skills, and interests</p>
            <span className="absolute bottom-4 right-5 text-xs font-semibold text-slate-500 transition-colors md:group-hover:text-sky-700">
              Open →
            </span>
          </button>

          {/* Projects Card */}
          <button
            onClick={() => setActiveCard('projects')}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl min-h-[11.25rem] p-5 sm:p-6 pb-10 sm:pb-12 text-left transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-2xl md:hover:shadow-emerald-200/60 md:hover:border-emerald-400"
          >
            <div className="pointer-events-none absolute top-4 right-4 opacity-30">
              <Code className="h-20 w-20 text-emerald-300" strokeWidth={1.7} />
            </div>
            <div className="relative z-10 mb-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center transition-all md:group-hover:scale-110 md:group-hover:shadow-lg md:group-hover:shadow-emerald-300/70">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Project Showcase</h3>
            </div>
            <p className="relative z-10 text-base text-slate-500 line-clamp-2">Projects I&apos;m proud of: featured work and side projects</p>
            <span className="absolute bottom-4 right-5 text-xs font-semibold text-slate-500 transition-colors md:group-hover:text-emerald-700">
              Open →
            </span>
          </button>

          {/* Experience Card */}
          <button
            onClick={() => setActiveCard('experience')}
            className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-2xl min-h-[11.25rem] p-5 sm:p-6 pb-10 sm:pb-12 text-left transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-2xl md:hover:shadow-violet-200/60 md:hover:border-violet-500"
          >
            <div className="pointer-events-none absolute top-4 right-4 opacity-30">
              <Briefcase className="h-20 w-20 text-violet-300" strokeWidth={1.7} />
            </div>
            <div className="relative z-10 mb-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center transition-all md:group-hover:scale-110 md:group-hover:shadow-lg md:group-hover:shadow-violet-300/70">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Experience</h3>
            </div>
            <p className="relative z-10 text-base text-slate-500 line-clamp-2">My professional journey and career timeline</p>
            <span className="absolute bottom-4 right-5 text-xs font-semibold text-slate-500 transition-colors md:group-hover:text-violet-700">
              Open →
            </span>
          </button>

          {/* Contact Card */}
          <button
            onClick={() => setActiveCard('contact')}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-200 rounded-2xl min-h-[11.25rem] p-5 sm:p-6 pb-10 sm:pb-12 text-left transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-2xl md:hover:shadow-orange-200/60 md:hover:border-orange-400"
          >
            <div className="pointer-events-none absolute top-4 right-4 opacity-30">
              <Mail className="h-20 w-20 text-orange-300" strokeWidth={1.7} />
            </div>
            <div className="relative z-10 mb-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center transition-all md:group-hover:scale-110 md:group-hover:shadow-lg md:group-hover:shadow-orange-300/70">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Contact Me</h3>
            </div>
            <p className="relative z-10 text-base text-slate-500 line-clamp-2">Get in touch for opportunities or collaborations</p>
            <span className="absolute bottom-4 right-5 text-xs font-semibold text-slate-500 transition-colors md:group-hover:text-orange-700">
              Open →
            </span>
          </button>
        </div>
      </div>

      {/* Right side - RAG Chat (40%) */}
      <div className="w-full lg:w-[40%] h-[72vh] min-h-[32rem] sm:h-auto lg:h-full sm:min-h-[38%] bg-gradient-to-b from-slate-50 to-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Ask Jay</h3>
              <p className="text-sm text-slate-500 leading-snug">Use the chat to discover cool things about me!</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-600">Online</span>
            </div>
          </div>
        </div>

        {/* Chat messages area */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 p-4 overflow-hidden md:overflow-y-auto md:no-scrollbar space-y-3">
          {messages.length === 0 && (
            <>
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
                  <span className="text-sm leading-none">✋</span>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100 max-w-[92%]">
                  <p className="text-base text-slate-700">
                    Hello! What would you like to know?
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-400 uppercase tracking-wider">Suggested questions</p>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      if (isLoading) return
                      console.log('[rag-ui] send suggested question', { question: q })
                      sendMessage({ text: q })
                    }}
                    className="block w-full text-left text-base bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl px-4 py-3 transition-all text-slate-600 hover:text-sky-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map((message) => {
            const text = message.parts
              .filter((part) => part.type === 'text')
              .map((part) => part.text)
              .join('\n')
              .trim()

            if (!text) return null

            const isUser = message.role === 'user'
            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-sm leading-none">✋</span>
                  </div>
                )}
                <div
                  className={
                    isUser
                      ? 'max-w-[90%] bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 text-base shadow-sm'
                      : 'max-w-[92%] bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100 text-base text-slate-700'
                  }
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{text}</p>
                  ) : (
                    <div className="leading-relaxed [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-1 [&_strong]:font-semibold [&_a]:text-sky-700 [&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-100 [&_pre]:p-3">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
                <span className="text-sm leading-none">✋</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat input */}
        <form
          className="p-4 border-t border-slate-200 bg-white"
          onSubmit={(e) => {
            e.preventDefault()
            const q = chatInput.trim()
            if (!q || isLoading) return
            console.log('[rag-ui] submit question', { question: q })
            sendMessage({ text: q })
            setChatInput('')
          }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask me anything!"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
            />
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center hover:from-sky-400 hover:to-blue-500 transition-all hover:scale-105 shadow-lg shadow-sky-300/30 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      </div>

      {/* Card Popup Overlay */}
      {activeCard && (
        <div
          className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={closeCard}
        >
          <div
            className="w-[94%] md:w-[88%] lg:w-[80%] h-[92%] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex items-center gap-4 p-5 md:p-6 border-b border-slate-100 shrink-0">
              <button
                onClick={closeCard}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-2xl font-bold text-slate-800">
                {CARD_HEADER_TITLES[activeCard]}
              </h2>
            </div>

            {/* Popup Content */}
            <div className="flex-1 p-5 md:p-8 min-h-0 overscroll-contain">
              {activeCard === 'about' && (
                <div className="h-full overflow-y-auto no-scrollbar overscroll-contain">
                  <AboutContent />
                </div>
              )}
              {activeCard === 'projects' && (
                <div className="h-full overflow-y-auto no-scrollbar overscroll-contain">
                  <ProjectsContent />
                </div>
              )}
              {activeCard === 'experience' && (
                <div className="h-full overflow-y-auto no-scrollbar overscroll-contain">
                  <ExperienceContent />
                </div>
              )}
              {activeCard === 'contact' && (
                <div className="h-full overflow-y-auto no-scrollbar overscroll-contain">
                  <ContactContent />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AboutContent() {
  const latestRole = portfolioData.experience[0]
  const masters = portfolioData.education[0]
  const bachelors = portfolioData.education[1]

  return (
    <article className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white px-5 py-6 sm:px-8 sm:py-8">
      <header className="border-b border-slate-200 pb-5">
      </header>

      <section className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <figure className="md:w-72 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2">
            <div className="w-full overflow-hidden rounded-lg">
              <Image
                src="/about-jay-0395.jpg"
                alt="Jay Patil portrait"
                width={640}
                height={840}
                className="w-full h-auto object-cover"
              />
            </div>
            <figcaption className="px-1 pt-2 text-xs text-slate-500">
              Jay Patil, Santa Clara, 2026
            </figcaption>
          </figure>

          <div className="min-w-0">
            <h4 className="text-2xl font-bold text-slate-900 mb-3">About Me</h4>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                I&apos;m {portfolioData.name}, a {portfolioData.title.toLowerCase()} based in {portfolioData.location}. I build
                production software across cloud platforms, full-stack interfaces, and AI-assisted systems with a strong focus
                on reliability, speed, and real user impact.
              </p>
              <p>
                My current work includes shipping practical AI and platform experiences at {latestRole?.company}, while also
                deepening my systems and ML foundation through my graduate studies at {masters?.school}.
              </p>
              <p>
                You can also connect with me on{' '}
                <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer" className="text-sky-700 font-semibold hover:underline">
                  LinkedIn
                </a>{' '}
                or explore code and experiments on{' '}
                <a href={portfolioData.github} target="_blank" rel="noopener noreferrer" className="text-sky-700 font-semibold hover:underline">
                  GitHub
                </a>.
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-slate-700 leading-relaxed">
                  Thanks for visiting my portfolio. I&apos;m really glad you&apos;re here. If you want the full details in document
                  form, you can view or download my resume below.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                  >
                    View Resume
                  </a>
                  <a
                    href="/resume.pdf"
                    download
                    className="inline-flex items-center rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Download Resume
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 border-t border-slate-200 pt-6">
        <h5 className="text-xl font-bold text-slate-900 mb-3">Professional Journey</h5>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            At Ador Powertron, I worked on EV charging software end-to-end: React frontends, OCPP/OpenAPI-driven backend
            systems, EV emulation in C#, and performance-focused improvements for charging and testing workflows.
          </p>
          <p>
            At Santa Clara University, I contributed to AI and full-stack initiatives, including a fine-tuned OpenAI RAG chatbot,
            feedback analysis tooling, and platforms that improved discoverability, accessibility, and operational efficiency.
          </p>
        </div>
      </section>

      <section className="mt-7 border-t border-slate-200 pt-6">
        <h5 className="text-xl font-bold text-slate-900 mb-3">Education</h5>
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            I&apos;m currently pursuing my {masters?.degree} at {masters?.school} ({masters?.period}).
          </p>
          <p>
            Before that, I completed my {bachelors?.degree} at {bachelors?.school} ({bachelors?.period}),
            where I built my core foundation in software engineering.
          </p>
        </div>
      </section>

      <section className="mt-7 border-t border-slate-200 pt-6">
        <h5 className="text-xl font-bold text-slate-900 mb-3">Hobbies & Interests</h5>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Outside work, I&apos;m genuinely excited by electronics and hardware. I love building and experimenting with embedded
            systems, sensor-driven prototypes, and hands-on engineering projects where software meets the physical world.
          </p>
          <p>
            I also enjoy outdoor hiking and spending time in nature. It helps me reset, think clearly, and come back with
            fresh energy for solving hard problems.
          </p>
        </div>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-6">
        <p className="text-slate-800 font-medium leading-relaxed">
          Thank you so much for reading through my portfolio. It means a lot to me, and I&apos;ve spent a lot of time perfecting it
          so it reflects my journey and work with honesty.
        </p>
        <p className="mt-2 text-slate-700 leading-relaxed">
          I also built this portfolio to showcase my UI craftsmanship and full-stack engineering capabilities in one complete experience.
        </p>
        <p className="mt-2 text-slate-700 leading-relaxed">
          I truly appreciate your time, and I&apos;d be excited to connect if anything here resonates with you.
        </p>
      </footer>
    </article>
  )
}

function ProjectsContent() {
  const [projects, setProjects] = useState<
    Array<{ id: number; name: string; title: string; description: string; url: string; image: string | null }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rankOrder = ['PulseFi', 'CC-Agents-Simulation', 'leetcode-premium-sorter', 'jaypatilportfolio'] as const
    const titleMap: Record<(typeof rankOrder)[number], string> = {
      PulseFi: 'PulseFi',
      'CC-Agents-Simulation': 'Collaborative AI Agents Simulation',
      'leetcode-premium-sorter': 'LeetCode Premium Problem Sorter',
      jaypatilportfolio: 'EV Portfolio OS (This Project)',
    }

    const loadProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/github')
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`)
        }

        const data = await response.json()
        const repos = Array.isArray(data?.repos) ? data.repos : []
        const repoMap = new Map<string, any>(repos.map((repo: any) => [String(repo.name), repo]))
        const ranked = rankOrder
          .map((name) => repoMap.get(name))
          .filter(Boolean)
          .map((repo: any) => ({
            id: Number(repo.id),
            name: String(repo.name),
            title: titleMap[repo.name as keyof typeof titleMap] ?? String(repo.name),
            description: String(repo.description || 'No description available'),
            url: String(repo.url || '#'),
            image: repo.image ? String(repo.image) : null,
          }))

        setProjects(ranked)
      } catch (error) {
        console.error('[projects-content] failed to load ranked projects', error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])
  const rankBadgeClasses = [
    'bg-yellow-100/95 border-yellow-300 text-yellow-800',
    'bg-slate-100/95 border-slate-300 text-slate-700',
    'bg-orange-100/95 border-orange-300 text-orange-800',
    'bg-sky-100/95 border-sky-300 text-sky-800',
  ] as const

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {loading && (
        <div className="col-span-full text-center text-slate-500 py-8">Loading ranked projects...</div>
      )}
      {!loading && projects.length === 0 && (
        <div className="col-span-full text-center text-slate-500 py-8">Unable to load ranked projects.</div>
      )}
      {projects.map((project, i) => (
        <a
          key={project.id}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-sky-300 transition-all group block"
        >
          <div
            className={cn(
              'absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold shadow-sm',
              rankBadgeClasses[i] ?? rankBadgeClasses[3]
            )}
          >
            <Trophy className="w-3 h-3" />
            <span>#{i + 1}</span>
          </div>
          {/* Project image placeholder */}
          <div className="h-32 md:h-40 bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center relative">
            {project.image ? (
              <Image
                src={project.image}
                alt={`${project.title} preview`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <Code className="w-12 h-12 text-sky-400 group-hover:scale-110 transition-transform" />
            )}
          </div>
          {/* Project info */}
          <div className="p-4">
            <h4 className="font-bold text-slate-800 mb-2 line-clamp-2">{project.title}</h4>
            <p className="text-sm text-slate-500 line-clamp-5">{project.description}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700">
              Open project
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

function ExperienceContent() {
  const kindMeta = {
    experience: { label: 'Work Experience', Icon: Briefcase },
    recognition: { label: 'Recognition', Icon: Star },
    education: { label: 'Education', Icon: GraduationCap },
    leadership: { label: 'Leadership', Icon: Users },
  } as const

  const highlightIcons = [TrendingUp, Cpu, Sparkles] as const

  const getStepColor = (index: number, total: number) => {
    if (total <= 1) return '#0ea5e9'
    const t = (total - 1 - index) / (total - 1)
    const start = { r: 37, g: 99, b: 235 } // blue-600
    const end = { r: 16, g: 185, b: 129 } // emerald-500
    const r = Math.round(start.r + (end.r - start.r) * t)
    const g = Math.round(start.g + (end.g - start.g) * t)
    const b = Math.round(start.b + (end.b - start.b) * t)
    return `rgb(${r}, ${g}, ${b})`
  }

  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  }

  const getEventDate = (period: string) => {
    const cleaned = period.trim()
    const withDay = cleaned.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})/)
    if (withDay) {
      const month = monthMap[withDay[1].slice(0, 3).toLowerCase()] ?? 0
      return new Date(Number(withDay[3]), month, Number(withDay[2])).getTime()
    }

    const monthYear = cleaned.match(/^([A-Za-z]{3,9})\s+(\d{4})/)
    if (monthYear) {
      const month = monthMap[monthYear[1].slice(0, 3).toLowerCase()] ?? 0
      return new Date(Number(monthYear[2]), month, 1).getTime()
    }

    return 0
  }

  const timelineEvents = [
    ...portfolioData.experience.map((exp) => ({
      kind: 'experience' as const,
      title: exp.title,
      org: exp.company,
      period: exp.period,
      points: exp.highlights,
    })),
    {
      kind: 'recognition' as const,
      title: 'Best Junior Developer Recognition',
      org: 'Ador Powertron',
      period: 'March 22, 2023',
      points: [
        'Received organization-level recognition for high-impact contributions to EV charging software delivery.',
        'Acknowledged for improving development execution quality across feature releases and test-readiness.',
      ],
    },
    {
      kind: 'recognition' as const,
      title: 'Adobe Hackathon - Best Feedback',
      org: 'Adobe Hackathon',
      period: 'January 2025',
      points: [
        'Won Best Feedback recognition for clear, actionable product and UX review insights.',
        'Delivered recommendations that helped improve iteration speed and overall submission quality.',
      ],
    },
    {
      kind: 'education' as const,
      title: "Started Master's Degree",
      org: 'Santa Clara University',
      period: 'September 2024',
      points: [
        "Started Master's in Computer Science and Engineering with focus on AI systems and scalable software engineering.",
        'Built academic and applied project depth in distributed systems, cloud tooling, and production-grade development.',
      ],
    },
    {
      kind: 'education' as const,
      title: 'Graduated B.Tech',
      org: 'MIT ADT',
      period: 'August 2022',
      points: [
        'Completed Bachelor of Technology in Computer Science and Engineering.',
        'Built foundations in software engineering, systems, and applied development projects.',
      ],
    },
    {
      kind: 'leadership' as const,
      title: 'Community Lead',
      org: 'ACM-G',
      period: 'November 2025',
      points: [
        'Led ACM-G community initiatives and coordinated technical programming to increase active participation.',
        'Organized events and engagement activities connecting student developers with practical engineering discussions.',
      ],
    },
  ].sort((a, b) => getEventDate(b.period) - getEventDate(a.period))

  const getOrgIconUrl = (org: string) => {
    const lower = org.toLowerCase()
    if (lower.includes('santa clara')) return 'https://www.google.com/s2/favicons?domain=scu.edu&sz=128'
    if (lower.includes('ador')) return 'https://www.google.com/s2/favicons?domain=adorpowertron.com&sz=128'
    if (lower.includes('adobe')) return 'https://www.google.com/s2/favicons?domain=adobe.com&sz=128'
    if (lower.includes('acm')) return 'https://www.google.com/s2/favicons?domain=acm.org&sz=128'
    return 'https://www.google.com/s2/favicons?domain=github.com&sz=128'
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-b from-slate-50 via-sky-50 to-blue-50 p-6 md:p-8">
      <div className="circuit-board-bg pointer-events-none absolute inset-0">
        <svg viewBox="0 0 1200 900" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
          <path className="circuit-trace" d="M40 120 H360 V210 H620" />
          <path className="circuit-trace" d="M1180 160 H860 V260 H630" />
          <path className="circuit-trace" d="M100 350 H420 V460 H600" />
          <path className="circuit-trace" d="M1120 430 H780 V540 H640" />
          <path className="circuit-trace" d="M60 650 H330 V760 H560" />
          <path className="circuit-trace" d="M1140 720 H830 V820 H620" />
          <circle className="circuit-node" cx="360" cy="210" r="4" />
          <circle className="circuit-node" cx="860" cy="260" r="4" />
          <circle className="circuit-node" cx="420" cy="460" r="4" />
          <circle className="circuit-node" cx="780" cy="540" r="4" />
          <circle className="circuit-node" cx="330" cy="760" r="4" />
          <circle className="circuit-node" cx="830" cy="820" r="4" />
        </svg>
      </div>

      <div className="absolute left-3 md:left-1/2 top-0 bottom-14 w-[4px] md:w-[6px] md:-translate-x-1/2 rounded-full bg-gradient-to-b from-sky-300 via-blue-500 to-sky-300 opacity-60 md:opacity-100" />
      <div className="ev-timeline-pulse absolute left-3 md:left-1/2 top-0 bottom-14 w-[4px] md:w-[6px] md:-translate-x-1/2 rounded-full opacity-45 md:opacity-100" />
      <div className="ev-timeline-flow absolute left-3 md:left-1/2 top-0 bottom-14 w-1 md:w-2 md:-translate-x-1/2 rounded-full opacity-35 md:opacity-100" />

      <div className="relative z-10 space-y-12">
        {timelineEvents.map((event, i) => {
          const stepColor = getStepColor(i, timelineEvents.length)
          return (
          <div key={`${event.title}-${i}`} className="relative pt-12 pl-8 md:pl-0 md:grid md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-8">
            <span className="timeline-junction-dot pointer-events-none absolute left-3 md:left-1/2 top-[7px] md:-translate-x-1/2 hidden md:block" />
            <span
              className={cn(
                'timeline-connector pointer-events-none absolute top-[14px] hidden md:block',
                i % 2 === 0 ? 'right-1/2 mr-3' : 'left-1/2 ml-3'
              )}
              style={{ backgroundColor: stepColor }}
            />

            <div className={cn('min-h-1 col-start-1', i % 2 === 0 ? 'md:col-start-1' : 'md:col-start-3')}>
              <div className={cn('relative max-w-[460px] space-y-3 text-left', i % 2 === 0 ? 'md:ml-auto md:text-right' : 'md:mr-auto md:text-left')}>
                <div className={cn('flex items-center gap-2 justify-start', i % 2 === 0 ? 'md:justify-end' : 'md:justify-start')}>
                  {i % 2 !== 0 && <img src={getOrgIconUrl(event.org)} alt={`${event.org} icon`} className="hidden md:block h-7 w-7 rounded-full border border-sky-300/60 bg-white p-0.5" />}
                  <div className={cn('rounded-full border px-3 py-1 text-xs font-semibold', i % 2 === 0 ? 'border-blue-300 bg-blue-100/80 text-blue-700' : 'border-red-300 bg-red-100/80 text-red-700')}>
                    {event.period}
                  </div>
                  {i % 2 === 0 && <img src={getOrgIconUrl(event.org)} alt={`${event.org} icon`} className="hidden md:block h-7 w-7 rounded-full border border-sky-300/60 bg-white p-0.5" />}
                </div>

                <div
                  className={cn(
                    'timeline-title-tag timeline-title-tag-left inline-flex w-full md:w-auto max-w-full items-center gap-2 px-3 md:px-4 py-2 text-sm md:text-lg font-extrabold uppercase tracking-tight text-white',
                    i % 2 !== 0 && 'md:timeline-title-tag-right'
                  )}
                  style={{
                    backgroundImage:
                      i % 2 === 0
                        ? 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 56%, #3b82f6 100%)'
                        : 'linear-gradient(270deg, #dc2626 0%, #ef4444 56%, #f87171 100%)',
                  }}
                >
                  {(() => {
                    const Icon = kindMeta[event.kind].Icon
                    return <Icon className="h-5 w-5 shrink-0" />
                  })()}
                  <span className="break-words whitespace-normal">{event.title}</span>
                </div>

                <p className={cn('text-sm font-semibold', i % 2 === 0 ? 'text-blue-700' : 'text-red-700')}>{event.org}</p>

                <ul className={cn('space-y-2 text-sm text-slate-600 pl-1', i % 2 === 0 ? 'md:pr-1 md:pl-0' : 'md:pl-1')}>
                  {event.points.map((point, pointIndex) => (
                    <li key={`${event.title}-point-${pointIndex}`} className={cn('flex items-start gap-2.5 text-left', i % 2 === 0 ? 'md:flex-row-reverse md:text-right' : 'md:text-left')}>
                      {(() => {
                        const HighlightIcon = highlightIcons[pointIndex % highlightIcons.length]
                        return (
                          <span className={cn('mt-[1px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-white', i % 2 === 0 ? 'border-blue-300 text-blue-600' : 'border-red-300 text-red-600')}>
                            <HighlightIcon className="h-3 w-3" />
                          </span>
                        )
                      })()}
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={cn('hidden md:block min-h-1', i % 2 === 0 ? 'md:col-start-3' : 'md:col-start-1')} />
          </div>
        )})}
      </div>
    </div>
  )
}

function ContactContent() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [statusText, setStatusText] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setStatusText('')

    try {
      const response = await fetch(CONTACT_FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name || 'Not provided',
          email,
          message,
          _subject: `Portfolio contact: ${name || 'New message'}`,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.error || 'Failed to send message.')
      }

      setStatus('sent')
      setStatusText('Message sent. Thank you!')
      setName('')
      setEmail('')
      setMessage('')
    } catch (error) {
      setStatus('error')
      setStatusText(error instanceof Error ? error.message : 'Could not send message.')
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-slate-600 mb-8 text-center">
        I&apos;d love to hear from you! Fill out the form below and I&apos;ll get back to you as soon as possible.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        <a
          href={`mailto:${portfolioData.email}`}
          className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 text-left shadow-sm transition-colors hover:bg-sky-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Mail className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</span>
            <span className="block text-sm font-medium text-slate-700 break-all">{portfolioData.email}</span>
          </span>
        </a>
        <a
          href={`tel:${portfolioData.phone.replace(/\s+/g, '')}`}
          className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 text-left shadow-sm transition-colors hover:bg-sky-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Phone className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mobile</span>
            <span className="block text-sm font-medium text-slate-700">{portfolioData.phone}</span>
          </span>
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 resize-none"
            placeholder="Your message..."
          />
        </div>
        <p
          className={`text-sm ${
            status === 'sent'
              ? 'text-emerald-600'
              : status === 'error'
                ? 'text-red-600'
                : 'text-slate-500'
          }`}
        >
          {statusText || ' '}
        </p>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-400 hover:to-blue-500 transition-all hover:scale-[1.02] shadow-lg shadow-sky-300/30 disabled:opacity-60 disabled:hover:scale-100"
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
