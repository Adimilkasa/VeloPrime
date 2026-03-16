'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

import { resolveCarImageSrc } from '@/lib/carImage'
import { formatPLN, roundUpToHundreds } from '@/lib/pricing'
import { calculateLeaseMonthly } from '@/lib/lease'
import {
  minPriceGross,
  minPriceNet,
  type ModelGroup,
} from '@/lib/modelGroups'
import { Badge } from '@/components/ui/Badge'
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

  const href = `/modele/${group.slug}`

  return (
    <Link
      href={href}
      aria-label={`Sprawdź szczegóły: ${group.brand} ${group.model}`}
      className="group relative block overflow-hidden rounded-[22px] border border-stroke bg-bg-section shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover hover:border-brand-gold/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-stroke focus-visible:ring-offset-2 focus-visible:ring-offset-bg-section"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl opacity-70" />
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-gold/30 to-transparent opacity-70" />
      </div>

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">{group.brand}</p>
            <h3 className="mt-1 truncate text-lg font-semibold text-text-primary">{group.model}</h3>
            <p className="mt-1.5 text-sm text-text-secondary">
              {group.powertrain === 'BEV' ? 'Elektryczny (BEV)' : group.powertrain === 'PHEV' ? 'Hybrydowy (PHEV)' : 'Napęd'}
              {group.years.length ? ` • ${group.years[0]}` : ''}
            </p>
          </div>

          <div className="hidden sm:block">
            <Badge variant="gold" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
              {group.powertrain === 'BEV' ? 'BEV' : group.powertrain === 'PHEV' ? 'PHEV' : 'Model'}
            </Badge>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-stroke bg-gradient-to-b from-bg-soft to-bg-primary">
          <div className="relative aspect-[16/9]">
          <Image
            src={imgSrc}
            alt={`${group.brand} ${group.model}`}
            fill
            sizes="(max-width: 768px) 100vw, 460px"
            className="object-contain p-3.5 transition-transform duration-300 group-hover:scale-[1.02]"
            priority={false}
          />
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-brand-gold/20 bg-[linear-gradient(180deg,#fffdfa,#f5ede0)] p-4 text-text-primary">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Rata orientacyjna</div>
          {monthly60 ? (
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm text-text-secondary">od</span>
              <span className="text-[26px] font-semibold tracking-tight text-text-primary">{formatPLN(monthly60)}</span>
              <span className="text-sm font-medium text-text-secondary">/ mies.</span>
              <span className="text-xs text-text-secondary">(60 mies.)</span>
            </div>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Estymacja finansowania. Pełne parametry znajdziesz po wejściu w model.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="sm:hidden">
            <Badge variant="gold" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
              {group.powertrain === 'BEV' ? 'BEV' : group.powertrain === 'PHEV' ? 'PHEV' : 'Model'}
            </Badge>
          </div>

          <span className="ml-auto inline-flex h-10 items-center justify-center rounded-md border border-[#b6841c] bg-[linear-gradient(135deg,#ebc971,#b6841c)] px-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(182,132,28,0.24)] transition group-hover:shadow-[0_18px_34px_rgba(182,132,28,0.32)]">
            Sprawdź szczegóły
          </span>
        </div>
      </div>
    </Link>
  )
}
