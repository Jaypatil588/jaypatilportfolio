'use client'

import { useEffect, useState } from 'react'

interface ChargerSceneProps {
  onStart: () => void
}

// Source coordinate space for final.webm
const W = 2667
const H = 1500

// Charger screen square bounds in source coordinates
const BOX_X = 1525
const BOX_Y = 490
const BOX_W = 455
const BOX_H = 295

export function ChargerScene({ onStart }: ChargerSceneProps) {
  const [viewport, setViewport] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Keep slightly right-biased framing on narrow screens so charger monitor stays visible.
  const objectPosX = viewport.w > 0 && viewport.w < 768 ? 0.68 : 0.5
  const objectPosY = 0.5

  const scale = Math.max(viewport.w / W || 0, viewport.h / H || 0)
  const renderedW = W * scale
  const renderedH = H * scale
  const offsetX = (viewport.w - renderedW) * objectPosX
  const offsetY = (viewport.h - renderedH) * objectPosY

  const boxLeft = offsetX + BOX_X * scale
  const boxTop = offsetY + BOX_Y * scale
  const boxWidth = BOX_W * scale
  const boxHeight = BOX_H * scale
  const fontSizePx = Math.max(12, Math.min(56, boxHeight * 0.22))

  return (
    <div className="w-full h-screen overflow-hidden relative select-none bg-[#d7e3ea]">
      <video
        src="/ev-charging-final.webm"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: `${objectPosX * 100}% ${objectPosY * 100}%` }}
        autoPlay
        muted
        loop
        playsInline
      />

      <button
        type="button"
        onClick={onStart}
        aria-label="Enter portfolio"
        className="absolute cursor-pointer flex items-center justify-center text-[#0b84d8] font-bold text-center leading-tight hover:text-[#0667ac] transition-colors"
        style={{
          left: `${boxLeft}px`,
          top: `${boxTop}px`,
          width: `${boxWidth}px`,
          height: `${boxHeight}px`,
          fontSize: `${fontSizePx}px`,
          WebkitTextStroke: '1.2px #05518a',
          textShadow: '0 0 1px #05518a',
        }}
      >
        <span>
          <span className="block">Click here</span>
          <span className="block">to start</span>
        </span>
      </button>
    </div>
  )
}
