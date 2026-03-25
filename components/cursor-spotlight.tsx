'use client'

import { ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'

interface CursorSpotlightProps {
  children: ReactNode
  className?: string
}

export function CursorSpotlight({ children, className }: CursorSpotlightProps) {
  const mouseX = useMotionValue(-9999)
  const mouseY = useMotionValue(-9999)

  return (
    <section
      className={className}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        mouseX.set(event.clientX - bounds.left)
        mouseY.set(event.clientY - bounds.top)
      }}
      onMouseLeave={() => {
        mouseX.set(-9999)
        mouseY.set(-9999)
      }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit]"
        style={{
          background: useMotionTemplate`radial-gradient(520px circle at ${mouseX}px ${mouseY}px, oklch(0.65 0.2 250 / 0.22), transparent 45%)`,
        }}
      />
      {children}
    </section>
  )
}
