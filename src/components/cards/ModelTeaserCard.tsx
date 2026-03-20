'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'

import { resolveCarImageSrc } from '@/lib/carImage'
import { formatPLN, roundUpToHundreds } from '@/lib/pricing'
import { calculateLeaseMonthly } from '@/lib/lease'
import {
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

  const monthlyBase = React.useMemo(() => {
    const gross = minPriceGross(group)
    const net = minPriceNet(group)
    const value = mode === 'business' ? net ?? gross : gross ?? net
    return typeof value === 'number' ? roundUpToHundreds(value) : null
  }, [group, mode])

  const monthly60 = React.useMemo(() => {
    if (typeof monthlyBase !== 'number' || !Number.isFinite(monthlyBase) || monthlyBase <= 0) return null
    return calculateLeaseMonthly({ clientPriceGross: monthlyBase, months: 60 })
  }, [monthlyBase])

  const label = `${group.brand} ${group.model}`
  const href = `/modele/${group.slug}`

  return (
    <Link
      href={href}
      aria-label={`Sprawdź szczegóły: ${label}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-section"
    >
      <Card
        variant="hoverable"
        goldTopLineOnHover
        className="relative overflow-hidden h-full w-[82vw] max-w-[268px] sm:w-[292px] sm:max-w-none lg:w-[312px] rounded-[24px] border-brand-gold/15 bg-[linear-gradient(180deg,#fffefb,#f6eee0)] transition-all duration-300 hover:border-brand-gold/45"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gold/14 blur-3xl opacity-70" />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/65 to-transparent" />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Text variant="muted" className="text-xs font-medium uppercase tracking-widest">
                {group.brand}
              </Text>
              <Heading level={3} className="mt-1 text-2xl leading-tight">
                {group.model}
              </Heading>
            </div>
            <Badge variant="gold" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
              {group.powertrain === 'BEV' ? 'BEV' : group.powertrain === 'PHEV' ? 'PHEV' : 'Model'}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-[#8b6a21]">
            {group.years[0] ? <span className="rounded-full border border-brand-gold/20 bg-white/70 px-3 py-1">Rocznik {group.years[0]}</span> : null}
            <span className="rounded-full border border-brand-gold/20 bg-white/70 px-3 py-1">Dostępny od ręki</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-stroke bg-gradient-to-b from-bg-soft to-bg-primary">
            <div className="relative aspect-[16/9]">
              <Image
                src={imgSrc}
                alt={label}
                fill
                className="object-contain p-4 drop-shadow-[0_14px_26px_rgba(0,0,0,0.08)] transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 70vw, 312px"
                onError={() => setImgSrc('/cars/placeholder.svg')}
              />
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-brand-gold/20 bg-[linear-gradient(180deg,#fffdfa,#f5ede0)] p-4 text-text-primary transition-colors duration-300 group-hover:border-brand-gold/40">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Rata orientacyjna</div>
            {monthly60 ? (
              <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-sm text-text-secondary">od</span>
                <span className="text-[28px] font-semibold tracking-tight text-text-primary tabular-nums whitespace-nowrap">{formatPLN(monthly60)}</span>
                <span className="text-sm font-medium text-text-secondary whitespace-nowrap">/ mies.</span>
              </div>
            ) : null}
            <Text className="mt-3 text-sm leading-relaxed text-text-secondary">
              Estymacja dla 60 miesięcy finansowania. Szczegóły sprawdzisz na karcie modelu.
            </Text>
          </div>

          <div className="mt-5">
            <span className="inline-flex w-full items-center justify-center rounded-md border border-[#b6841c] bg-[linear-gradient(135deg,#ebc971,#b6841c)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(182,132,28,0.24)] transition group-hover:shadow-[0_18px_34px_rgba(182,132,28,0.32)]">
              Sprawdź szczegóły
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
