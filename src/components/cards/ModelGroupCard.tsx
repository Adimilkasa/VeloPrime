'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

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
    <div className="group relative overflow-hidden rounded-2xl border border-stroke bg-bg-section transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-text-secondary">{group.brand}</p>
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
            <p className="mt-1 text-lg font-semibold text-text-primary">
              {price ? formatPLN(price) : '—'}
            </p>
            <p className="mt-1 text-xs text-text-secondary">{mode === 'business' ? 'netto' : 'brutto'}</p>
            {monthly60 ? (
              <p className="mt-1 text-xs text-text-secondary">
                od {formatPLN(monthly60)} / mies. (60 mies.)
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 relative aspect-[16/9] overflow-hidden rounded-xl bg-bg-soft">
          <Image
            src={imgSrc}
            alt={`${group.brand} ${group.model}`}
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            priority={false}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="sm:hidden">
            <p className="text-xs text-text-secondary">Już od</p>
            {listPrice && price && listPrice > price ? (
              <p className="mt-1 text-sm text-text-secondary line-through">{formatPLN(listPrice)}</p>
            ) : null}
            <p className="mt-1 text-base font-semibold text-text-primary">{price ? formatPLN(price) : '—'}</p>
            <p className="mt-1 text-xs text-text-secondary">{mode === 'business' ? 'netto' : 'brutto'}</p>
            {monthly60 ? (
              <p className="mt-1 text-xs text-text-secondary">
                od {formatPLN(monthly60)} / mies. (60 mies.)
              </p>
            ) : null}
          </div>

          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link href={href}>Sprawdź szczegóły</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
