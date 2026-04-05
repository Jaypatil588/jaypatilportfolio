'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [passcode, setPasscode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })

      if (!response.ok) {
        setError('Invalid passcode')
        setLoading(false)
        return
      }

      router.push('/admin')
    } catch {
      setError('Unable to authenticate right now')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border border-primary/20 bg-card/70 p-8 shadow-2xl shadow-primary/10">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back()
              return
            }
            router.push('/')
          }}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-primary/25 px-3 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-foreground">Admin Auth</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter passcode to continue to dashboard.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            type="password"
            placeholder="Passcode"
            className="w-full rounded-xl border border-primary/25 bg-background/80 px-4 py-3 text-foreground outline-none focus:border-primary/60"
            autoFocus
            required
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </section>
    </main>
  )
}
