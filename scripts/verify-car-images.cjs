/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')

function normalizeToUpperUnderscore(input) {
  return String(input ?? '')
    .replace(/\.(avif|webp|png|jpe?g)$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toUpperCase()
}

function getCarImageCandidates(imageKey) {
  const hasExt = /\.(avif|webp|png|jpe?g)$/i.test(imageKey)
  const placeholder = '/cars/placeholder.svg'

  function withNumericVariants(base) {
    return Array.from(
      new Set([base, `${base} (2)`, `${base} (3)`, `${base}-2`, `${base}-3`, `${base}_2`, `${base}_3`]),
    )
  }

  function baseNameVariants(key) {
    const raw = String(key ?? '').replace(/\.(avif|webp|png|jpe?g)$/i, '')
    const upper = normalizeToUpperUnderscore(raw)

    const lowerRawVariants = Array.from(
      new Set([
        raw,
        raw.replace(/\./g, '_'),
        raw.replace(/\./g, '-'),
        raw.replace(/-/g, '_'),
        raw.replace(/_/g, '-'),
        // extra useful variants for names with spaces
        raw.replace(/\s+/g, ' '),
        raw.replace(/\s+/g, '_'),
        raw.replace(/\s+/g, '-'),
      ]),
    )

    const upperVariants = Array.from(
      new Set([upper, `Nav_${upper}`, `NAV_${upper}`, `small_${upper}`, `Small_${upper}`]),
    )

    return [...lowerRawVariants, ...upperVariants]
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

function main() {
  const inventoryPath = path.join('src', 'data', 'inventory.json')
  const carsDir = path.join('public', 'cars')

  if (!fs.existsSync(inventoryPath)) {
    console.error(`[verify:images] Missing ${inventoryPath}`)
    process.exit(1)
  }
  if (!fs.existsSync(carsDir)) {
    console.error(`[verify:images] Missing ${carsDir}`)
    process.exit(1)
  }

  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))
  const carFiles = fs.readdirSync(carsDir, { withFileTypes: true })
  const carsSet = new Set(
    carFiles.filter((d) => d.isFile()).map((d) => `cars/${d.name}`),
  )

  const carsLowerToExact = new Map()
  for (const p of carsSet) carsLowerToExact.set(p.toLowerCase(), p)

  const missing = []
  const caseMismatches = []
  const ok = []

  for (const item of inventory) {
    const label = `${item.brand} ${item.model} — ${item.trim}`
    const candidates = getCarImageCandidates(item.imageKey)

    let found = null
    let foundCaseMismatch = null

    for (const src of candidates) {
      if (src.endsWith('/placeholder.svg')) continue
      const rel = src.replace(/^\//, '')

      if (carsSet.has(rel)) {
        found = rel
        break
      }

      const lower = rel.toLowerCase()
      const exact = carsLowerToExact.get(lower)
      if (exact) {
        foundCaseMismatch = { wanted: rel, existsAs: exact }
        // keep searching for exact match just in case
      }
    }

    if (found) {
      ok.push({ label, imageKey: item.imageKey, file: found })
    } else if (foundCaseMismatch) {
      caseMismatches.push({ label, imageKey: item.imageKey, ...foundCaseMismatch })
    } else {
      missing.push({ label, imageKey: item.imageKey })
    }
  }

  console.log(`[verify:images] OK matches: ${ok.length}`)
  if (caseMismatches.length) {
    console.log(`\n[verify:images] Case/spacing mismatches (will break on Linux hosting): ${caseMismatches.length}`)
    for (const m of caseMismatches) {
      console.log(`- ${m.label}`)
      console.log(`  imageKey: ${m.imageKey}`)
      console.log(`  wants:   public/${m.wanted}`)
      console.log(`  exists:  public/${m.existsAs}`)
    }
  }
  if (missing.length) {
    console.log(`\n[verify:images] Missing images (will use placeholder): ${missing.length}`)
    for (const m of missing) {
      console.log(`- ${m.label} (imageKey: ${m.imageKey})`)
    }
  }

  if (caseMismatches.length || missing.length) process.exit(1)
}

main()
