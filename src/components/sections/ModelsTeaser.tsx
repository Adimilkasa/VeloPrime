'use client'

import * as React from 'react'

import inventory from '@/data/inventory.json'
import type { InventoryItem } from '@/types/inventory'
import { getAvailableItems } from '@/lib/inventory'
import { groupInventoryByModel } from '@/lib/modelGroups'

import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

import { ModelTeaserCard } from '@/components/cards/ModelTeaserCard'

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

export function ModelsTeaser() {
  const items = React.useMemo(() => {
    const all = inventory as InventoryItem[]
    const available = getAvailableItems(all)
    const groups = groupInventoryByModel(available)
    return groups.slice(0, 10)
  }, [])

  const scrollerRef = React.useRef<HTMLDivElement | null>(null)

  function scrollByCards(dir: 'left' | 'right') {
    const el = scrollerRef.current
    if (!el) return

    const amount = Math.min(el.clientWidth * 0.9, 520)
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <Section variant="white" className="relative overflow-hidden" aria-label="Modele – teaser">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(201,161,59,0.12),transparent_62%)]" />
        <div className="absolute right-[-10%] top-16 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[72ch]">
          <div className="inline-flex rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">
            Wybrane modele
          </div>
          <Heading level={2} className="mt-4 max-w-[16ch] text-balance">Wybrane modele dostępne od ręki</Heading>
          <Text className="mt-3 max-w-[64ch]">
            Poznaj samochody, które łączą nowoczesny design, komfort codziennej jazdy i atrakcyjne warunki finansowania. Sprawdź estymowaną ratę i przejdź do szczegółów wybranego modelu.
          </Text>
        </div>

        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full border border-brand-gold/25 bg-white/70 p-0"
              onClick={() => scrollByCards('left')}
              aria-label="Poprzednie"
            >
              <ArrowIcon direction="left" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 rounded-full border border-brand-gold/25 bg-white/70 p-0"
              onClick={() => scrollByCards('right')}
              aria-label="Następne"
            >
              <ArrowIcon direction="right" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative mt-10">
        <div
          ref={scrollerRef}
          className={cn(
            'no-scrollbar flex gap-6 overflow-x-auto pb-4 pt-1',
            'scroll-smooth snap-x snap-mandatory',
            'cursor-grab active:cursor-grabbing',
          )}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((group) => (
            <div key={group.key} className="snap-start">
              <ModelTeaserCard group={group} />
            </div>
          ))}

          <div className="w-[20px] shrink-0" />
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-bg-section to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg-section to-transparent" />
      </div>

      <div className="mt-8 flex items-center justify-end">
        <Button
          href="/modele"
          variant="secondary"
          size="md"
          className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white hover:shadow-cta"
        >
          Zobacz wszystkie dostępne modele
        </Button>
      </div>
    </Section>
  )
}
