'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChargerScene } from './charger-scene'
import { PortfolioScreen } from './portfolio-screen'

type AppState = 'charger' | 'zooming' | 'portfolio'

export function EVPortfolio() {
  const router = useRouter()
  const [state, setState] = useState<AppState>('charger')
  const [zoomOrigin, setZoomOrigin] = useState('74% 50%')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('screen') === '2') {
      setState('portfolio')
    }
  }, [])

  const handleStart = (focus?: { xPct: number; yPct: number }) => {
    if (focus) {
      const rightBiasedX = Math.min(100, focus.xPct + 10)
      setZoomOrigin(`${rightBiasedX}% ${focus.yPct}%`)
    }
    setState('zooming')
    // After zoom animation completes, show portfolio
    setTimeout(() => {
      setState('portfolio')
    }, 800)
  }

  const handleBackToCharger = () => {
    setState('charger')
  }

  return (
    <div className="w-full h-screen overflow-hidden relative">
      {/* Charger Scene */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-800 ease-out',
          state === 'charger' && 'opacity-100 scale-100',
          state === 'zooming' && 'opacity-100 scale-[3.6]',
          state === 'portfolio' && 'opacity-0 scale-[5] pointer-events-none'
        )}
        style={{ transformOrigin: zoomOrigin }}
      >
        <ChargerScene onStart={handleStart} />
      </div>

      {/* Charger Screen Frame (visible during zoom and portfolio state) */}
      <div
        className={cn(
          'absolute inset-0',
          state === 'charger' && 'opacity-0 pointer-events-none',
          state === 'zooming' && 'opacity-0 pointer-events-none',
          state === 'portfolio' && 'opacity-100'
        )}
      >
        {/* Outer frame: monitor-focused background from final.webm */}
        <div className="w-full h-full relative overflow-hidden bg-slate-200">
          <video
            src="/ev-charging-final.webm"
            className="absolute inset-0 w-full h-full object-cover blur-sm"
            style={{
              objectPosition: '74% 50%',
              transform: 'scale(4.45)',
              transformOrigin: '74% 50%',
            }}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-slate-950/8" />

          {/* Inner screen rectangle (header + screen 2) */}
          <div className="absolute left-1/2 top-1/2 h-[88%] w-[84%] -translate-x-1/2 -translate-y-1/2 overflow-hidden border-2 border-slate-700/80 bg-white relative z-10 rounded-[0.8rem]">
            {/* Header */}
            <div className="h-10 border-b border-slate-700/70 bg-slate-900/82 backdrop-blur flex items-center justify-between px-4 z-20">
              <div className="flex items-center gap-2">
                {state === 'portfolio' && (
                  <button
                    type="button"
                    onClick={handleBackToCharger}
                    className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-red-800 text-white hover:bg-red-700 transition-colors"
                    aria-label="Back to charger scene"
                  >
                    {'← EXIT'}
                  </button>
                )}
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-sky-400 font-mono">CONNECTED</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/auth')}
                  className="inline-flex items-center justify-center rounded-md p-1.5 text-sky-300 hover:text-sky-100 hover:bg-slate-800/70 transition-colors"
                  aria-label="Open admin auth"
                  title="Open admin auth"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                </svg>
                <span className="text-xs font-mono animate-charging-text">EV POWER OS</span>
              </div>
            </div>

            {/* Screen 2 body */}
            <div className="h-[calc(100%-2.5rem)] overflow-y-auto no-scrollbar">
              <PortfolioScreen />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
