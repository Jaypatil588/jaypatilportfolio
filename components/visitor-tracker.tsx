'use client'

import { useEffect } from 'react'

export function VisitorTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref') || 'direct'
    const page = window.location.pathname || '/'
    const beaconUrl = `/api/track?ref=${encodeURIComponent(ref)}&page=${encodeURIComponent(page)}`

    // Fire-and-forget visit tracking.
    fetch(beaconUrl, { method: 'GET', keepalive: true }).catch(() => {})
  }, [])

  return null
}

