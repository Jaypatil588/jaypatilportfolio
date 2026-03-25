'use client'

import { FormEvent, useState } from 'react'
import { portfolioData } from '@/lib/portfolio-data'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mlgorpjo'

export function LeaveMessageSection() {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState(
    'Dear Jay,\n\nI came across your portfolio and wanted to connect.\n\nRegards,\n'
  )
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [statusText, setStatusText] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setStatusText('')

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name || 'Not provided',
          subject,
          message,
          _subject: `Portfolio message: ${subject}`,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.error || 'Failed to send message.')
      }

      setStatus('sent')
      setStatusText('Message sent. Thank you!')
      setName('')
      setSubject('')
      setMessage('Dear Jay,\n\nI came across your portfolio and wanted to connect.\n\nRegards,\n')
    } catch (error) {
      setStatus('error')
      setStatusText(error instanceof Error ? error.message : 'Could not send message.')
    }
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl glass p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Leave me a <span className="gradient-text">message!</span>
          </h2>
          <p className="text-muted-foreground mb-6">Write to me in letter format. I&apos;ll get it on email.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3">
                <label className="text-xs text-muted-foreground block mb-1">To</label>
                <p className="text-sm text-foreground">{portfolioData.name} &lt;{portfolioData.email}&gt;</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3">
                <label htmlFor="name" className="text-xs text-muted-foreground block mb-1">
                  Name (optional)
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3">
              <label htmlFor="subject" className="text-xs text-muted-foreground block mb-1">
                Subject
              </label>
              <input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Opportunity / Collaboration / Quick question"
                className="w-full bg-transparent text-sm text-foreground outline-none"
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3">
              <label htmlFor="message" className="text-xs text-muted-foreground block mb-1">
                Letter
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={10}
                className="w-full resize-y bg-transparent text-sm text-foreground outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-sm ${
                  status === 'sent'
                    ? 'text-emerald-400'
                    : status === 'error'
                      ? 'text-red-400'
                      : 'text-muted-foreground'
                }`}
              >
                {statusText || ' '}
              </p>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
