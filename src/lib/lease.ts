export type LeaseInput = {
  clientPriceGross: number
  months: 36 | 48 | 60
  downPct?: number
  residualPct?: number
  annualRate?: number
}

function roundPLN(value: number) {
  return Math.round(value)
}

export function calculateLeaseMonthly({
  clientPriceGross,
  months,
  downPct = 0.10,
  residualPct = 0.35,
  annualRate = 0.05,
}: LeaseInput) {
  const down = clientPriceGross * downPct
  const residual = clientPriceGross * residualPct
  const financed = Math.max(clientPriceGross - down - residual, 0)

  const r = annualRate / 12
  const n = months

  if (financed <= 0) return 0
  if (r === 0) return roundPLN(financed / n)

  const pow = Math.pow(1 + r, n)
  const monthly = financed * (r * pow) / (pow - 1)

  return roundPLN(monthly)
}
