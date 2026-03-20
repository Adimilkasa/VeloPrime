'use client'

import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export type LightboxImageItem = {
  src: string
  alt: string
}

export type ImageLightboxProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt: string
  images?: LightboxImageItem[]
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      width="20"
      height="20"
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

export function ImageLightbox({
  open,
  onOpenChange,
  src,
  alt,
  images,
  currentIndex = 0,
  onIndexChange,
}: ImageLightboxProps) {
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange])
  const items = images?.length ? images : [{ src, alt }]
  const safeIndex = Math.max(0, Math.min(currentIndex, items.length - 1))
  const activeItem = items[safeIndex] ?? { src, alt }
  const canNavigate = items.length > 1 && typeof onIndexChange === 'function'

  const move = React.useCallback(
    (direction: 'prev' | 'next') => {
      if (!canNavigate || !onIndexChange) return

      const nextIndex =
        direction === 'prev'
          ? (safeIndex - 1 + items.length) % items.length
          : (safeIndex + 1) % items.length

      onIndexChange(nextIndex)
    },
    [canNavigate, items.length, onIndexChange, safeIndex],
  )

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') move('prev')
      if (e.key === 'ArrowRight') move('next')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close, move])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Zamknij podgląd"
            className="absolute inset-0 bg-black/50"
            onClick={close}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-[1100px]"
              role="dialog"
              aria-modal="true"
            >
              <Card className="relative overflow-hidden rounded-2xl bg-bg-section p-0">
                {canNavigate ? (
                  <>
                    <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                      <Button variant="ghost" size="sm" onClick={() => move('prev')} aria-label="Poprzednie zdjęcie">
                        <ArrowIcon dir="left" />
                      </Button>
                    </div>
                    <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
                      <Button variant="ghost" size="sm" onClick={() => move('next')} aria-label="Następne zdjęcie">
                        <ArrowIcon dir="right" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                      {safeIndex + 1} / {items.length}
                    </div>
                  </>
                ) : null}

                <div className="absolute right-3 top-3 z-10">
                  <Button variant="ghost" size="sm" onClick={close}>
                    Zamknij
                  </Button>
                </div>

                <div className="relative h-[78vh] min-h-[420px] w-full bg-black/10">
                  <Image
                    src={activeItem.src}
                    alt={activeItem.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1100px"
                    className="object-contain"
                    priority={false}
                  />
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
