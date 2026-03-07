'use client'

import * as React from 'react'

import { Text } from '@/components/ui/Text'
import { usePricingMode } from '@/components/providers/PricingModeProvider'
import { calculateLeaseMonthly } from '@/lib/lease'
import { formatPLN } from '@/lib/pricing'

export type VersionPricingProps = {
  ourPriceGross?: number | null
  ourPriceNet?: number | null
  months?: 36 | 48 | 60
}

function isValidMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function VersionPricing({ ourPriceGross, ourPriceNet, months = 60 }: VersionPricingProps) {
  const { mode } = usePricingMode()

  const gross = isValidMoney(ourPriceGross) ? ourPriceGross : null
  const net = isValidMoney(ourPriceNet) ? ourPriceNet : null

  const primary = mode === 'business' ? net ?? gross : gross ?? net
  const secondary = mode === 'business' ? gross : net

  const monthly = React.useMemo(() => {
    if (!primary) return null
    return calculateLeaseMonthly({ clientPriceGross: primary, months })
  }, [primary, months])

  const label = mode === 'business' ? 'Cena netto' : 'Cena brutto'

  return (
    <>
      <Text variant="muted">{label}</Text>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
        {primary ? formatPLN(primary) : '—'}
      </div>

      {secondary ? (
        <Text variant="secondary" className="mt-2">
          {formatPLN(secondary)} {mode === 'business' ? 'brutto' : 'netto'}
        </Text>
      ) : null}

      {monthly ? (
        <div className="mt-3">
          <Text variant="muted">Rata (estymacja)</Text>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm text-text-muted">od</span>
            <span className="text-3xl font-semibold tracking-tight text-text-primary">{formatPLN(monthly)}</span>
            <span className="text-sm font-medium text-text-muted">/ mies.</span>
            <span className="text-xs text-text-muted">({months} mies.)</span>
          </div>
        </div>
      ) : null}
    </>
  )
}
