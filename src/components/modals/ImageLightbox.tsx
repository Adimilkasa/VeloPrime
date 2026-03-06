'use client'

import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export type ImageLightboxProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt: string
}

export function ImageLightbox({ open, onOpenChange, src, alt }: ImageLightboxProps) {
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange])

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

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
                <div className="absolute right-3 top-3 z-10">
                  <Button variant="ghost" size="sm" onClick={close}>
                    Zamknij
                  </Button>
                </div>

                <div className="relative h-[78vh] min-h-[420px] w-full bg-black/10">
                  <Image
                    src={src}
                    alt={alt}
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
