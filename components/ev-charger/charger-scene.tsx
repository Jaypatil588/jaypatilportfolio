'use client'

import { useState, useEffect } from 'react'

interface ChargerSceneProps {
  onStart: () => void
}

export function ChargerScene({ onStart }: ChargerSceneProps) {
  const [batteryLevel, setBatteryLevel] = useState(22)

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => (prev >= 95 ? 22 : prev + 1))
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-screen bg-gradient-to-br from-sky-100 via-white to-blue-50 flex items-center justify-center overflow-hidden relative">

      {/* ── Bounded background decoration ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Slow-spinning rings — bounded inside overflow-hidden */}
        <div
          className="absolute top-1/4 right-16 w-40 h-40 rounded-full border-2 border-sky-200 opacity-40"
          style={{ animation: 'spin 18s linear infinite' }}
        />
        <div
          className="absolute bottom-1/4 left-16 w-28 h-28 rounded-full border border-blue-200 opacity-30"
          style={{ animation: 'spin 22s linear infinite reverse' }}
        />
        {/* Floating lightning bolts — pinned positions, simple pulse */}
        <svg className="absolute top-16 left-24 w-8 h-8 text-sky-300 opacity-70" style={{ animation: 'pulse 2s ease-in-out infinite' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
        <svg className="absolute top-32 right-40 w-6 h-6 text-blue-300 opacity-60" style={{ animation: 'pulse 2.5s ease-in-out infinite 0.4s' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
        <svg className="absolute bottom-28 left-1/3 w-7 h-7 text-sky-200 opacity-50" style={{ animation: 'pulse 3s ease-in-out infinite 0.8s' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
        {/* Small floating dots — bounded positions */}
        {([
          { l: '12%', t: '30%', d: '0s' },
          { l: '22%', t: '60%', d: '0.5s' },
          { l: '75%', t: '25%', d: '1s' },
          { l: '85%', t: '65%', d: '1.5s' },
        ] as { l: string; t: string; d: string }[]).map((p, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-sky-400 rounded-full opacity-50"
            style={{ left: p.l, top: p.t, animation: `bounce 2s ease-in-out infinite ${p.d}` }}
          />
        ))}
      </div>

      {/* ── Main scene: flex-col on mobile, flex-row on desktop ── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end gap-6 lg:gap-0 px-4 pb-4 lg:pb-0">

        {/* ── EV Charger ── */}
        <div className="relative shrink-0">
          {/* Body */}
          <div className="w-44 lg:w-48 h-72 lg:h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-3xl rounded-b-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-sky-400 to-blue-500" />

            {/* Touchscreen display */}
            <div className="absolute top-8 left-4 right-4 h-36 lg:h-40 bg-slate-950 rounded-xl border-4 border-slate-700 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-3 flex flex-col">
                {/* Status row */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                  </div>
                  <span className="text-[8px] text-sky-400 font-mono tracking-wider">CHARGING</span>
                </div>

                {/* Battery */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <div className="relative w-16 h-8 border-2 border-sky-400 rounded-md overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-400 to-green-400 transition-all duration-300"
                      style={{ width: `${batteryLevel}%` }}
                    />
                    {/* Battery tip */}
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-sky-400 rounded-r" />
                  </div>
                  <span className="text-sky-400 font-mono text-lg font-bold">{batteryLevel}%</span>
                </div>

                {/* Start button */}
                <button
                  onClick={onStart}
                  className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg text-white font-bold text-xs uppercase tracking-widest hover:from-sky-400 hover:to-blue-500 transition-all active:scale-95 shadow-lg shadow-sky-500/30"
                >
                  Start
                </button>
              </div>
            </div>

            {/* Cable port */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-700 rounded-full border-4 border-slate-600 flex items-center justify-center">
              <div className="w-5 h-5 bg-sky-400 rounded-full" style={{ animation: 'pulse 1.2s ease-in-out infinite' }} />
            </div>

            {/* Branding */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span className="text-sky-400 font-bold text-[10px] tracking-widest">EV POWER</span>
            </div>
          </div>
          {/* Base */}
          <div className="w-52 h-5 bg-slate-700 rounded-lg -ml-2 shadow-xl" />
        </div>

        {/* ── Charging Cable with animated electricity ── */}
        <div className="relative w-32 lg:w-40 h-16 lg:h-20 -mb-4 lg:-mb-6 shrink-0">
          <svg className="w-full h-full" viewBox="0 0 160 80" overflow="visible">
            <defs>
              <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            {/* Cable shadow */}
            <path d="M 0 44 Q 40 64 80 44 Q 120 24 160 44" fill="none" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
            {/* Cable body */}
            <path d="M 0 40 Q 40 60 80 40 Q 120 20 160 40" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
            {/* Electricity flow — dashed stroke that moves */}
            <path
              d="M 0 40 Q 40 60 80 40 Q 120 20 160 40"
              fill="none"
              stroke="url(#cableGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="12 8"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="40" dur="0.6s" repeatCount="indefinite" />
            </path>
          </svg>

          {/* Spark dots on the cable */}
          {[25, 50, 75].map((pct, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
              style={{
                left: `${pct}%`,
                top: '50%',
                transform: 'translateY(-50%)',
                animation: `ping 1s ease-in-out infinite ${i * 0.25}s`,
              }}
            />
          ))}
        </div>

        {/* ── Electric Car ── */}
        <div className="relative shrink-0">
          <div className="relative w-60 lg:w-72 h-28 lg:h-32">
            {/* Car bottom body */}
            <div className="absolute bottom-0 left-0 right-0 h-16 lg:h-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl rounded-bl-3xl shadow-xl" />
            {/* Roof */}
            <div className="absolute bottom-14 lg:bottom-16 left-10 lg:left-12 right-10 lg:right-12 h-14 lg:h-16 bg-gradient-to-r from-slate-600 to-slate-500 rounded-t-2xl" />
            {/* Windshield */}
            <div className="absolute bg-gradient-to-br from-sky-200/70 to-sky-300/70 rounded-t-xl"
              style={{ top: 4, left: 56, right: 56, height: 56 }} />
            {/* Headlights */}
            <div className="absolute bottom-5 left-2 w-7 h-3 bg-yellow-100 rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            <div className="absolute bottom-5 right-2 w-7 h-3 bg-red-400 rounded-full opacity-80" />
            {/* Charging port glow */}
            <div className="absolute bottom-8 left-6 w-4 h-4 bg-sky-400 rounded-full shadow-lg" style={{ animation: 'pulse 1s ease-in-out infinite', boxShadow: '0 0 12px #38bdf8' }} />
            {/* EV badge */}
            <div className="absolute bottom-7 right-14 bg-sky-500 text-white text-[8px] font-bold px-2 py-0.5 rounded">EV</div>
            {/* Wheels */}
            {[{ l: 28, label: 'front' }, { r: 28, label: 'rear' }].map((_, i) => (
              <div
                key={i}
                className="absolute -bottom-3 w-11 lg:w-12 h-11 lg:h-12 bg-slate-900 rounded-full border-4 border-slate-600 flex items-center justify-center"
                style={{ [i === 0 ? 'left' : 'right']: 24 }}
              >
                <div className="w-4 h-4 rounded-full border-2 border-slate-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                </div>
              </div>
            ))}
          </div>
          {/* Car shadow */}
          <div className="w-56 lg:w-64 h-3 bg-slate-400/30 rounded-full blur-sm mx-auto mt-1" />
        </div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-200/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-16 left-0 right-0 h-px bg-slate-300/60" />
    </div>
  )
}
