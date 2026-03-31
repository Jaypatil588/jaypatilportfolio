'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ChargerSceneProps {
  onStart: () => void
}

export function ChargerScene({ onStart }: ChargerSceneProps) {
  const [batteryLevel, setBatteryLevel] = useState(20)

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => {
        if (prev >= 95) return 20
        return prev + 1
      })
    }, 150)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-screen bg-gradient-to-br from-sky-100 via-white to-blue-50 flex items-center justify-center overflow-hidden relative">
      {/* Floating animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Electric particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-sky-400 rounded-full animate-float opacity-60"
            style={{
              left: `${10 + (i * 7)}%`,
              top: `${20 + (i % 5) * 15}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + (i % 3)}s`
            }}
          />
        ))}
        
        {/* Lightning bolts */}
        <svg className="absolute top-20 left-20 w-8 h-8 text-sky-300 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
        <svg className="absolute top-40 right-32 w-6 h-6 text-blue-300 animate-pulse animation-delay-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
        <svg className="absolute bottom-32 left-40 w-10 h-10 text-sky-200 animate-pulse animation-delay-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>

        {/* Floating circles */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-sky-200 rounded-full animate-spin-slow opacity-30" />
        <div className="absolute bottom-1/4 left-1/5 w-24 h-24 border border-blue-200 rounded-full animate-spin-slow-reverse opacity-40" />
      </div>

      {/* Main scene container */}
      <div className="relative flex items-end gap-4 z-10">
        
        {/* EV Charger */}
        <div className="relative">
          {/* Charger body */}
          <div className="w-48 h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl rounded-b-lg shadow-2xl relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-sky-400 to-blue-500" />
            
            {/* Screen / Display */}
            <div className="absolute top-8 left-4 right-4 h-40 bg-slate-950 rounded-xl border-4 border-slate-700 overflow-hidden">
              {/* Screen content */}
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-3 flex flex-col">
                {/* Status bar */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                  </div>
                  <span className="text-[8px] text-sky-400 font-mono">READY</span>
                </div>
                
                {/* Battery indicator */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <div className="relative w-16 h-8 border-2 border-sky-400 rounded-md overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-400 to-green-400 transition-all duration-300"
                      style={{ width: `${batteryLevel}%` }}
                    />
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-sky-400 rounded-r" />
                  </div>
                  <span className="text-sky-400 font-mono text-lg font-bold">{batteryLevel}%</span>
                </div>

                {/* Start button */}
                <button
                  onClick={onStart}
                  className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg text-white font-bold text-xs uppercase tracking-wider hover:from-sky-400 hover:to-blue-500 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-sky-500/30"
                >
                  Start
                </button>
              </div>
            </div>

            {/* Cable port */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-700 rounded-full border-4 border-slate-600 flex items-center justify-center">
              <div className="w-6 h-6 bg-sky-400 rounded-full animate-pulse" />
            </div>

            {/* Branding */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <span className="text-sky-400 font-bold text-xs tracking-widest">EV POWER</span>
            </div>
          </div>

          {/* Charger base */}
          <div className="w-56 h-6 bg-slate-700 rounded-lg -ml-4 shadow-xl" />
        </div>

        {/* Charging cable with electricity */}
        <div className="relative w-40 h-20 -mb-6">
          {/* Cable path */}
          <svg className="w-full h-full" viewBox="0 0 160 80">
            <path
              d="M 0 40 Q 40 60 80 40 Q 120 20 160 40"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Electricity effect */}
            <path
              d="M 0 40 Q 40 60 80 40 Q 120 20 160 40"
              fill="none"
              stroke="url(#electricGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
              strokeDasharray="10 5"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;30"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </path>
            <defs>
              <linearGradient id="electricGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Sparks */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
              style={{
                left: `${30 + i * 30}%`,
                top: `${40 + (i % 2) * 20}%`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {/* Electric Car */}
        <div className="relative">
          {/* Car body */}
          <div className="relative w-72 h-32">
            {/* Main body */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl rounded-bl-3xl" />
            
            {/* Roof */}
            <div className="absolute bottom-16 left-12 right-12 h-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded-t-2xl" />
            
            {/* Windows */}
            <div className="absolute bottom-18 left-14 right-14 h-12 bg-gradient-to-br from-sky-200 to-sky-300 rounded-t-xl top-4" style={{ top: '16px' }} />
            
            {/* Headlights */}
            <div className="absolute bottom-6 left-2 w-6 h-3 bg-yellow-200 rounded-full animate-pulse" />
            <div className="absolute bottom-6 right-2 w-6 h-3 bg-red-400 rounded-full" />
            
            {/* Charging port glow */}
            <div className="absolute bottom-10 left-8 w-4 h-4 bg-sky-400 rounded-full animate-pulse shadow-lg shadow-sky-400/50" />
            
            {/* Wheels */}
            <div className="absolute -bottom-2 left-8 w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-600">
              <div className="w-full h-full rounded-full border-2 border-slate-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-400 rounded-full" />
              </div>
            </div>
            <div className="absolute -bottom-2 right-8 w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-600">
              <div className="w-full h-full rounded-full border-2 border-slate-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-400 rounded-full" />
              </div>
            </div>

            {/* EV badge */}
            <div className="absolute bottom-8 right-16 bg-sky-500 text-white text-[8px] font-bold px-2 py-0.5 rounded">
              EV
            </div>
          </div>

          {/* Car shadow */}
          <div className="w-64 h-4 bg-slate-300/50 rounded-full blur-sm mx-auto -mt-1" />
        </div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-200 to-transparent" />
      
      {/* Ground line */}
      <div className="absolute bottom-20 left-0 right-0 h-1 bg-slate-300" />
    </div>
  )
}
