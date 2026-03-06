 'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'
import { Menu, X } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { usePricingMode } from '@/components/providers/PricingModeProvider'

export function Header() {
  const { mode, setMode } = usePricingMode()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const logoSrc = '/assets/LOGO1.png?v=20260306'

  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-bg-section">
      <Container as="div" className="flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="relative h-16 w-[300px] sm:w-[420px] lg:w-[560px] xl:w-[700px] overflow-hidden">
            <Image
              src={logoSrc}
              alt="Velo Prime"
              fill
              className="pointer-events-none object-contain object-left origin-left scale-[1.7] sm:scale-[1.9] lg:scale-[2.1]"
              priority
              sizes="(max-width: 640px) 300px, (max-width: 1024px) 420px, (max-width: 1280px) 560px, 700px"
            />
          </span>
          <span className="sr-only">Velo Prime</span>
        </Link>

        <nav className="relative z-10 hidden items-center gap-12 lg:flex">
          <Link
            href="/modele"
            className="whitespace-nowrap text-sm text-text-secondary hover:text-text-primary transition"
          >
            Modele
          </Link>
          <a
            href="/#finansowanie"
            className="whitespace-nowrap text-sm text-text-secondary hover:text-text-primary transition"
          >
            Finansowanie
          </a>
          <a href="/#o-nas" className="whitespace-nowrap text-sm text-text-secondary hover:text-text-primary transition">
            O nas
          </a>
          <a
            href="/#kontakt"
            className="whitespace-nowrap text-sm text-text-secondary hover:text-text-primary transition"
          >
            Kontakt
          </a>
        </nav>

        <div className="relative z-10 ml-auto flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <div className="hidden items-center rounded-full border border-stroke bg-bg-soft p-1 text-xs lg:flex">
            <button
              type="button"
              onClick={() => setMode('private')}
              className={
                'rounded-full border border-transparent px-3 py-1 transition ' +
                (mode === 'private'
                  ? 'border-brand-gold bg-brand-gold text-white font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-section')
              }
              aria-pressed={mode === 'private'}
            >
              Prywatnie
            </button>
            <button
              type="button"
              onClick={() => setMode('business')}
              className={
                'rounded-full border border-transparent px-3 py-1 transition ' +
                (mode === 'business'
                  ? 'border-brand-gold bg-brand-gold text-white font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-section')
              }
              aria-pressed={mode === 'business'}
            >
              Firma
            </button>
          </div>
          <Button asChild variant="primary" size="md">
            <a href="/#kontakt">Umów konsultację</a>
          </Button>
        </div>
      </Container>

      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-stroke bg-bg-section lg:hidden">
          <Container as="div" className="py-3">
            <div className="mb-3 flex items-center rounded-full border border-stroke bg-bg-soft p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode('private')}
                className={
                  'flex-1 rounded-full border border-transparent px-3 py-2 transition ' +
                  (mode === 'private'
                    ? 'border-brand-gold bg-brand-gold text-white font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-section')
                }
                aria-pressed={mode === 'private'}
              >
                Prywatnie
              </button>
              <button
                type="button"
                onClick={() => setMode('business')}
                className={
                  'flex-1 rounded-full border border-transparent px-3 py-2 transition ' +
                  (mode === 'business'
                    ? 'border-brand-gold bg-brand-gold text-white font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-section')
                }
                aria-pressed={mode === 'business'}
              >
                Firma
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <Link
                href="/modele"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary transition"
              >
                Modele
              </Link>
              <a
                href="/#finansowanie"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary transition"
              >
                Finansowanie
              </a>
              <a
                href="/#o-nas"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary transition"
              >
                O nas
              </a>
              <a
                href="/#kontakt"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-bg-primary hover:text-text-primary transition"
              >
                Kontakt
              </a>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  )
}
