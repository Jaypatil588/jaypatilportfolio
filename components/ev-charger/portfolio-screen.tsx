'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Linkedin, Github, FileText, MessageSquare, Send, X, ArrowLeft, Briefcase, Code, Mail, User } from 'lucide-react'

type CardType = 'about' | 'projects' | 'experience' | 'contact' | null

export function PortfolioScreen() {
  const [activeCard, setActiveCard] = useState<CardType>(null)

  const closeCard = () => setActiveCard(null)

  return (
    <div className="w-full h-full bg-white flex overflow-hidden relative">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-20 h-20 border-2 border-sky-100 rounded-full animate-spin-slow" />
        <div className="absolute bottom-20 left-10 w-16 h-16 border border-blue-100 rounded-full animate-spin-slow-reverse" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-sky-200 rounded-full animate-float" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-200 rounded-full animate-float animation-delay-300" />
      </div>

      {/* Left side - Profile & Cards (60%) */}
      <div className="w-[60%] h-full p-8 flex flex-col relative z-10">
        {/* Profile Section */}
        <div className="flex items-start gap-6 mb-8">
          {/* Profile Photo */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 border-2 border-sky-200 flex items-center justify-center shadow-lg overflow-hidden">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Name & Links */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Jay Patil</h1>
            <p className="text-slate-500 text-sm mb-4">Software Engineer</p>
            
            {/* Icon row */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-sky-200/50">
                <Linkedin className="w-5 h-5 text-sky-600" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg">
                <Github className="w-5 h-5 text-slate-700" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-200/50">
                <FileText className="w-5 h-5 text-blue-600" />
              </a>
            </div>
          </div>
        </div>

        {/* 2x2 Card Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* About Me Card */}
          <button
            onClick={() => setActiveCard('about')}
            className="group bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-200/50 hover:border-sky-300"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">About Me</h3>
            <p className="text-sm text-slate-500 line-clamp-2">Learn about my background, skills, and interests</p>
          </button>

          {/* Projects Card */}
          <button
            onClick={() => setActiveCard('projects')}
            className="group bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-300"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Projects</h3>
            <p className="text-sm text-slate-500 line-clamp-2">Showcase of my featured work and side projects</p>
          </button>

          {/* Experience Card */}
          <button
            onClick={() => setActiveCard('experience')}
            className="group bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-200/50 hover:border-indigo-300"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Experience</h3>
            <p className="text-sm text-slate-500 line-clamp-2">My professional journey and career timeline</p>
          </button>

          {/* Contact Card */}
          <button
            onClick={() => setActiveCard('contact')}
            className="group bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Contact Me</h3>
            <p className="text-sm text-slate-500 line-clamp-2">Get in touch for opportunities or collaborations</p>
          </button>
        </div>
      </div>

      {/* Right side - RAG Chat (40%) */}
      <div className="w-[40%] h-full bg-gradient-to-b from-slate-50 to-slate-100 border-l border-slate-200 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Ask Jay</h3>
              <p className="text-xs text-slate-500">AI-powered assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-600">Online</span>
            </div>
          </div>
        </div>

        {/* Chat messages area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Welcome message */}
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-100 max-w-[85%]">
              <p className="text-sm text-slate-700">
                Hi! I&apos;m Jay&apos;s AI assistant. Ask me anything about his skills, experience, or projects!
              </p>
            </div>
          </div>

          {/* Suggested questions */}
          <div className="space-y-2 mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Suggested questions</p>
            {[
              'What are your main skills?',
              'Tell me about your experience',
              'What projects have you worked on?'
            ].map((q, i) => (
              <button
                key={i}
                className="block w-full text-left text-sm bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl px-4 py-2.5 transition-all text-slate-600 hover:text-sky-700"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your question..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
            />
            <button className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl flex items-center justify-center hover:from-sky-400 hover:to-blue-500 transition-all hover:scale-105 shadow-lg shadow-sky-300/30">
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Popup Overlay */}
      {activeCard && (
        <div
          className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={closeCard}
        >
          <div
            className="w-[80%] max-h-[90%] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex items-center gap-4 p-6 border-b border-slate-100">
              <button
                onClick={closeCard}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeCard}</h2>
            </div>

            {/* Popup Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
              {activeCard === 'about' && <AboutContent />}
              {activeCard === 'projects' && <ProjectsContent />}
              {activeCard === 'experience' && <ExperienceContent />}
              {activeCard === 'contact' && <ContactContent />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AboutContent() {
  return (
    <div className="prose prose-slate max-w-none">
      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Background</h3>
          <p className="text-slate-600 mb-6">
            Software Engineer with 4+ years of experience building scalable cloud-native applications. 
            Passionate about creating elegant solutions to complex problems and continuously learning new technologies.
          </p>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL', 'Tailwind CSS'].map(skill => (
              <span key={skill} className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm border border-sky-200">
                {skill}
              </span>
            ))}
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-4">Education</h3>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="font-semibold text-slate-800">Bachelor of Science in Computer Science</p>
            <p className="text-slate-500 text-sm">University Name, 2020</p>
          </div>
        </div>

        {/* Sidebar with quick stats */}
        <div className="w-64 space-y-4">
          <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
            <p className="text-3xl font-bold text-sky-600">4+</p>
            <p className="text-sm text-slate-600">Years Experience</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-3xl font-bold text-blue-600">20+</p>
            <p className="text-sm text-slate-600">Projects Completed</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <p className="text-3xl font-bold text-indigo-600">5+</p>
            <p className="text-sm text-slate-600">Technologies</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectsContent() {
  const projects = [
    { title: 'Project Alpha', description: 'Project description placeholder - will be connected to database' },
    { title: 'Project Beta', description: 'Project description placeholder - will be connected to database' },
    { title: 'Project Gamma', description: 'Project description placeholder - will be connected to database' },
    { title: 'Project Delta', description: 'Project description placeholder - will be connected to database' },
  ]

  return (
    <div className="grid grid-cols-2 gap-6">
      {projects.map((project, i) => (
        <div key={i} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:border-sky-300 transition-all group">
          {/* Project image placeholder */}
          <div className="h-40 bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
            <Code className="w-12 h-12 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          {/* Project info */}
          <div className="p-4">
            <h4 className="font-bold text-slate-800 mb-2">{project.title}</h4>
            <p className="text-sm text-slate-500">{project.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExperienceContent() {
  const experiences = [
    { role: 'Senior Software Engineer', company: 'Company A', period: '2022 - Present', description: 'Experience description placeholder' },
    { role: 'Software Engineer', company: 'Company B', period: '2020 - 2022', description: 'Experience description placeholder' },
    { role: 'Junior Developer', company: 'Company C', period: '2019 - 2020', description: 'Experience description placeholder' },
  ]

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-400 to-blue-500" />

      <div className="space-y-8">
        {experiences.map((exp, i) => (
          <div key={i} className="relative flex gap-6 pl-12">
            {/* Timeline dot */}
            <div className="absolute left-4 w-5 h-5 rounded-full bg-white border-4 border-sky-400 -translate-x-1/2" />
            
            {/* Content */}
            <div className="flex-1 bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-800">{exp.role}</h4>
                  <p className="text-sky-600 font-medium">{exp.company}</p>
                </div>
                <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{exp.period}</span>
              </div>
              <p className="text-sm text-slate-500">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactContent() {
  return (
    <div className="max-w-xl mx-auto">
      <p className="text-slate-600 mb-8 text-center">
        I&apos;d love to hear from you! Fill out the form below and I&apos;ll get back to you as soon as possible.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 resize-none"
            placeholder="Your message..."
          />
        </div>
        <button className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-400 hover:to-blue-500 transition-all hover:scale-[1.02] shadow-lg shadow-sky-300/30">
          Send Message
        </button>
      </div>
    </div>
  )
}
