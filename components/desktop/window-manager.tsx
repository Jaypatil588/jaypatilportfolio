'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type WindowState = 'open' | 'minimized' | 'maximized'

interface WindowInfo {
  id: string
  state: WindowState
  zIndex: number
  isLoading: boolean
}

interface WindowManagerContextType {
  windows: Map<string, WindowInfo>
  activeWindowId: string | null
  openWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  getWindowState: (id: string) => WindowState
  isWindowLoading: (id: string) => boolean
  setWindowLoading: (id: string, loading: boolean) => void
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null)

export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (!context) {
    // Return a safe no-op fallback for stale cached components or hot-reload artifacts
    const noop = () => {}
    return {
      windows: new Map(),
      activeWindowId: null,
      openWindow: noop,
      minimizeWindow: noop,
      maximizeWindow: noop,
      closeWindow: noop,
      focusWindow: noop,
      getWindowState: () => 'open' as const,
      isWindowLoading: () => false,
      setWindowLoading: noop,
    }
  }
  return context
}

// Window Manager Provider — manages z-index and window states
interface WindowManagerProviderProps {
  children: ReactNode
  initialWindows?: { id: string; state: WindowState; isLoading?: boolean }[]
}

export function WindowManagerProvider({ children, initialWindows = [] }: WindowManagerProviderProps) {
  const [windows, setWindows] = useState<Map<string, WindowInfo>>(() => {
    const map = new Map<string, WindowInfo>()
    initialWindows.forEach((w, index) => {
      map.set(w.id, { 
        id: w.id, 
        state: w.state, 
        zIndex: w.state === 'open' ? 10 + index : 1,
        isLoading: w.isLoading ?? false
      })
    })
    return map
  })
  
  const [activeWindowId, setActiveWindowId] = useState<string | null>(
    initialWindows.find(w => w.state === 'open')?.id ?? null
  )
  const [topZIndex, setTopZIndex] = useState(20)

  const openWindow = useCallback((id: string) => {
    setWindows(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      const newZIndex = topZIndex + 1
      setTopZIndex(newZIndex)
      next.set(id, { 
        id, 
        state: 'open', 
        zIndex: newZIndex,
        isLoading: existing?.isLoading ?? false
      })
      return next
    })
    setActiveWindowId(id)
  }, [topZIndex])

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      if (existing) {
        next.set(id, { ...existing, state: 'minimized' })
      }
      return next
    })
    if (activeWindowId === id) {
      setActiveWindowId(null)
    }
  }, [activeWindowId])

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      const newZIndex = topZIndex + 1
      setTopZIndex(newZIndex)
      if (existing) {
        const newState = existing.state === 'maximized' ? 'open' : 'maximized'
        next.set(id, { ...existing, state: newState, zIndex: newZIndex })
      }
      return next
    })
    setActiveWindowId(id)
  }, [topZIndex])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      if (existing) {
        next.set(id, { ...existing, state: 'minimized' })
      }
      return next
    })
    if (activeWindowId === id) {
      setActiveWindowId(null)
    }
  }, [activeWindowId])

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      if (existing && existing.state !== 'minimized') {
        const newZIndex = topZIndex + 1
        setTopZIndex(newZIndex)
        next.set(id, { ...existing, zIndex: newZIndex })
      }
      return next
    })
    setActiveWindowId(id)
  }, [topZIndex])

  const getWindowState = useCallback((id: string): WindowState => {
    return windows.get(id)?.state ?? 'minimized'
  }, [windows])

  const isWindowLoading = useCallback((id: string): boolean => {
    return windows.get(id)?.isLoading ?? false
  }, [windows])

  const setWindowLoading = useCallback((id: string, loading: boolean) => {
    setWindows(prev => {
      const next = new Map(prev)
      const existing = next.get(id)
      if (existing) {
        next.set(id, { ...existing, isLoading: loading })
      }
      return next
    })
  }, [])

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        minimizeWindow,
        maximizeWindow,
        closeWindow,
        focusWindow,
        getWindowState,
        isWindowLoading,
        setWindowLoading,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  )
}
