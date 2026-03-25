'use client'

import { useEffect } from 'react'

export function VisitorTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref') || 'direct'
    const page = window.location.pathname || '/'
    const beaconUrl = `/api/track?ref=${encodeURIComponent(ref)}&page=${encodeURIComponent(page)}`
    const startedAt = Date.now()

    // Fire-and-forget visit tracking.
    fetch(beaconUrl, { method: 'GET', keepalive: true }).catch(() => {})

    const sendDuration = () => {
      const duration = Math.max(0, Math.round((Date.now() - startedAt) / 1000))
      const durationUrl = `${beaconUrl}&duration=${duration}`
      fetch(durationUrl, { method: 'GET', keepalive: true }).catch(() => {})
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') sendDuration()
    }

    window.addEventListener('pagehide', sendDuration)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('pagehide', sendDuration)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return null
}
