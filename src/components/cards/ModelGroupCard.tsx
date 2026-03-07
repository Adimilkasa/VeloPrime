'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

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

export function ModelGroupCard({ group }: { group: ModelGroup }) {
  const { mode } = usePricingMode()
  const [imgSrc, setImgSrc] = React.useState<string>('/cars/placeholder.svg')

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const src = await resolveCarImageSrc(group.imageKey || group.model)
      if (!cancelled) setImgSrc(src)
    })()
    return () => {
      cancelled = true
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

  const href = `/modele/${group.slug}`

  return (
    <Link
      href={href}
      aria-label={`Sprawdź szczegóły: ${group.brand} ${group.model}`}
      className="group relative block overflow-hidden rounded-2xl border border-stroke bg-bg-section shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover hover:border-brand-gold/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-stroke focus-visible:ring-offset-2 focus-visible:ring-offset-bg-section"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl opacity-70" />
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent opacity-70" />
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">{group.brand}</p>
            <h3 className="mt-1 truncate text-xl font-semibold text-text-primary">{group.model}</h3>
            <p className="mt-2 text-sm text-text-secondary">
              {group.powertrain === 'BEV' ? 'Elektryczny (BEV)' : group.powertrain === 'PHEV' ? 'Hybrydowy (PHEV)' : 'Napęd'}
              {group.years.length ? ` • ${group.years[0]}` : ''}
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs text-text-secondary">Już od</p>
            {listPrice && price && listPrice > price ? (
              <p className="mt-1 text-sm text-text-secondary line-through">{formatPLN(listPrice)}</p>
            ) : null}
            <p className="mt-1 text-base font-semibold text-text-primary">
              {price ? formatPLN(price) : '—'}
            </p>
            <p className="mt-1 text-xs text-text-secondary">{mode === 'business' ? 'netto' : 'brutto'}</p>
            {monthly60 ? (
              <div className="mt-2">
                <p className="text-lg font-semibold tracking-tight text-text-primary">
                  od {formatPLN(monthly60)} <span className="text-sm font-medium text-text-secondary">/ mies.</span>
                </p>
                <p className="mt-1 text-xs text-text-secondary">(60 mies.)</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-stroke bg-gradient-to-b from-bg-soft to-bg-primary">
          <div className="relative aspect-[16/9]">
          <Image
            src={imgSrc}
            alt={`${group.brand} ${group.model}`}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
            priority={false}
          />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="sm:hidden">
            <p className="text-xs text-text-secondary">Już od</p>
            {listPrice && price && listPrice > price ? (
              <p className="mt-1 text-sm text-text-secondary line-through">{formatPLN(listPrice)}</p>
            ) : null}
            <p className="mt-1 text-sm font-semibold text-text-primary">{price ? formatPLN(price) : '—'}</p>
            <p className="mt-1 text-xs text-text-secondary">{mode === 'business' ? 'netto' : 'brutto'}</p>
            {monthly60 ? (
              <div className="mt-2">
                <p className="text-xl font-semibold tracking-tight text-text-primary">
                  od {formatPLN(monthly60)} <span className="text-sm font-medium text-text-secondary">/ mies.</span>
                </p>
                <p className="mt-1 text-xs text-text-secondary">(60 mies.)</p>
              </div>
            ) : null}
          </div>

          <span className="ml-auto inline-flex h-9 items-center justify-center rounded-md border border-stroke bg-transparent px-4 text-sm font-medium text-text-primary transition group-hover:bg-bg-primary">
            Sprawdź szczegóły
          </span>
        </div>
      </div>
    </Link>
  )
}
