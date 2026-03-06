'use client'

import * as React from 'react'
import Image from 'next/image'

import { cn } from '@/lib/cn'
import { ImageLightbox } from '@/components/modals/ImageLightbox'

export type EnlargeableImageProps = {
  src: string
  alt: string
  sizes: string
  className?: string
  imageClassName?: string
  priority?: boolean
  buttonClassName?: string
}

export function EnlargeableImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  priority = false,
  buttonClassName,
}: EnlargeableImageProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <div className={cn('relative', className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={cn('object-cover', imageClassName)}
          priority={priority}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={alt ? `Powiększ: ${alt}` : 'Powiększ zdjęcie'}
          className={cn(
            'absolute inset-0 cursor-zoom-in',
            'focus:outline-none focus:ring-2 focus:ring-stroke',
            // allow horizontal scrolling gestures where relevant
            'touch-pan-x',
            buttonClassName,
          )}
        />
      </div>

      <ImageLightbox open={open} onOpenChange={setOpen} src={src} alt={alt} />
    </>
  )
}
