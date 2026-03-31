'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface DesktopFrameProps {
  children: ReactNode
}

export function DesktopFrame({ children }: DesktopFrameProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f0e8] to-[#e8e2d9] flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Desk surface */}
      <div className="relative w-full max-w-6xl">
        {/* Sticky notes on desk - left side */}
        <motion.div 
          className="absolute -left-4 md:left-8 top-4 md:top-12 z-20"
          initial={{ rotate: -8, y: -20, opacity: 0 }}
          animate={{ rotate: -8, y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#4fd1a5] shadow-lg transform rotate-6 flex items-center justify-center p-2">
            <span className="text-[8px] md:text-xs text-green-900 font-medium">Skills</span>
          </div>
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#ffe066] shadow-lg -mt-4 ml-2 transform -rotate-3 flex items-center justify-center p-2">
            <span className="text-[8px] md:text-xs text-yellow-800 font-medium">Ideas</span>
          </div>
        </motion.div>

        {/* Sticky notes on desk - right side */}
        <motion.div 
          className="absolute -right-4 md:right-8 top-4 md:top-12 z-20"
          initial={{ rotate: 5, y: -20, opacity: 0 }}
          animate={{ rotate: 5, y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#b794f6] shadow-lg transform -rotate-6 flex items-center justify-center p-2">
            <span className="text-[8px] md:text-xs text-purple-900 font-medium">Goals</span>
          </div>
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#90cdf4] shadow-lg -mt-4 -ml-2 transform rotate-3 flex items-center justify-center p-2">
            <span className="text-[8px] md:text-xs text-blue-900 font-medium">Learn</span>
          </div>
        </motion.div>

        {/* Monitor */}
        <motion.div 
          className="relative mx-auto"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Monitor bezel */}
          <div className="bg-[#1a1a1a] rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-2xl">
            {/* Screen */}
            <div className="relative bg-gradient-to-br from-[#ff6b9d] via-[#c44cce] to-[#5e60ce] rounded-lg md:rounded-xl overflow-hidden aspect-[16/10]">
              {/* Screen content */}
              <div className="absolute inset-0">
                {children}
              </div>
              
              {/* Screen reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            </div>
          </div>
          
          {/* Monitor chin with Apple logo */}
          <div className="bg-[#1a1a1a] rounded-b-2xl md:rounded-b-3xl mx-auto w-[60%] h-6 md:h-10 flex items-center justify-center -mt-1">
            <svg className="w-4 h-4 md:w-6 md:h-6 text-[#333]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          
          {/* Monitor stand */}
          <div className="mx-auto w-[15%] h-16 md:h-24 bg-gradient-to-b from-[#c0c0c0] to-[#a0a0a0] rounded-b-lg" />
          <div className="mx-auto w-[30%] h-2 md:h-3 bg-gradient-to-b from-[#a0a0a0] to-[#808080] rounded-full shadow-lg" />
        </motion.div>

        {/* Desk items */}
        <div className="flex justify-between items-end mt-4 px-4 md:px-12">
          {/* Clock */}
          <motion.div 
            className="hidden md:block"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-[#f5f5dc] border-4 border-[#8b7355] shadow-lg flex items-center justify-center">
              <div className="relative w-14 h-14">
                <div className="absolute top-1/2 left-1/2 w-1 h-5 bg-[#333] origin-bottom -translate-x-1/2 -translate-y-full rotate-45" />
                <div className="absolute top-1/2 left-1/2 w-0.5 h-7 bg-[#333] origin-bottom -translate-x-1/2 -translate-y-full -rotate-12" />
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-[#333] rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </motion.div>

          {/* Keyboard */}
          <motion.div 
            className="mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0] rounded-lg shadow-lg px-4 md:px-8 py-2 md:py-3">
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-3 h-3 md:w-5 md:h-5 bg-[#d0d0d0] rounded-sm shadow-sm" />
                ))}
              </div>
              <div className="flex gap-1 mt-1 ml-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-3 h-3 md:w-5 md:h-5 bg-[#d0d0d0] rounded-sm shadow-sm" />
                ))}
              </div>
              <div className="flex gap-1 mt-1 justify-center">
                <div className="w-16 md:w-24 h-3 md:h-5 bg-[#d0d0d0] rounded-sm shadow-sm" />
              </div>
            </div>
          </motion.div>

          {/* Cup/Mug and books */}
          <motion.div 
            className="hidden md:flex items-end gap-2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex flex-col">
              <div className="w-4 h-16 bg-[#9b59b6] rounded-t-sm" />
              <div className="w-4 h-12 bg-[#3498db] rounded-t-sm -mt-0.5" />
              <div className="w-4 h-8 bg-[#e74c3c] rounded-t-sm -mt-0.5" />
            </div>
            <div className="w-10 h-12 bg-[#2c2c2c] rounded-b-lg relative">
              <div className="absolute -right-2 top-2 w-3 h-6 border-2 border-[#2c2c2c] rounded-r-full" />
            </div>
          </motion.div>
        </div>

        {/* Plant */}
        <motion.div 
          className="absolute -left-8 md:left-0 bottom-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-8 h-10 md:w-12 md:h-14 bg-[#d4a574] rounded-b-lg" />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 md:w-16 h-8 md:h-10 flex justify-center">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 md:w-3 h-8 md:h-12 bg-[#2d5a27] rounded-full origin-bottom"
                  style={{ transform: `rotate(${(i - 2) * 15}deg)` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
