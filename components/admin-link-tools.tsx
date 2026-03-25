'use client'

import { useState } from 'react'

interface LinkItem {
  label: string
  url: string
}

interface AdminLinkToolsProps {
  links: LinkItem[]
}

export function AdminLinkTools({ links }: AdminLinkToolsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (label: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(label)
      setTimeout(() => setCopied((current) => (current === label ? null : current)), 1500)
    } catch {
      setCopied(null)
    }
  }

  return (
    <section className="rounded-2xl border border-primary/20 bg-card/60 p-4">
      <h2 className="text-xl font-semibold mb-3">Share Links</h2>
      <div className="space-y-3">
        {links.map((link) => (
          <div
            key={link.label}
            className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 rounded-xl border border-white/10 p-3"
          >
            <div className="text-sm font-medium w-28 shrink-0">{link.label}</div>
            <code className="text-xs md:text-sm bg-background/60 rounded px-2 py-1 flex-1 overflow-x-auto">
              {link.url}
            </code>
            <button
              type="button"
              onClick={() => handleCopy(link.label, link.url)}
              className="rounded-lg border border-primary/40 px-3 py-2 text-sm text-primary hover:bg-primary/10 transition"
            >
              {copied === link.label ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

