'use client'

interface ChargerSceneProps {
  onStart: () => void
}

// Canvas dimensions from scene-map.json
const W = 5440
const H = 3072

const pct = (val: number, total: number) => `${((val / total) * 100).toFixed(4)}%`

export function ChargerScene({ onStart }: ChargerSceneProps) {
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
          className="absolute animate-headlight-pulse"
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
          className="absolute animate-headlight-pulse"
          style={{
            left:   pct(4550, W),
            top:    pct(2320, H),
            width:  pct(570,  W),
            height: pct(550,  H),
            animationDelay: '350ms',
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
          className="absolute animate-cable-sway"
          style={{
            left:   pct(1880, W),
            top:    pct(480,  H),
            width:  pct(1520, W),
            height: pct(1720, H),
            transformOrigin: '83% 16%',
          }}
          draggable={false}
        />

        {/* plug  x:1680 y:2020 w:940 h:440 */}
        <img
          src="/extracted-assets/plug.svg"
          alt=""
          className="absolute animate-cable-sway"
          style={{
            left:   pct(1680, W),
            top:    pct(2020, H),
            width:  pct(940,  W),
            height: pct(440,  H),
            transformOrigin: '80% 10%',
            animationDelay: '200ms',
          }}
          draggable={false}
        />

        {/* battery charging indicator (no percentage text)  x:3490 y:1940 w:520 h:720 */}
        <div
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left:   pct(3490, W),
            top:    pct(1940, H),
            width:  pct(520,  W),
            height: pct(720,  H),
          }}
        >
          <div className="relative w-[54%] h-[68%]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[36%] h-[9%] rounded-t-[0.5vw] bg-slate-700" />
            <div className="absolute inset-x-0 top-[6%] bottom-0 rounded-[0.7vw] border-[0.25vw] border-slate-700 bg-slate-100/70 shadow-[0_0_16px_rgba(14,165,233,0.2)] overflow-hidden">
              <div className="absolute inset-[8%] rounded-[0.45vw] border border-slate-500/40 bg-slate-900/10 overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-emerald-500 via-lime-400 to-lime-300 animate-electric-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-[38%] h-[38%] text-slate-900/80 animate-pulse" fill="currentColor" aria-hidden="true">
                  <path d="M13 2L4 14h6l-1 8 11-13h-6l1-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
