'use client'

import Image from 'next/image'
import { Github, Linkedin, Mail, MapPin, Download, ExternalLink } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { OSWindow } from './os-window'

export function AboutWindow() {
  return (
    <OSWindow 
      id="about"
      title="About Me" 
      icon="👤" 
      defaultPosition={{ x: 20, y: 20 }}
      defaultSize={{ width: 'calc(50% - 30px)', height: 'calc(100% - 100px)' }}
      headerColor="bg-gradient-to-r from-[#ff9a9e]/90 to-[#fecfef]/90"
    >
      <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="p-5 space-y-5">
          {/* Header with photo and name */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-[#ff6b9d]/30 shadow-lg shrink-0">
              <Image
                src="/mugshot.webp"
                alt="Jay Patil"
                width={96}
                height={96}
                className="w-full h-full object-cover object-[50%_28%]"
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] truncate">
                {portfolioData.name}
              </h2>
              <p className="text-base text-[#5e60ce] font-medium">{portfolioData.title}</p>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-[#666]">
                <MapPin className="w-4 h-4" />
                <span>{portfolioData.location}</span>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="bg-gradient-to-r from-[#ff6b9d]/10 to-[#5e60ce]/10 rounded-xl p-4 border border-[#ff6b9d]/20">
            <p className="text-base font-medium text-[#1a1a2e]">{portfolioData.tagline}</p>
          </div>

          {/* Summary */}
          <p className="text-sm text-[#444] leading-relaxed">
            {portfolioData.summary}
          </p>

          {/* Skills */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide">Core Skills</h3>
            <div className="flex flex-wrap gap-2">
              {portfolioData.skills.languages.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-xs font-medium bg-[#667eea]/10 text-[#667eea] rounded-lg"
                >
                  {skill}
                </span>
              ))}
              {portfolioData.skills.frameworks.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-xs font-medium bg-[#f093fb]/10 text-[#c44cce] rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Cloud & Tools */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide">Cloud & Tools</h3>
            <div className="flex flex-wrap gap-2">
              {portfolioData.skills.cloud.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-xs font-medium bg-[#4facfe]/10 text-[#4facfe] rounded-lg"
                >
                  {skill}
                </span>
              ))}
              {portfolioData.skills.tools.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-xs font-medium bg-[#43e97b]/10 text-[#38b970] rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide">Education</h3>
            <div className="space-y-2">
              {portfolioData.education.map((edu, index) => (
                <div key={index} className="text-sm bg-white/50 rounded-lg p-3">
                  <p className="font-medium text-[#1a1a2e]">{edu.degree}</p>
                  <p className="text-[#5e60ce]">{edu.school}</p>
                  <p className="text-xs text-[#888] mt-1">{edu.period}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#e0e0e0]">
            <a
              href={portfolioData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#1a1a2e] text-white rounded-lg hover:bg-[#1a1a2e]/80 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href={portfolioData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#0077b5] text-white rounded-lg hover:bg-[#0077b5]/80 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href={`mailto:${portfolioData.email}`}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#ff6b9d] text-white rounded-lg hover:bg-[#ff6b9d]/80 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          </div>

          {/* Resume buttons */}
          <div className="flex items-center gap-3">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
              View Resume
            </a>
            <a
              href="/resume.pdf"
              download
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border-2 border-[#667eea] text-[#667eea] rounded-lg hover:bg-[#667eea]/10 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      </div>
    </OSWindow>
  )
}
