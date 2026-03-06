import type { InventoryItem, Powertrain } from '@/types/inventory'

export type ModelGroup = {
  key: string
  slug: string
  brand: string
  model: string
  imageKey: string
  powertrain: Powertrain
  years: number[]
  trims: string[]
  items: InventoryItem[]
}

function normalizeSlugPart(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function modelGroupSlug(brand: string, model: string) {
  const b = normalizeSlugPart(brand)
  const m = normalizeSlugPart(model)
  return [b, m].filter(Boolean).join('-')
}

export function parsePowertrain(value: unknown): Powertrain {
  const raw = String(value ?? '').trim().toLowerCase()
  if (!raw) return 'OTHER'

  if (raw.includes('bev')) return 'BEV'
  if (raw.includes('phev')) return 'PHEV'

  // common PL labels
  if (raw.includes('elek')) return 'BEV'
  if (raw.includes('hyb') && raw.includes('plug')) return 'PHEV'
  if (raw.includes('plug-in')) return 'PHEV'

  return 'OTHER'
}

export function groupInventoryByModel(items: InventoryItem[]): ModelGroup[] {
  const map = new Map<string, ModelGroup>()

  for (const item of items) {
    const key = `${item.brand}|||${item.model}`
    const powertrain = item.powertrain ?? 'OTHER'
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        key,
        slug: modelGroupSlug(item.brand, item.model),
        brand: item.brand,
        model: item.model,
        imageKey: item.imageKey || item.model,
        powertrain,
        years: [item.year].filter((y) => Number.isFinite(y)),
        trims: [item.trim].filter(Boolean),
        items: [item],
      })
      continue
    }

    existing.items.push(item)
    if (Number.isFinite(item.year) && !existing.years.includes(item.year)) existing.years.push(item.year)
    if (item.trim && !existing.trims.includes(item.trim)) existing.trims.push(item.trim)
    if (existing.powertrain === 'OTHER' && powertrain !== 'OTHER') existing.powertrain = powertrain
  }

  return [...map.values()].map((g) => {
    g.years.sort((a, b) => b - a)
    g.trims.sort((a, b) => a.localeCompare(b, 'pl'))
    return g
  })
}

export function minPriceGross(group: ModelGroup) {
  const values = group.items
    .map((i) => i.ourPriceGross)
    .filter((n): n is number => Number.isFinite(n) && n > 0)
  return values.length ? Math.min(...values) : null
}

export function minPriceNet(group: ModelGroup) {
  const values = group.items
    .map((i) => i.ourPriceNet)
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0)
  return values.length ? Math.min(...values) : null
}

export function minListPriceGross(group: ModelGroup) {
  const values = group.items
    .map((i) => i.listPriceGross)
    .filter((n): n is number => Number.isFinite(n) && n > 0)
  return values.length ? Math.min(...values) : null
}

export function minListPriceNet(group: ModelGroup) {
  const values = group.items
    .map((i) => i.listPriceNet)
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0)
  return values.length ? Math.min(...values) : null
}
