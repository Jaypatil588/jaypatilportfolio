'use client'

import { useState, useEffect } from 'react'

interface ChargerSceneProps {
  onStart: () => void
}

// Canvas dimensions from scene-map.json
const W = 5440
const H = 3072

const pct = (val: number, total: number) => `${((val / total) * 100).toFixed(4)}%`

const BATTERY_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

export function ChargerScene({ onStart }: ChargerSceneProps) {
  const [batteryIdx, setBatteryIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setBatteryIdx(prev => (prev + 1) % BATTERY_LEVELS.length)
    }, 600)
    return () => clearInterval(id)
  }, [])

  const batteryLevel = BATTERY_LEVELS[batteryIdx]

  return (
    <div className="w-full h-screen overflow-hidden relative select-none">

      {/* ── WALLPAPER: full-screen source image ── */}
      <img
        src="/ev-scene-bg.png"
        alt="EV charging scene"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* ── SVG OVERLAYS: exact positions from scene-map.json ── */}
      <div className="absolute inset-0">

        {/* car-body  x:0 y:780 w:3600 h:2292 */}
        <img
          src="/extracted-assets/car-body.svg"
          alt=""
          className="absolute"
          style={{
            left:   pct(0,    W),
            top:    pct(780,  H),
            width:  pct(3600, W),
            height: pct(2292, H),
          }}
          draggable={false}
        />

        {/* headlight-left  x:1180 y:2260 w:980 h:710 */}
        <img
          src="/extracted-assets/headlight-left.svg"
          alt=""
          className="absolute"
          style={{
            left:   pct(1180, W),
            top:    pct(2260, H),
            width:  pct(980,  W),
            height: pct(710,  H),
          }}
          draggable={false}
        />

        {/* headlight-right  x:4550 y:2320 w:570 h:550 */}
        <img
          src="/extracted-assets/headlight-right.svg"
          alt=""
          className="absolute"
          style={{
            left:   pct(4550, W),
            top:    pct(2320, H),
            width:  pct(570,  W),
            height: pct(550,  H),
          }}
          draggable={false}
        />



        {/* charger-body  x:3220 y:40 w:1580 h:3010 */}
        <img
          src="/extracted-assets/charger-body.svg"
          alt=""
          className="absolute"
          style={{
            left:   pct(3220, W),
            top:    pct(40,   H),
            width:  pct(1580, W),
            height: pct(3010, H),
          }}
          draggable={false}
        />

        {/* charger-monitor  x:2890 y:560 w:1830 h:1000 */}
        <div
          className="absolute"
          style={{
            left:   pct(2890, W),
            top:    pct(560,  H),
            width:  pct(1830, W),
            height: pct(1000, H),
          }}
        >
          <img
            src="/extracted-assets/charger-monitor.svg"
            alt=""
            className="w-full h-full"
            draggable={false}
          />
          {/*
            Dark screen starts at y=111 out of 1000px SVG height (11.1% from top).
            Button covers only the dark screen area, not the silver bezel above.
          */}
          <button
            onClick={onStart}
            className="absolute left-0 right-0 bottom-0 flex flex-col items-center justify-center gap-[6%] group"
            style={{ top: '11.1%' }}
            aria-label="Enter portfolio"
          >
            <div className="absolute inset-[4%] rounded-xl bg-sky-400/0 group-hover:bg-sky-400/10 transition-colors duration-300" />
            <span
              className="relative z-10 font-bold tracking-[0.25em] uppercase text-white drop-shadow-lg"
              style={{ fontSize: 'clamp(9px, 1.4vw, 20px)' }}
            >
              TAP TO ENTER
            </span>
            <div
              className="relative z-10 rounded-full border-2 border-white/60 flex items-center justify-center animate-pulse group-hover:border-sky-300 transition-colors"
              style={{ width: 'clamp(20px, 2.8vw, 44px)', aspectRatio: '1' }}
            >
              <div
                className="rounded-full bg-white/25 group-hover:bg-sky-300/40 transition-colors"
                style={{ width: '55%', aspectRatio: '1' }}
              />
            </div>
          </button>
        </div>

        {/* cable + plug rendered ABOVE monitor so wire is always visible */}
        {/* cable  x:1880 y:480 w:1520 h:1720 */}
        <img
          src="/extracted-assets/cable.svg"
          alt=""
          className="absolute"
          style={{
            left:   pct(1880, W),
            top:    pct(480,  H),
            width:  pct(1520, W),
            height: pct(1720, H),
          }}
          draggable={false}
        />

        {/* plug  x:1680 y:2020 w:940 h:440 */}
        <img
          src="/extracted-assets/plug.svg"
          alt=""
          className="absolute"
          style={{
            left:   pct(1680, W),
            top:    pct(2020, H),
            width:  pct(940,  W),
            height: pct(440,  H),
          }}
          draggable={false}
        />

        {/* battery (animated)  x:3490 y:1940 w:520 h:720 */}
        <img
          src={`/extracted-assets/battery-${batteryLevel}.svg`}
          alt={`Battery ${batteryLevel}%`}
          className="absolute object-contain"
          style={{
            left:   pct(3490, W),
            top:    pct(1940, H),
            width:  pct(520,  W),
            height: pct(720,  H),
          }}
          draggable={false}
        />

      </div>
    </div>
  )
}
