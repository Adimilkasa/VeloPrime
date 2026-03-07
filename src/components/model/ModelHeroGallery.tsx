'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'
import type { MediaItem } from '@/lib/media/seal6dmiMedia'
import { Container } from '@/components/ui/Container'
import { ImageLightbox } from '@/components/modals/ImageLightbox'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {dir === 'left' ? (
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export function ModelHeroGallery({
  items = [],
  className,
}: {
  items?: MediaItem[]
  className?: string
}) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null)
  const slideRefs = React.useRef<Array<HTMLDivElement | null>>([])
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [lightbox, setLightbox] = React.useState<MediaItem | null>(null)

  function scrollBy(dir: 'left' | 'right') {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  React.useEffect(() => {
    const root = scrollerRef.current
    if (!root) return

    const slides = slideRefs.current.filter((x): x is HTMLDivElement => Boolean(x))
    if (!slides.length) return

    const ratios = new Map<Element, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0)
        }

        let bestEl: Element | null = null
        let best = -1
        for (const [el, ratio] of ratios.entries()) {
          if (ratio > best) {
            best = ratio
            bestEl = el
          }
        }

        if (!bestEl) return
        const idx = slides.findIndex((s) => s === bestEl)
        if (idx >= 0) setActiveIndex((prev) => (prev === idx ? prev : idx))
      },
      {
        root,
        threshold: [0.35, 0.5, 0.65, 0.8, 0.95],
      },
    )

    for (const s of slides) observer.observe(s)
    return () => observer.disconnect()
  }, [items.length])

  if (!items.length) return null

  const captions = [
    'Płynna linia nadwozia i „premium” proporcje',
    'Wnętrze z naciskiem na ergonomię i czytelność',
    'Detale, które robią różnicę w odbiorze jakości',
    'Płynna linia nadwozia i „premium” proporcje',
  ]

  const caption = captions[activeIndex] ?? captions[0]

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)} aria-label="Galeria zdjęć">
      <div
        ref={scrollerRef}
        className={cn(
          'no-scrollbar h-full w-full overflow-x-auto overflow-y-hidden',
          'scroll-smooth snap-x snap-mandatory',
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex h-full w-full">
          {items.map((item, idx) => (
            <HeroSlide
              key={item.src}
              item={item}
              onPreview={() => setLightbox(item)}
              refNode={(node) => {
                slideRefs.current[idx] = node
              }}
            />
          ))}
        </div>
      </div>

      <ImageLightbox
        open={Boolean(lightbox)}
        onOpenChange={(open) => {
          if (!open) setLightbox(null)
        }}
        src={lightbox?.src ? normalizePublicSrc(lightbox.src) : ''}
        alt={lightbox?.alt || ''}
      />

      {/* Caption (changes with visible slide) */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <Container className="pb-10">
          <div className="max-w-[70ch] -translate-y-[4vh] sm:-translate-y-[8vh]">
            <div className="text-xs font-medium uppercase tracking-wide text-white/80">Design</div>
            <div className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {caption}
            </div>
            <div className="mt-3 text-sm text-white/80">
              Dynamiczna sylwetka, dopracowane detale i wnętrze nastawione na komfort.
              Poniżej ujęcia zewnętrzne, wewnętrzne i kluczowe detale.
            </div>
          </div>
        </Container>
      </div>

      {/* Minimal arrows for desktop (optional aid for "przesuwanie na bok") */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-4 md:flex">
        <button
          type="button"
          onClick={() => scrollBy('left')}
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-stroke bg-bg-section/80 text-text-primary backdrop-blur-sm transition hover:bg-bg-section"
          aria-label="Poprzednie zdjęcie"
        >
          <ArrowIcon dir="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy('right')}
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-stroke bg-bg-section/80 text-text-primary backdrop-blur-sm transition hover:bg-bg-section"
          aria-label="Następne zdjęcie"
        >
          <ArrowIcon dir="right" />
        </button>
      </div>
    </div>
  )
}

function HeroSlide({
  item,
  onPreview,
  refNode,
}: {
  item: MediaItem
  onPreview: () => void
  refNode: (node: HTMLDivElement | null) => void
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = React.useState({ x: 50, y: 50 })

  const onMove = React.useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()

    const x = ((e.clientX - r.left) / Math.max(1, r.width)) * 100
    const y = ((e.clientY - r.top) / Math.max(1, r.height)) * 100

    // Keep pan subtle so it feels premium, not jittery
    setPos({ x: clamp(x, 25, 75), y: clamp(y, 25, 75) })
  }, [])

  return (
    <div
      ref={(node) => {
        ref.current = node
        refNode(node)
      }}
      className="relative h-full w-full shrink-0 snap-center"
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 50, y: 50 })}
      aria-label={item.alt}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${normalizePublicSrc(item.src)}")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${pos.x}% ${pos.y}%`,
        }}
      />

      <button
        type="button"
        onClick={onPreview}
        aria-label={item.alt ? `Powiększ: ${item.alt}` : 'Powiększ zdjęcie'}
        className={cn(
          'absolute inset-0 cursor-zoom-in',
          'focus:outline-none focus:ring-2 focus:ring-stroke',
          'touch-pan-x',
        )}
      />

      {/* subtle dark vignette for readability (no white brightening) */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
    </div>
  )
}

function normalizePublicSrc(src: string) {
  const raw = String(src ?? '')
  if (!raw) return ''

  try {
    // Normalize both already-encoded and raw (spaces/diacritics) paths.
    return encodeURI(decodeURI(raw))
  } catch {
    return encodeURI(raw)
  }
}
