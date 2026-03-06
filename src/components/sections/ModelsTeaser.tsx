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

  const availableCount = React.useMemo(() => {
    const all = inventory as InventoryItem[]
    const available = getAvailableItems(all)
    return groupInventoryByModel(available).length
  }, [])

  const scrollerRef = React.useRef<HTMLDivElement | null>(null)

  function scrollByCards(dir: 'left' | 'right') {
    const el = scrollerRef.current
    if (!el) return

    const amount = Math.min(el.clientWidth * 0.9, 520)
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <Section variant="white" className="relative" aria-label="Modele – teaser">
      <div className="flex items-end justify-between gap-6">
        <div className="max-w-[70ch]">
          <Heading level={2}>Modele</Heading>
          <Text className="mt-3">Wybrane auta dostępne od ręki — zobacz kilka propozycji.</Text>
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
            'no-scrollbar flex gap-4 overflow-x-auto pb-2',
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
