import type { InventoryItem } from '@/types/inventory'

export function getAvailableItems(items: InventoryItem[]) {
  return items.filter((x) => x.availability === 'IN_STOCK')
}

export function getAvailableCount(items: InventoryItem[]) {
  return getAvailableItems(items).length
}

export function pickTeaserItems(items: InventoryItem[], maxItems = 8) {
  const available = getAvailableItems(items)
  return available.slice(0, Math.max(0, Math.min(maxItems, available.length)))
}
