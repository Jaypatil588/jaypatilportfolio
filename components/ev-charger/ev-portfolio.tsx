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
          state === 'zooming' && 'opacity-0 scale-[3] origin-[35%_40%]',
          state === 'portfolio' && 'opacity-0 scale-[5] pointer-events-none'
        )}
      >
        <ChargerScene onStart={handleStart} />
      </div>

      {/* Charger Screen Frame (visible during zoom and portfolio state) */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-800',
          state === 'charger' && 'opacity-0 pointer-events-none',
          (state === 'zooming' || state === 'portfolio') && 'opacity-100'
        )}
      >
        {/* Charger screen bezel frame */}
        <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 p-4">
          {/* Screen border glow */}
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-[inset_0_0_30px_rgba(56,189,248,0.1)] relative">
            {/* Screen reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-10" />
            
            {/* Screen status bar */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/80 backdrop-blur flex items-center justify-between px-4 z-20">
              <div className="flex items-center gap-2">
                {state === 'portfolio' && (
                  <button
                    type="button"
                    onClick={handleBackToCharger}
                    className="inline-flex items-center justify-center text-sky-300 hover:text-white transition-colors"
                    aria-label="Back to charger scene"
                  >
                    ←
                  </button>
                )}
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-sky-400 font-mono">CONNECTED</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                </svg>
                <span className="text-[10px] text-sky-400 font-mono">EV POWER OS</span>
              </div>
            </div>

            {/* Portfolio content */}
            <div className="w-full h-full pt-8">
              <PortfolioScreen />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
