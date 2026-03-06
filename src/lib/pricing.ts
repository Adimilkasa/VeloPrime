export function roundUpToHundreds(value: number) {
  if (!Number.isFinite(value)) return value
  return Math.ceil(value / 100) * 100
}

export function formatPLN(value: number) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0,
  }).format(value)
}
export type Offer = {
  clientPrice: number
  clientDiscount: number
  profit: number
}

const PROFIT_CAP_GROSS = 14_000

function roundPLN(value: number) {
  return Math.round(value)
}

export function computeOffer(listPriceGross: number, ourPriceGross: number): Offer {
  const discountTotal = listPriceGross - ourPriceGross

  const rawProfit = discountTotal / 2
  const profit = roundPLN(Math.min(Math.max(rawProfit, 0), PROFIT_CAP_GROSS))

  const clientPrice = roundPLN(ourPriceGross + profit)
  const clientDiscount = roundPLN(Math.max(listPriceGross - clientPrice, 0))

  return { clientPrice, clientDiscount, profit }
}
