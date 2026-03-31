'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Linkedin, Github, FileText, MessageSquare, Send, ArrowLeft, Briefcase, Code, Mail, User } from 'lucide-react'

type CardType = 'about' | 'projects' | 'experience' | 'contact' | null

export function PortfolioScreen() {
  const [activeCard, setActiveCard] = useState<CardType>(null)

  return (
    <div className="w-full h-full bg-white flex overflow-hidden relative">

      {/* ── Bounded decorative background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-8 right-8 w-24 h-24 rounded-full border-2 border-sky-100 opacity-60"
          style={{ animation: 'spin 20s linear infinite' }}
        />
        <div
          className="absolute bottom-16 left-8 w-16 h-16 rounded-full border border-blue-100 opacity-50"
          style={{ animation: 'spin 25s linear infinite reverse' }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-2 h-2 bg-sky-200 rounded-full"
          style={{ animation: 'bounce 3s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full"
          style={{ animation: 'bounce 2.5s ease-in-out infinite 0.5s' }}
        />
      </div>

      {/* ── Main layout: col on mobile, row on desktop ── */}
      <div className="flex flex-col lg:flex-row w-full h-full relative z-10">

        {/* Left / Top — Profile + Cards (60% desktop, full mobile) */}
        <div className="flex flex-col lg:w-[60%] h-auto lg:h-full p-5 lg:p-8 gap-5 lg:gap-6 overflow-hidden">

          {/* Profile row */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 border-2 border-sky-200 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              <User className="w-8 h-8 lg:w-10 lg:h-10 text-sky-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl lg:text-3xl font-bold text-slate-800 truncate">Jay Patil</h1>
              <p className="text-slate-500 text-xs lg:text-sm mb-2">Software Engineer</p>
              <div className="flex gap-2">
                {[
                  { icon: Linkedin, color: 'text-sky-600', bg: 'bg-sky-50 hover:bg-sky-100 border-sky-200', label: 'LinkedIn' },
                  { icon: Github, color: 'text-slate-700', bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200', label: 'GitHub' },
                  { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200', label: 'Resume' },
                ].map(({ icon: Icon, color, bg, label }) => (
                  <a
                    key={label}
                    href="#"
                    className={cn('w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-110 hover:shadow-md', bg)}
                    aria-label={label}
                  >
                    <Icon className={cn('w-4 h-4', color)} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 2x2 card grid — fills remaining space */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4 flex-1 min-h-0">
            {[
              { id: 'about' as CardType, label: 'About Me', desc: 'Background, skills & interests', icon: User, from: 'from-sky-50', to: 'to-sky-100', border: 'border-sky-200 hover:border-sky-400', iconBg: 'bg-sky-500' },
              { id: 'projects' as CardType, label: 'Projects', desc: 'Featured work & side projects', icon: Code, from: 'from-blue-50', to: 'to-blue-100', border: 'border-blue-200 hover:border-blue-400', iconBg: 'bg-blue-500' },
              { id: 'experience' as CardType, label: 'Experience', desc: 'Career timeline & roles', icon: Briefcase, from: 'from-indigo-50', to: 'to-indigo-100', border: 'border-indigo-200 hover:border-indigo-400', iconBg: 'bg-indigo-500' },
              { id: 'contact' as CardType, label: 'Contact Me', desc: 'Get in touch', icon: Mail, from: 'from-slate-50', to: 'to-slate-100', border: 'border-slate-200 hover:border-slate-400', iconBg: 'bg-slate-700' },
            ].map(({ id, label, desc, icon: Icon, from, to, border, iconBg }) => (
              <button
                key={id}
                onClick={() => setActiveCard(id)}
                className={cn(
                  'group bg-gradient-to-br rounded-2xl p-4 lg:p-5 text-left border transition-all duration-200',
                  'hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]',
                  from, to, border
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md', iconBg)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm lg:text-base mb-1">{label}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right / Bottom — Ask Jay RAG chat (40%) */}
        <div className="lg:w-[40%] flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 shrink-0 h-64 lg:h-full">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-white shrink-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm">Ask Jay</h3>
              <p className="text-[10px] text-slate-500">AI-powered assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <div className="w-2 h-2 bg-green-400 rounded-full" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span className="text-[10px] text-green-600 font-medium">Online</span>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
            {/* Bot greeting */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-100 max-w-[85%]">
                <p className="text-xs text-slate-700">Hi! I&apos;m Jay&apos;s AI assistant. Ask me anything about his skills, experience, or projects!</p>
              </div>
            </div>

            {/* Suggested questions */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider px-1">Suggested</p>
              {[
                'What are your main skills?',
                'Tell me about your experience',
                'What projects have you worked on?',
              ].map((q) => (
                <button
                  key={q}
                  className="block w-full text-left text-xs bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl px-3 py-2 transition-all text-slate-600 hover:text-sky-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your question..."
                className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 min-w-0"
              />
              <button className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center hover:from-sky-400 hover:to-blue-500 transition-all hover:scale-105 shadow-md shadow-sky-300/30 shrink-0">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card Popup Overlay ── */}
      {activeCard && (
        <div
          className="absolute inset-0 bg-white/75 backdrop-blur-sm z-50 flex items-center justify-center"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setActiveCard(null)}
        >
          <div
            className="w-[88%] lg:w-[80%] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100"
            style={{ maxHeight: '88%', animation: 'cardPop 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0 bg-gradient-to-r from-sky-500 to-blue-600">
              <button
                onClick={() => setActiveCard(null)}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <h2 className="text-lg font-bold text-white capitalize">
                {activeCard === 'experience' ? 'Resume & Experience' : activeCard}
              </h2>
            </div>

            {/* Popup content */}
            <div className={cn(
              'p-6 lg:p-8',
              activeCard === 'about' ? 'overflow-y-auto flex-1' : 'overflow-hidden flex-1 flex flex-col'
            )}>
              {activeCard === 'about' && <AboutContent />}
              {activeCard === 'projects' && <ProjectsContent />}
              {activeCard === 'experience' && <ExperienceContent />}
              {activeCard === 'contact' && <ContactContent />}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardPop {
          from { opacity: 0; transform: scale(0.9) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ── About ── scrollable, expand freely */
function AboutContent() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Background</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Software Engineer with 4+ years of experience building scalable cloud-native applications.
              Passionate about creating elegant solutions to complex problems. <span className="text-slate-400 italic">[More detail coming soon]</span>
            </p>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL', 'Tailwind CSS'].map(skill => (
                <span key={skill} className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs border border-sky-200">{skill}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-3">Education</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="font-semibold text-slate-800 text-sm">Bachelor of Science in Computer Science</p>
              <p className="text-slate-500 text-xs mt-1">University Name • 2020</p>
            </div>
          </div>
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
            <p className="text-xs text-sky-600 italic">More content will be added here — this section is scrollable.</p>
          </div>
        </div>

        <div className="flex flex-row lg:flex-col gap-3 lg:w-48 shrink-0">
          {[
            { val: '4+', label: 'Years Experience', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-600' },
            { val: '20+', label: 'Projects Built', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-600' },
            { val: '10+', label: 'Technologies', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-600' },
          ].map(s => (
            <div key={s.label} className={cn('flex-1 lg:flex-none rounded-xl p-4 border text-center', s.bg)}>
              <p className={cn('text-2xl font-bold', s.text)}>{s.val}</p>
              <p className="text-xs text-slate-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Projects ── no scroll, 2x2 grid that fits the popup */
function ProjectsContent() {
  const projects = [
    { title: 'Project Alpha', tech: 'React / Node.js' },
    { title: 'Project Beta', tech: 'Python / AWS' },
    { title: 'Project Gamma', tech: 'Next.js / PostgreSQL' },
    { title: 'Project Delta', tech: 'TypeScript / Docker' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {projects.map((project, i) => (
        <div
          key={i}
          className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all group flex flex-col"
        >
          {/* Image placeholder */}
          <div className="h-28 bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shrink-0">
            <Code className="w-10 h-10 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          {/* Info */}
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{project.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{project.tech}</p>
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">Description coming from database...</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Experience ── vertical timeline, fits popup */
function ExperienceContent() {
  const experiences = [
    { role: 'Senior Software Engineer', company: 'Company A', period: '2022 – Present', desc: 'Experience description placeholder — will be updated.' },
    { role: 'Software Engineer', company: 'Company B', period: '2020 – 2022', desc: 'Experience description placeholder — will be updated.' },
    { role: 'Junior Developer', company: 'Company C', period: '2019 – 2020', desc: 'Experience description placeholder — will be updated.' },
  ]

  return (
    <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
      <div className="relative pl-8">
        {/* Timeline line */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full" />
        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <div key={i} className="relative">
              {/* Dot */}
              <div className="absolute -left-5 top-4 w-4 h-4 rounded-full bg-white border-[3px] border-sky-400 shadow-sm" />
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:shadow-md hover:border-sky-200 transition-all">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{exp.role}</h4>
                    <p className="text-sky-600 font-medium text-xs">{exp.company}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap shrink-0">{exp.period}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{exp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Contact ── UI only */
function ContactContent() {
  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      <p className="text-sm text-slate-500 text-center">Get in touch — I&apos;d love to hear from you.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label>
          <input type="text" placeholder="Your name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
          <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message</label>
        <textarea rows={4} placeholder="Your message..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 resize-none" />
      </div>
      <button className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-400 hover:to-blue-500 transition-all hover:scale-[1.02] shadow-lg shadow-sky-300/30 text-sm">
        Send Message
      </button>
    </div>
  )
}
