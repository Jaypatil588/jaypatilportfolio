'use client'

import Image from 'next/image'
import { Github, Linkedin, Mail, MapPin, Download, ExternalLink } from 'lucide-react'
import { portfolioData } from '@/lib/portfolio-data'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AboutWindow() {
  return (
    <ScrollArea className="h-[280px] md:h-[320px]">
      <div className="p-4 space-y-4">
        {/* Header with photo and name */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-[#ff6b9d]/30 shadow-lg shrink-0">
            <Image
              src="/mugshot.webp"
              alt="Jay Patil"
              width={80}
              height={80}
              className="w-full h-full object-cover object-[50%_28%]"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-[#1a1a2e] truncate">
              {portfolioData.name}
            </h2>
            <p className="text-sm text-[#5e60ce] font-medium">{portfolioData.title}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-[#666]">
              <MapPin className="w-3 h-3" />
              <span>{portfolioData.location}</span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="bg-gradient-to-r from-[#ff6b9d]/10 to-[#5e60ce]/10 rounded-lg p-3 border border-[#ff6b9d]/20">
          <p className="text-sm font-medium text-[#1a1a2e]">{portfolioData.tagline}</p>
        </div>

        {/* Summary */}
        <p className="text-xs md:text-sm text-[#444] leading-relaxed">
          {portfolioData.summary}
        </p>

        {/* Skills preview */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#666] uppercase tracking-wide">Core Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {portfolioData.skills.languages.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-[10px] font-medium bg-[#667eea]/10 text-[#667eea] rounded-md"
              >
                {skill}
              </span>
            ))}
            {portfolioData.skills.frameworks.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-[10px] font-medium bg-[#f093fb]/10 text-[#c44cce] rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#666] uppercase tracking-wide">Education</h3>
          {portfolioData.education.map((edu, index) => (
            <div key={index} className="text-xs">
              <p className="font-medium text-[#1a1a2e]">{edu.degree}</p>
              <p className="text-[#666]">{edu.school}</p>
            </div>
          ))}
        </div>

        {/* Social links */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#e0e0e0]">
          <a
            href={portfolioData.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1a1a2e] text-white rounded-lg hover:bg-[#1a1a2e]/80 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
          <a
            href={portfolioData.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0077b5] text-white rounded-lg hover:bg-[#0077b5]/80 transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
            LinkedIn
          </a>
          <a
            href={`mailto:${portfolioData.email}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#ff6b9d] text-white rounded-lg hover:bg-[#ff6b9d]/80 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </a>
        </div>

        {/* Resume buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Resume
          </a>
          <a
            href="/resume.pdf"
            download
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border-2 border-[#667eea] text-[#667eea] rounded-lg hover:bg-[#667eea]/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </div>
    </ScrollArea>
  )
}
