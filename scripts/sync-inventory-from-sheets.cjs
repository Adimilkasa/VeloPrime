/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const { google } = require('googleapis')

function loadDotEnvFile(filePath, { overwrite } = { overwrite: false }) {
  try {
    if (!fs.existsSync(filePath)) return
    const raw = fs.readFileSync(filePath, 'utf8')
    const lines = raw.split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue

      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()

      // strip optional quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }

      if (overwrite || process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // ignore
  }
}

// Allow running via npm scripts without external dotenv tooling.
// Typical precedence: .env < .env.local
loadDotEnvFile(path.resolve('.env'))
loadDotEnvFile(path.resolve('.env.local'), { overwrite: true })

function env(name, fallback) {
  const value = process.env[name]
  return value === undefined || value === '' ? fallback : value
}

function die(message) {
  throw new Error(`[sync:inventory] ${message}`)
}

function stripDiacritics(input) {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalizeKey(input) {
  return stripDiacritics(String(input ?? ''))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function parseMoney(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  // Keep digits, dot, comma, minus; drop currency and spaces.
  const cleaned = raw
    .replace(/\s+/g, '')
    .replace(/z[lł]|pln/gi, '')
    .replace(/[^0-9,.-]/g, '')
    .replace(/,(?=\d{3}(\D|$))/g, '') // treat 1,234 as thousands comma
    .replace(',', '.')

  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

function parseIntStrict(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null
  const num = Number(raw)
  if (!Number.isFinite(num)) return null
  return Math.trunc(num)
}

function slugifyImageKey(brand, model, trim) {
  return normalizeKey(`${brand}-${model}-${trim}`).replace(/_/g, '-')
}

function parseAvailability(input) {
  const v = normalizeKey(input)
  if (!v) return 'IN_STOCK'

  const yes = new Set([
    'in_stock',
    'instock',
    'available',
    'dostepne',
    'dostepny',
    'tak',
    'yes',
    'true',
    '1',
  ])
  const no = new Set([
    'out_of_stock',
    'outofstock',
    'sold',
    'sprzedane',
    'niedostepne',
    'nie',
    'no',
    'false',
    '0',
  ])

  if (yes.has(v)) return 'IN_STOCK'
  if (no.has(v)) return 'OUT_OF_STOCK'

  // Accept already-canonical values with whitespace/dashes.
  if (v === 'in_stock') return 'IN_STOCK'
  if (v === 'out_of_stock') return 'OUT_OF_STOCK'

  return 'OUT_OF_STOCK'
}

function parsePowertrain(input) {
  const v = normalizeKey(input)
  if (!v) return 'OTHER'

  if (v.includes('bev') || v.includes('elektr')) return 'BEV'
  if (v.includes('phev') || (v.includes('hyb') && v.includes('plug')) || v.includes('plug_in')) return 'PHEV'

  return 'OTHER'
}

function resolveHeaderIndex(headers, aliases) {
  const normalizedToIndex = new Map()
  headers.forEach((h, idx) => {
    const key = normalizeKey(h)
    if (!key) return
    if (!normalizedToIndex.has(key)) normalizedToIndex.set(key, idx)
  })

  for (const alias of aliases) {
    const aliasKey = normalizeKey(alias)
    if (!aliasKey) continue

    const direct = normalizedToIndex.get(aliasKey)
    if (direct !== undefined) return direct

    // Fuzzy fallback: if there is exactly one header that contains the alias key, use it.
    // This helps with headers like "Cena katalogowa (PLN)" vs alias "cena katalogowa".
    const matches = []
    for (const [headerKey, headerIdx] of normalizedToIndex.entries()) {
      if (headerKey.includes(aliasKey)) matches.push(headerIdx)
    }
    if (matches.length === 1) return matches[0]
  }
  return null
}

async function readSheetValues({ spreadsheetId, tab, range, credentials }) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!${range}`,
  })

  const values = res?.data?.values
  return Array.isArray(values) ? values : []
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  function pushCell() {
    row.push(cell)
    cell = ''
  }

  function pushRow() {
    // avoid trailing empty row
    if (row.length === 1 && row[0] === '') return
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1]
        if (next === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      pushCell()
      continue
    }
    if (ch === '\n') {
      pushCell()
      pushRow()
      continue
    }
    if (ch === '\r') {
      // ignore, will be handled by \n
      continue
    }

    cell += ch
  }

  pushCell()
  pushRow()

  return rows
}

async function readPublicSheetCsv({ spreadsheetId, tab }) {
  // Works when the sheet is accessible by link (or published).
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId,
  )}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`

  const res = await fetch(url)
  if (!res.ok) {
    die(`Public CSV fetch failed (${res.status}). If the sheet is private, use a Service Account.`)
  }
  const text = await res.text()
  return parseCsv(text)
}

async function readPublicSheetCsvByGid({ spreadsheetId, gid }) {
  // More deterministic than `sheet=<name>` because it does not depend on the tab title.
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId,
  )}/export?format=csv&gid=${encodeURIComponent(gid)}`

  const res = await fetch(url)
  if (!res.ok) {
    die(`Public CSV fetch failed (${res.status}). If the sheet is private, use a Service Account.`)
  }
  const text = await res.text()
  return parseCsv(text)
}

async function main() {
  const serviceAccountFile = env('GOOGLE_SERVICE_ACCOUNT_FILE', '')
  const spreadsheetId = env('GOOGLE_SHEET_ID', '')
  const tab = env('GOOGLE_SHEET_TAB', 'DANE')
  const range = env('GOOGLE_SHEETS_RANGE', 'A1:Z')
  const gid = env('GOOGLE_SHEET_GID', '')
  const outputFile = env('INVENTORY_OUTPUT_FILE', path.join('src', 'data', 'inventory.json'))

  if (!spreadsheetId) {
    die('Missing GOOGLE_SHEET_ID (paste it from the Google Sheet URL).')
  }

  let values
  if (serviceAccountFile && fs.existsSync(serviceAccountFile)) {
    console.log(`[sync:inventory] Source: sheets-api (service account)`)
    console.log(`[sync:inventory] Sheet: ${spreadsheetId} | Tab: ${tab} | Range: ${range}`)
    const credentials = JSON.parse(fs.readFileSync(serviceAccountFile, 'utf8'))
    values = await readSheetValues({ spreadsheetId, tab, range, credentials })
  } else {
    console.log('[sync:inventory] No service account file found; trying public CSV mode...')
    console.log(`[sync:inventory] Sheet: ${spreadsheetId} | Tab: ${tab}${gid ? ` | GID: ${gid}` : ''}`)
    values = gid ? await readPublicSheetCsvByGid({ spreadsheetId, gid }) : await readPublicSheetCsv({ spreadsheetId, tab })
  }

  if (values.length < 2) {
    die(`No rows found in ${tab}!${range}. Make sure the first row is a header.`)
  }

  const headers = values[0]
  const rows = values.slice(1)

  const idx = {
    brand: resolveHeaderIndex(headers, ['brand', 'marka', 'producent']),
    model: resolveHeaderIndex(headers, ['model']),
    trim: resolveHeaderIndex(headers, ['trim', 'wersja', 'wyposazenie', 'wyposażenie', 'konfiguracja']),
    bodyType: resolveHeaderIndex(headers, ['bodyType', 'body_type', 'nadwozie', 'typ nadwozia', 'typ_nadwozia']),
    year: resolveHeaderIndex(headers, ['year', 'rok', 'rocznik']),
    listPriceNet: resolveHeaderIndex(headers, [
      'listPriceNet',
      'list_price_net',
      'cena katalogowa netto',
      'cena_katalogowa_netto',
      'cena katalogowa netto pln',
      'cena_katalogowa_netto_pln',
    ]),
    listPriceGross: resolveHeaderIndex(headers, [
      'listPriceGross',
      'list_price_gross',
      'cena katalogowa brutto',
      'cena_katalogowa_brutto',
      'cena katalogowa (pln)',
      'cena_katalogowa_pln',
      'cena katalogowa',
      'cena od dealera brutto pln',
      'cena_od_dealera_brutto_pln',
      'msrp',
    ]),
    ourPriceGross: resolveHeaderIndex(headers, [
      'ourPriceGross',
      'our_price_gross',
      'nasza cena brutto',
      'nasza_cena_brutto',
      'cena ofertowa brutto',
      'cena sprzedazy',
      'cena_sprzedazy',
      'cena baza sprzedazy',
      'cena_baza_sprzedazy',
    ]),
    ourPriceNet: resolveHeaderIndex(headers, [
      'ourPriceNet',
      'our_price_net',
      'nasza cena netto',
      'nasza_cena_netto',
      'cena sprzedazy netto',
      'cena sprzedaży netto',
      'cena sprzedazy netto',
      'cena_sprzedazy_netto',
      'cena baza sprzedazy netto',
      'cena_baza_sprzedazy_netto',
      'cena dealera netto pln',
      'cena_dealera_netto_pln',
    ]),
    powertrain: resolveHeaderIndex(headers, ['powertrain', 'typ napedu', 'typ napędu', 'naped', 'napęd']),
    availability: resolveHeaderIndex(headers, ['availability', 'dostepnosc', 'dostępność', 'status']),
    imageKey: resolveHeaderIndex(headers, ['imageKey', 'image_key', 'image', 'zdjecie', 'zdjęcie', 'plik', 'filename']),
  }

  // Some sheets (including our `DANE`) have two adjacent sale price columns:
  // - "Cena sprzedaży" (gross)
  // - next column (often with an empty header) containing sale net.
  // Prefer that adjacent column for `ourPriceNet` over dealer-net columns.
  const saleNetAdjacentIdx =
    idx.ourPriceGross !== null && idx.ourPriceGross + 1 < headers.length ? idx.ourPriceGross + 1 : null

  // `bodyType`, `availability`, `imageKey` can be absent in the sheet – we can default them.
  const required = ['brand', 'model', 'trim', 'year', 'listPriceNet', 'listPriceGross', 'ourPriceGross']
  const missing = required.filter((k) => idx[k] === null)
  if (missing.length) {
    die(
      `Missing required columns in header row: ${missing.join(', ')}\n` +
        `Found headers: ${headers.join(' | ')}`,
    )
  }

  const items = []
  let skipped = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // spreadsheet is 1-based, header is row 1

    const brand = String(row[idx.brand] ?? '').trim()
    const model = String(row[idx.model] ?? '').trim()
    const trim = String(row[idx.trim] ?? '').trim()
    const bodyType = idx.bodyType === null ? '—' : String(row[idx.bodyType] ?? '').trim() || '—'
    const year = parseIntStrict(row[idx.year])
    const listPriceNetRaw = parseMoney(row[idx.listPriceNet])
    const listPriceGrossRaw = parseMoney(row[idx.listPriceGross])
    const ourPriceGrossRaw = parseMoney(row[idx.ourPriceGross])
    const ourPriceNetFromAdjacentSale = saleNetAdjacentIdx === null ? null : parseMoney(row[saleNetAdjacentIdx])
    const ourPriceNetFromExplicitColumn = idx.ourPriceNet === null ? null : parseMoney(row[idx.ourPriceNet])
    const ourPriceNetRaw = ourPriceNetFromAdjacentSale ?? ourPriceNetFromExplicitColumn
    const listPriceNet = listPriceNetRaw === null ? null : Math.round(listPriceNetRaw)
    const listPriceGross = listPriceGrossRaw === null ? null : Math.round(listPriceGrossRaw)
    const ourPriceGross = ourPriceGrossRaw === null ? null : Math.round(ourPriceGrossRaw)
    const ourPriceNet = ourPriceNetRaw === null ? null : Math.round(ourPriceNetRaw)
    const powertrain = idx.powertrain === null ? 'OTHER' : parsePowertrain(row[idx.powertrain])
    const availability = idx.availability === null ? 'IN_STOCK' : parseAvailability(row[idx.availability])
    const imageKeyRaw = idx.imageKey === null ? '' : String(row[idx.imageKey] ?? '').trim()

    // Skip empty lines
    if (!brand && !model && !trim) {
      skipped++
      continue
    }

    const problems = []
    if (!brand) problems.push('brand')
    if (!model) problems.push('model')
    if (!trim) problems.push('trim')
    if (!year) problems.push('year')
    if (listPriceNet === null) problems.push('listPriceNet')
    if (listPriceGross === null) problems.push('listPriceGross')
    if (ourPriceGross === null) problems.push('ourPriceGross')
    if (problems.length) {
      die(`Row ${rowNum}: missing/invalid fields: ${problems.join(', ')}`)
    }

    // Default imageKey: match common "one photo per model" naming.
    // If you need per-trim photos, add an `imageKey` column in the sheet.
    const imageKey = imageKeyRaw || model

    items.push({
      brand,
      model,
      trim,
      bodyType,
      year,
      listPriceNet,
      listPriceGross,
      ourPriceGross,
      ourPriceNet,
      powertrain,
      availability,
      imageKey,
    })
  }

  if (!items.length) {
    die('No inventory items parsed (only empty rows?).')
  }

  const outputAbs = path.resolve(outputFile)
  fs.mkdirSync(path.dirname(outputAbs), { recursive: true })
  fs.writeFileSync(outputAbs, JSON.stringify(items, null, 2) + '\n', 'utf8')

  console.log(`[sync:inventory] OK: wrote ${items.length} items to ${outputFile} (skipped empty rows: ${skipped}).`)
}

main().catch((err) => {
  console.error('\n[sync:inventory] Failed:', err)
  process.exit(1)
})
