'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  ANALYTICS_CONSENT_OPEN_EVENT,
  type AnalyticsConsentValue,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from '@/lib/analyticsConsent'

export function CookieConsentBanner() {
  const [consent, setConsent] = React.useState<AnalyticsConsentValue | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    const nextConsent = readAnalyticsConsent()
    setConsent(nextConsent)
    setIsOpen(nextConsent === null)

    function handleConsentChange() {
      const value = readAnalyticsConsent()
      setConsent(value)
      setIsOpen(value === null)
    }

    function handleOpenRequest() {
      setConsent(readAnalyticsConsent())
      setIsOpen(true)
    }

    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsentChange)
    window.addEventListener(ANALYTICS_CONSENT_OPEN_EVENT, handleOpenRequest)

    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsentChange)
      window.removeEventListener(ANALYTICS_CONSENT_OPEN_EVENT, handleOpenRequest)
    }
  }, [])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] md:inset-x-auto md:bottom-6 md:left-6 md:w-[680px] md:max-w-[calc(100vw-3rem)]">
      <div className="relative overflow-hidden rounded-[24px] border border-white/18 bg-[linear-gradient(180deg,rgba(17,17,17,0.72),rgba(28,22,17,0.64))] p-4 text-white shadow-[0_24px_60px_rgba(15,23,42,0.28)] backdrop-blur-2xl md:p-4">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-gold/18 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%,rgba(201,161,59,0.08))]" />
        </div>

        <div className="relative md:flex md:items-end md:justify-between md:gap-5">
          <div className="min-w-0 md:max-w-[360px]">
            <div className="flex items-center justify-between gap-3 md:justify-start">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e6c977]">Cookies</div>
              {consent !== null ? (
                <div className="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/72">
                  {consent === 'accepted' ? 'Analityka aktywna' : 'Tylko niezbędne'}
                </div>
              ) : null}
            </div>

            <div className="mt-1.5 text-base font-semibold tracking-tight text-white md:text-[17px]">Ustawienia prywatności</div>
            <Text className="mt-1.5 text-sm leading-relaxed text-white/78">
              Używamy cookies analitycznych do pomiaru ruchu i poprawy działania strony.
            </Text>

            <a
              href="/polityka-prywatnosci"
              className="mt-2 inline-flex text-sm text-white underline decoration-brand-gold/60 underline-offset-4 transition hover:text-[#f2dfaa]"
            >
              Polityka prywatności
            </a>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row md:mt-0 md:w-auto md:shrink-0 md:flex-col">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="min-w-[220px]"
              onClick={() => {
                writeAnalyticsConsent('rejected')
                setConsent('rejected')
                setIsOpen(false)
              }}
            >
              Tylko niezbędne
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="min-w-[220px]"
              onClick={() => {
                writeAnalyticsConsent('accepted')
                setConsent('accepted')
                setIsOpen(false)
              }}
            >
              Akceptuję analitykę
            </Button>
            {consent !== null ? (
              <Button
                type="button"
                variant="ghost"
                size="md"
                className="border border-white/12 bg-white/6 text-white hover:bg-white/10 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                Zamknij
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}