'use client'

import * as React from 'react'

export type PricingMode = 'business' | 'private'

type PricingModeContextValue = {
  mode: PricingMode
  setMode: (mode: PricingMode) => void
}

const PricingModeContext = React.createContext<PricingModeContextValue | null>(null)

const STORAGE_KEY = 'veloprime.pricingMode'
const LEGACY_STORAGE_KEY = ['ve', 'lora', '.pricingMode'].join('')

export function PricingModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<PricingMode>('private')

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY)
      if (raw === 'business' || raw === 'private') setModeState(raw)
    } catch {
      // ignore
    }
  }, [])

  const setMode = React.useCallback((next: PricingMode) => {
    setModeState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const value = React.useMemo(() => ({ mode, setMode }), [mode, setMode])

  return <PricingModeContext.Provider value={value}>{children}</PricingModeContext.Provider>
}

export function usePricingMode() {
  const ctx = React.useContext(PricingModeContext)
  if (!ctx) throw new Error('usePricingMode must be used within PricingModeProvider')
  return ctx
}
