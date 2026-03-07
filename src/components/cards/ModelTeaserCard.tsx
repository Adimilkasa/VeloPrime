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
      className="group relative overflow-hidden h-full w-[288px] sm:w-[312px] lg:w-[336px] rounded-2xl transition-all duration-300 hover:border-brand-gold/45"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl opacity-70" />
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent opacity-70" />
      </div>

      <div className="p-6 sm:p-7">
        <Text variant="muted" className="text-xs font-medium uppercase tracking-widest">
          {group.brand}
        </Text>
        <Heading level={3} className="mt-1 text-2xl leading-tight">
          {group.model}
        </Heading>

        <div className="mt-5 overflow-hidden rounded-2xl border border-stroke bg-gradient-to-b from-bg-soft to-bg-primary">
          <div className="relative aspect-[16/9]">
            <Image
              src={imgSrc}
              alt={label}
              fill
              className="object-contain p-5 drop-shadow-[0_14px_26px_rgba(0,0,0,0.08)] transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 70vw, 336px"
              onError={() => setImgSrc('/cars/placeholder.svg')}
            />
          </div>
        </div>

        {listPrice && price && listPrice > price ? (
          <Text variant="muted" className="mt-5 line-through">
            {formatPLN(listPrice)}
          </Text>
        ) : (
          <div className="mt-5" />
        )}

        <div className="mt-3 rounded-2xl border border-brand-gold/20 bg-bg-primary p-4 transition-colors duration-300 group-hover:border-brand-gold/35">
          <Text variant="secondary" className="leading-snug">
            Już od{' '}
            <span className="font-semibold text-text-primary">{price ? formatPLN(price) : '—'}</span>
            <span className="text-text-muted"> {mode === 'business' ? 'netto' : 'brutto'}</span>
          </Text>

          {monthly60 ? (
            <Text variant="muted" className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm text-text-muted">od</span>
              <span className="text-3xl font-semibold tracking-tight text-text-primary">{formatPLN(monthly60)}</span>
              <span className="text-sm font-medium text-text-muted">/ mies.</span>
              <span className="text-xs text-text-muted">(60 mies.)</span>
            </Text>
          ) : null}
        </div>

        <div className="mt-6">
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
