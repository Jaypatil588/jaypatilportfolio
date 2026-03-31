'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChargerScene } from './charger-scene'
import { PortfolioScreen } from './portfolio-screen'

type AppState = 'charger' | 'zooming' | 'portfolio'

export function EVPortfolio() {
  const [state, setState] = useState<AppState>('charger')

  const handleStart = () => {
    setState('zooming')
    setTimeout(() => setState('portfolio'), 800)
  }

  const handleBack = () => {
    setState('charger')
  }

  return (
    <div className="w-full h-screen overflow-hidden relative bg-slate-900">
      {/* Charger Scene */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-[800ms] ease-out',
          state === 'charger' ? 'opacity-100 scale-100' : 'opacity-0 scale-[3] origin-[35%_40%] pointer-events-none'
        )}
      >
        <ChargerScene onStart={handleStart} />
      </div>

      {/* Portfolio Screen — charger bezel frame */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-[600ms]',
          state === 'portfolio' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col">
          {/* Charger OS header bar */}
          <div className="h-9 bg-slate-950 shrink-0 flex items-center justify-between px-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                <span className="text-[11px] font-bold tracking-wider uppercase">Exit</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
              </svg>
              <span className="text-[11px] text-sky-400 font-mono font-bold tracking-widest">EV POWER OS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-green-400 font-mono">CONNECTED</span>
            </div>
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-hidden rounded-b-xl border-x border-b border-slate-700">
            <PortfolioScreen />
          </div>
        </div>
      </div>
    </div>
  )
}
