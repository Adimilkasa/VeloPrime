import { generatedBySlug } from '@/generated/models'

export function getCarImageCandidates(imageKey: string) {
  const hasExt = /\.(avif|webp|png|jpe?g)$/i.test(imageKey)
  const placeholder = '/cars/placeholder.svg'

  function normalizeToUpperUnderscore(input: string) {
    return input
      .replace(/\.(avif|webp|png|jpe?g)$/i, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_')
      .toUpperCase()
  }

  function baseNameVariants(key: string) {
    const raw = key.replace(/\.(avif|webp|png|jpe?g)$/i, '')
    const upper = normalizeToUpperUnderscore(raw)

    const lowerRawVariants = Array.from(
      new Set([
        raw,
        raw.replace(/\s+/g, ' '),
        raw.replace(/\s+/g, '_'),
        raw.replace(/\s+/g, '-'),
        raw.replace(/\./g, '_'),
        raw.replace(/\./g, '-'),
        raw.replace(/-/g, '_'),
        raw.replace(/_/g, '-'),
      ]),
    )

    const upperVariants = Array.from(
      new Set([upper, `Nav_${upper}`, `NAV_${upper}`, `small_${upper}`, `Small_${upper}`]),
    )

    return [...lowerRawVariants, ...upperVariants]
  }

  function withNumericVariants(base: string) {
    // Common patterns when you have multiple photos for the same model:
    // "Model.webp", "Model (2).webp", "Model-2.webp", "Model_2.webp".
    return Array.from(
      new Set([
        base,
        `${base} (2)`,
        `${base} (3)`,
        `${base}-2`,
        `${base}-3`,
        `${base}_2`,
        `${base}_3`,
      ]),
    )
  }

  if (hasExt) return [`/cars/${imageKey}`, placeholder]

  const bases = baseNameVariants(imageKey)
  const candidates = bases.flatMap((b) =>
    withNumericVariants(b).flatMap((name) => [
      `/cars/${name}.webp`,
      `/cars/${name}.png`,
      `/cars/${name}.jpg`,
      `/cars/${name}.jpeg`,
    ]),
  )

  return [...candidates, placeholder]
}

export async function resolveCarImageSrc(imageKey: string) {
  const variants = await resolveCarImageVariants(imageKey)
  return variants[0] ?? '/cars/placeholder.svg'
}

export async function resolveCarImageSrcForItem(item: {
  imageKey: string
  brand: string
  model: string
  trim: string
}) {
  // Prefer generated model hero images (grafiki/<slug>/premium...) when available.
  const baseSlug = modelGroupSlug(item.brand, item.model)
  const candidateSlugs = /dm-i/i.test(item.trim)
    ? [`${baseSlug}-dm-i`, baseSlug]
    : [baseSlug]
  const generated = candidateSlugs
    .map((slug) => generatedBySlug?.[slug])
    .find(Boolean)
  const hero = generated?.media?.hero
  if (Array.isArray(hero) && hero.length) {
    const seed = stableHash(`${item.brand}|${item.model}|${item.trim}`)
    const idx = seed % hero.length
    const src = hero[idx]?.src || hero[0]?.src
    if (typeof src === 'string' && src.startsWith('/')) return src
  }

  // Fallback to /cars pipeline. Avoid network probing (HEAD) — let next/image handle loading
  // and use onError() fallback in the component.
  const base = item.imageKey
  const hasExt = /\.(avif|webp|png|jpe?g)$/i.test(base)
  const raw = hasExt ? `/cars/${base}` : `/cars/${base}.webp`
  return encodeURI(raw)
}

function normalizeSlugPart(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function modelGroupSlug(brand: string, model: string) {
  const b = normalizeSlugPart(brand)
  const m = normalizeSlugPart(model)
  return [b, m].filter(Boolean).join('-')
}

async function resolveCarImageVariants(imageKey: string) {
  const cachedList = resolvedListByKey.get(imageKey)
  if (cachedList) return cachedList

  // Fast path: when `imageKey` matches actual filenames (your current setup),
  // probe only a small set of likely variants to avoid many 404s in devtools.
  const directCandidates = getDirectVariantCandidates(imageKey)
  const found: string[] = []

  for (const src of directCandidates) {
    const ok = await headOkCached(src)
    if (ok) found.push(src)
  }

  if (found.length) {
    const unique = Array.from(new Set(found))
    resolvedListByKey.set(imageKey, unique)
    if (unique[0]) resolvedByKey.set(imageKey, unique[0])
    return unique
  }

  // Fallback: legacy/robust matching (kept for older file naming).
  const candidates = getCarImageCandidates(imageKey)
  for (const src of candidates) {
    if (src.endsWith('.svg')) continue
    const ok = await headOkCached(src)
    if (ok) {
      const unique = [src]
      resolvedListByKey.set(imageKey, unique)
      resolvedByKey.set(imageKey, src)
      return unique
    }
  }

  resolvedListByKey.set(imageKey, [])
  return []
}

function encodeSrc(src: string) {
  // Ensures filenames with spaces/parentheses work with fetch() and next/image
  // Example: "/cars/Seal U (2).webp" -> "/cars/Seal%20U%20(2).webp"
  return encodeURI(src)
}

function getDirectVariantCandidates(imageKey: string) {
  const hasExt = /\.(avif|webp|png|jpe?g)$/i.test(imageKey)
  if (hasExt) return [`/cars/${imageKey}`]

  const bases = Array.from(
    new Set([
      imageKey,
      `${imageKey} (2)`,
      `${imageKey} (3)`,
    ]),
  )

  // Your current asset pipeline uses .webp, so probe only .webp here to avoid lots of 404s.
  // If nothing matches, we fall back to the more permissive matcher below.
  return bases.map((b) => `/cars/${b}.webp`)
}

function stableHash(input: string) {
  // tiny deterministic hash (32-bit)
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const resolvedByKey = new Map<string, string>()
const resolvedListByKey = new Map<string, string[]>()
const headOkBySrc = new Map<string, boolean>()

async function headOkCached(src: string) {
  const url = encodeSrc(src)
  const cached = headOkBySrc.get(url)
  if (cached !== undefined) return cached

  try {
    const res = await fetch(url, { method: 'HEAD' })
    const ok = res.ok
    headOkBySrc.set(url, ok)
    return ok
  } catch {
    headOkBySrc.set(url, false)
    return false
  }
}
