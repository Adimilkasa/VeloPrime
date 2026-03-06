'use client'

import * as React from 'react'

import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

import inventory from '@/data/inventory.json'
import { ModelCard } from '@/components/cards/ModelCard'
import type { InventoryItem } from '@/types/inventory'

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-80"
    >
      <path
        d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ModelsCarousel() {
  const items = React.useMemo(() => {
    return (inventory as InventoryItem[]).filter(
      (x) => x.availability === 'IN_STOCK' && x.brand.toUpperCase() === 'BYD',
    )
  }, [])

  const scrollerRef = React.useRef<HTMLDivElement | null>(null)

  function scrollByCards(dir: 'left' | 'right') {
    const el = scrollerRef.current
    if (!el) return

    // one card + gap (approx) so it feels like a carousel
    const amount = Math.min(el.clientWidth * 0.85, 420)
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <Section
      id="modele"
      variant="white"
      className="relative"
    >
      <div className="flex items-end justify-between gap-6">
        <div className="max-w-[68ch]">
          <Heading level={2}>Modele</Heading>
          <Text className="mt-3">
            Wyłącznie nowe auta, starannie dobrane konfiguracje i transparentne finansowanie.
          </Text>
          <Text variant="muted" className="mt-2">
            Pokazujemy cenę katalogową, realny rabat i estymowaną ratę — bez presji i bez chaosu.
          </Text>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full border border-stroke"
            onClick={() => scrollByCards('left')}
            aria-label="Poprzednie"
          >
            <ArrowIcon direction="left" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full border border-stroke"
            onClick={() => scrollByCards('right')}
            aria-label="Następne"
          >
            <ArrowIcon direction="right" />
          </Button>
        </div>
      </div>

      <div className="mt-10 relative">
        <div
          ref={scrollerRef}
          className={cn(
            'no-scrollbar flex gap-6 overflow-x-auto pb-2',
            'scroll-smooth snap-x snap-mandatory',
            'cursor-grab active:cursor-grabbing',
          )}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((item) => (
            <div key={`${item.brand}-${item.model}-${item.trim}`} className="snap-start">
              <ModelCard item={item} />
            </div>
          ))}

          {/* spacer to make 3.2 cards visible feel on wide screens */}
          <div className="w-[20px] shrink-0" />
        </div>

        {/* subtle edge fades */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-bg-section to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg-section to-transparent" />
      </div>
    </Section>
  )
}
