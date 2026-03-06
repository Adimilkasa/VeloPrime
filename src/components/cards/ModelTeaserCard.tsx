'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

import { resolveCarImageSrc } from '@/lib/carImage'
import { formatPLN, roundUpToHundreds } from '@/lib/pricing'
import { calculateLeaseMonthly } from '@/lib/lease'
import {
  minListPriceGross,
  minListPriceNet,
  minPriceGross,
  minPriceNet,
  type ModelGroup,
} from '@/lib/modelGroups'
import { usePricingMode } from '@/components/providers/PricingModeProvider'

export function ModelTeaserCard({ group }: { group: ModelGroup }) {
  const { mode } = usePricingMode()

  const [imgSrc, setImgSrc] = React.useState('/cars/placeholder.svg')

  React.useEffect(() => {
    let alive = true

    resolveCarImageSrc(group.imageKey || group.model).then((src) => {
      if (!alive) return
      setImgSrc(src)
    })

    return () => {
      alive = false
    }
  }, [group.imageKey, group.model])

  const price = React.useMemo(() => {
    const net = minPriceNet(group)
    const gross = minPriceGross(group)
    const value = mode === 'business' ? net ?? gross : gross ?? net
    return typeof value === 'number' ? roundUpToHundreds(value) : null
  }, [group, mode])

  const monthly60 = React.useMemo(() => {
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null
    return calculateLeaseMonthly({ clientPriceGross: price, months: 60 })
  }, [price])

  const listPrice = React.useMemo(() => {
    const net = minListPriceNet(group)
    const gross = minListPriceGross(group)
    const value = mode === 'business' ? net ?? gross : gross ?? net
    return typeof value === 'number' ? Math.round(value) : null
  }, [group, mode])

  const label = `${group.brand} ${group.model}`
  const href = `/modele/${group.slug}`

  return (
    <Card
      variant="hoverable"
      goldTopLineOnHover
      className="group h-full w-[240px] sm:w-[260px] lg:w-[280px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="p-5 sm:p-6">
        <Text variant="muted" className="uppercase tracking-wide">
          {group.brand}
        </Text>
        <Heading level={3} className="mt-1">
          {group.model}
        </Heading>

        <div className="mt-4 overflow-hidden rounded-xl border border-stroke bg-gradient-to-b from-bg-soft to-bg-primary">
          <div className="relative aspect-[16/9]">
            <Image
              src={imgSrc}
              alt={label}
              fill
              className="object-contain p-4 drop-shadow-[0_14px_26px_rgba(0,0,0,0.08)]"
              sizes="(max-width: 768px) 70vw, 280px"
              onError={() => setImgSrc('/cars/placeholder.svg')}
            />
          </div>
        </div>

        {listPrice && price && listPrice > price ? (
          <Text variant="muted" className="mt-4 line-through">
            {formatPLN(listPrice)}
          </Text>
        ) : (
          <div className="mt-4" />
        )}

        <Text variant="secondary" className="mt-2">
          Już od <span className="font-semibold text-text-primary">{price ? formatPLN(price) : '—'}</span>
          <span className="text-text-muted"> {mode === 'business' ? 'netto' : 'brutto'}</span>
        </Text>

        {monthly60 ? (
          <Text variant="muted" className="mt-2">
            od <span className="font-semibold text-text-primary">{formatPLN(monthly60)}</span>
            <span className="text-text-muted"> / mies.</span>{' '}
            <span className="text-text-muted">(60 mies.)</span>
          </Text>
        ) : null}

        <div className="mt-5">
          <Button
            asChild
            variant="secondary"
            size="md"
            className="w-full border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white hover:shadow-cta"
          >
            <Link href={href}>Sprawdź szczegóły</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
