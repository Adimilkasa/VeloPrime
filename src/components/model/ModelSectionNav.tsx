'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'
import { Container } from '@/components/ui/Container'

export type ModelNavItem = {
  id: string
  label: string
}

function prefersReducedMotion() {
  return Boolean(
    typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
}

export function ModelSectionNav({ items }: { items: ModelNavItem[] }) {
  const [activeId, setActiveId] = React.useState<string>(items[0]?.id ?? '')
  const ratiosRef = React.useRef<Map<string, number>>(new Map())

  React.useEffect(() => {
    if (!items.length) return

    const ids = items.map((x) => x.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!elements.length) return

    // Account for sticky header (h-16) + this nav bar (roughly ~56px)
    const topOffsetPx = 64 + 64

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false

        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id
          const ratio = entry.isIntersecting ? entry.intersectionRatio : 0
          ratiosRef.current.set(id, ratio)
          changed = true
        }

        if (!changed) return

        // pick the most visible section
        let bestId = ids[0] || ''
        let bestRatio = -1

        for (const [id, ratio] of ratiosRef.current.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }

        if (!bestId) return

        setActiveId((prev) => (prev === bestId ? prev : bestId))
      },
      {
        root: null,
        // When section header crosses below sticky bars, consider it active
        rootMargin: `-${topOffsetPx}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
      },
    )

    for (const el of elements) observer.observe(el)

    // If opened with hash, ensure correct active state
    const hash = decodeURIComponent(window.location.hash || '').replace('#', '')
    if (hash && ids.includes(hash)) setActiveId(hash)

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((x) => x.id).join('|')])

  function scrollToId(id: string) {
    const el = document.getElementById(id)
    if (!el) return

    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'
    el.scrollIntoView({ behavior, block: 'start' })

    // keep URL in sync without pushing history entries
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${encodeURIComponent(id)}`)
    }
  }

  if (!items.length) return null

  return (
    <div className="sticky top-16 z-40 border-b border-stroke bg-bg-section">
      <Container>
        <nav aria-label="Zakładki modelu" className="flex flex-wrap items-center gap-2 py-3">
          {items.map((item) => {
            const isActive = item.id === activeId
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveId(item.id)
                  scrollToId(item.id)
                }}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition',
                  isActive
                    ? 'border-stroke bg-bg-soft text-text-primary'
                    : 'border-transparent text-text-secondary hover:bg-bg-primary hover:text-text-primary',
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                {item.label}
              </a>
            )
          })}
        </nav>
      </Container>
    </div>
  )
}
