'use client'

import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { Text } from '@/components/ui/Text'
import { ANALYTICS_CONSENT_OPEN_EVENT } from '@/lib/analyticsConsent'

export function Footer() {
  return (
    <footer className="border-t border-stroke bg-bg-section">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text variant="secondary" className="text-text-primary">
            Velo Prime
          </Text>
          <Text variant="muted" className="mt-1 max-w-[52ch]">
            Selekcja nowych aut, uporządkowany proces i spokojny standard komunikacji.
          </Text>
        </div>

        <nav aria-label="Linki stopki" className="flex items-center gap-4">
          <Link
            href="/polityka-prywatnosci"
            className="text-sm text-text-secondary transition hover:text-text-primary"
          >
            Polityka prywatności
          </Link>
          <button
            type="button"
            className="text-sm text-text-secondary transition hover:text-text-primary"
            onClick={() => window.dispatchEvent(new Event(ANALYTICS_CONSENT_OPEN_EVENT))}
          >
            Ustawienia cookies
          </button>
        </nav>
      </Container>
    </footer>
  )
}