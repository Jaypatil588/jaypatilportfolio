'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function AdminResetVisits() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>('')

  const handleReset = async () => {
    const confirmed = window.confirm('Reset all visits and unique visitor counts?')
    if (!confirmed) return

    setMessage('')
    const response = await fetch('/api/admin/reset-visits', { method: 'POST' })

    if (!response.ok) {
      setMessage('Failed to reset')
      return
    }

    setMessage('Visits reset')
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleReset}
        disabled={pending}
        className="rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 transition disabled:opacity-60"
      >
        {pending ? 'Resetting...' : 'Reset Visits'}
      </button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  )
}

