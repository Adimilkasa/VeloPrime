'use client'

import * as React from 'react'
import Image from 'next/image'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

import { computeOffer, formatPLN } from '@/lib/pricing'
import { calculateLeaseMonthly } from '@/lib/lease'
import { FinanceModal } from '@/components/modals/FinanceModal'
import { resolveCarImageSrcForItem } from '@/lib/carImage'
import { usePricingMode } from '@/components/providers/PricingModeProvider'
import type { InventoryItem } from '@/types/inventory'

export type { InventoryItem } from '@/types/inventory'

export function ModelCard({ item }: { item: InventoryItem }) {
  const { mode } = usePricingMode()

  const listPrice = mode === 'business' ? (item.listPriceNet ?? item.listPriceGross) : item.listPriceGross
  const ourPrice = mode === 'business' ? (item.ourPriceNet ?? item.ourPriceGross) : item.ourPriceGross

  const offer = computeOffer(listPrice, ourPrice)
  const monthly60 = calculateLeaseMonthly({ clientPriceGross: offer.clientPrice, months: 60 })

  const [open, setOpen] = React.useState(false)
  const [imgSrc, setImgSrc] = React.useState('/cars/placeholder.svg')

  const vehicleLabel = `${item.brand} ${item.model} — ${item.trim}`

  React.useEffect(() => {
    let alive = true

    resolveCarImageSrcForItem(item).then((src) => {
      if (!alive) return
      setImgSrc(src)
    })

    return () => {
      alive = false
    }
  }, [item.imageKey, item.brand, item.model, item.trim])

  return (
    <>
      <Card
        variant="hoverable"
        goldTopLineOnHover
        className="group h-full w-[320px] sm:w-[360px] lg:w-[380px]"
      >
        <div className="p-6">
          <Text variant="muted" className="uppercase tracking-wide">
            {item.brand}
          </Text>
          <Heading level={3} className="mt-1">
            {item.model}{' '}
            <span className="text-text-muted font-medium">{item.trim}</span>
          </Heading>

          <div className="mt-4 overflow-hidden rounded-xl border border-stroke bg-gradient-to-b from-bg-soft to-bg-primary">
            <div className="relative aspect-[16/9]">
              <Image
                src={imgSrc}
                alt={vehicleLabel}
                fill
                className="object-contain p-4 drop-shadow-[0_14px_26px_rgba(0,0,0,0.08)]"
                sizes="(max-width: 768px) 90vw, 380px"
                onError={() => setImgSrc('/cars/placeholder.svg')}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="gold" className="text-sm px-4 py-1.5 rounded-full">
              RABAT {formatPLN(offer.clientDiscount)}
            </Badge>
          </div>

          <div className="mt-4">
            <Text variant="muted" className="line-through">
              {formatPLN(listPrice)}
            </Text>
            <div className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
              {formatPLN(offer.clientPrice)}
            </div>
            <Text variant="muted" className="mt-1">
              {mode === 'business' ? 'netto' : 'brutto'}
            </Text>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm text-text-muted">od</span>
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary tabular-nums whitespace-nowrap">{formatPLN(monthly60)}</span>
              <span className="text-sm font-medium text-text-muted whitespace-nowrap">/ mies.</span>
              <span className="text-xs text-text-muted">(60 mies.)</span>
            </div>
            <Text variant="muted" className="mt-2">
              Rata jest estymacją – finalna zależy od banku i parametrów umowy.
            </Text>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="gold">Selekcja z rabatem</Badge>
            <Badge variant="neutral">Gwarancja do 7 lat</Badge>
          </div>

          <div className="mt-6">
            <Button variant="primary" size="md" onClick={() => setOpen(true)} className="w-full">
              Sprawdź finansowanie
            </Button>
          </div>
        </div>
      </Card>

      <FinanceModal
        open={open}
        onOpenChange={setOpen}
        vehicleLabel={vehicleLabel}
        clientPriceGross={offer.clientPrice}
        defaultMonths={60}
      />
    </>
  )
}
