/*
  Generates data-driven content for /modele/[slug] from:
  - inventory (brand/model/trims)
  - a PDF spec (text extraction)
  - a folder of images (heuristics + optional OpenAI vision)

  Usage:
    node scripts/generate-model-content.cjs --slug byd-dolphin-surf

  List slugs from inventory (same rules as /modele/[slug]):
    node scripts/generate-model-content.cjs --list-slugs

  Optional:
    --imagesDir public/grafiki/byd-dolphin-surf
    --pdf public/spec/byd-dolphin-surf.pdf
    --model gpt-4o-mini

  Env:
    OPENAI_API_KEY=...
    (or put the key in a local file at project root: secret / secret.txt / Secret.txt)
*/

const fs = require('fs')
const path = require('path')
const pdfParseModule = require('pdf-parse')
const pdfParse =
  pdfParseModule?.default ||
  pdfParseModule?.pdfParse ||
  pdfParseModule
const sharp = require('sharp')
const OpenAI = require('openai')

const ROOT = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')

function safeJsonParse(text) {
  try {
    return JSON.parse(String(text || ''))
  } catch {
    return null
  }
}

function concatFileSearchResultsText(response) {
  // If include=["file_search_call.results"] is set, the SDK will attach results on the file_search_call item.
  // Shape may evolve; we defensively extract any string fields we can find.
  const out = []
  const outputs = Array.isArray(response?.output) ? response.output : []
  for (const item of outputs) {
    if (!item || item.type !== 'file_search_call') continue
    const results = item.results || item.search_results || item.searchResults || null
    if (!Array.isArray(results)) continue
    for (const r of results) {
      if (!r) continue
      const candidates = [
        r.content,
        r.text,
        r.snippet,
        r?.document?.content,
        r?.document?.text,
      ]
      for (const c of candidates) {
        if (typeof c === 'string' && c.trim()) out.push(c.trim())
        if (Array.isArray(c)) {
          for (const part of c) {
            if (!part) continue
            if (typeof part === 'string' && part.trim()) out.push(part.trim())
            if (typeof part?.text === 'string' && part.text.trim()) out.push(part.text.trim())
          }
        }
      }
    }
  }
  return out.join('\n')
}

function extractResponsesAssistantText(response) {
  const chunks = []
  const outputs = Array.isArray(response?.output) ? response.output : []
  for (const item of outputs) {
    if (!item || item.type !== 'message') continue
    if (item.role && item.role !== 'assistant') continue
    const content = Array.isArray(item.content) ? item.content : []
    for (const part of content) {
      if (!part) continue
      if (typeof part.text === 'string' && part.text.trim()) chunks.push(part.text.trim())
      if (typeof part?.output_text === 'string' && part.output_text.trim()) chunks.push(part.output_text.trim())
    }
  }
  return chunks.join('\n')
}

async function withPdfVectorStore({ client, pdfAbsPath }, fn) {
  const vectorStore = await client.vectorStores.create({
    name: `model-pdf:${path.basename(pdfAbsPath)}:${Date.now()}`,
  })
  try {
    await client.vectorStores.files.uploadAndPoll(vectorStore.id, fs.createReadStream(pdfAbsPath))
    return await fn({ vectorStoreId: vectorStore.id })
  } finally {
    try {
      await client.vectorStores.delete(vectorStore.id)
    } catch {
      // ignore
    }
  }
}

async function askPdfJsonWithFileSearch({
  client,
  model,
  vectorStoreId,
  prompt,
  schemaName,
  schema,
  maxResults = 8,
}) {
  let res
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      res = await client.responses.create({
        model,
        temperature: 0.2,
        tools: [
          {
            type: 'file_search',
            vector_store_ids: [vectorStoreId],
            max_num_results: maxResults,
          },
        ],
        include: ['file_search_call.results'],
        text: {
          format: {
            type: 'json_schema',
            name: schemaName,
            schema,
            strict: true,
          },
        },
        input: [
          {
            role: 'user',
            content: [{ type: 'input_text', text: prompt }],
          },
        ],
      })
      break
    } catch (err) {
      const status = err?.status || err?.response?.status
      if (status === 429 && attempt < 2) {
        const wait = parseRetryAfterMs(err)
        console.log(`[generate] OpenAI file_search rate limited (429); retrying in ${wait}ms`)
        await sleep(wait)
        continue
      }
      throw err
    }
  }

  const textPrimary = String(res?.output_text || '').trim()
  const textFallback = extractResponsesAssistantText(res)
  const text = textPrimary || textFallback
  const parsed = safeJsonParse(text)
  return {
    data: parsed,
    raw: text,
    fileSearchText: concatFileSearchResultsText(res),
  }
}

function designSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      intro: { type: 'string', minLength: 30, maxLength: 220 },
      bullets: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: { type: 'string', minLength: 8, maxLength: 80, pattern: '^(?!\\s).*(?<!\\s)$' },
      },
    },
    required: ['intro', 'bullets'],
  }
}

function strengthsItemsSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      intro: { type: 'string', minLength: 20, maxLength: 170 },
      items: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string', minLength: 4, maxLength: 44, pattern: '^(?!\\s).*(?<!\\s)$' },
            desc: { type: 'string', minLength: 20, maxLength: 160, pattern: '^(?!\\s).*(?<!\\s)$' },
          },
          required: ['title', 'desc'],
        },
      },
    },
    required: ['intro', 'items'],
  }
}

function cleanStrengthItems(items) {
  const input = Array.isArray(items) ? items : []
  const out = []
  const seen = new Set()
  const seenTitles = new Set()

  const normKey = (title, desc) => {
    const t = normalize(title).replace(/\s+/g, ' ').trim()
    const d = normalize(desc).replace(/\s+/g, ' ').trim()
    return `${t}|${d}`
  }

  for (const it of input) {
    const title = String(it?.title || '').trim()
    let desc = String(it?.desc || '').trim()
    if (!title || !desc) continue

    const titleKey = normalize(title).replace(/\s+/g, ' ').trim()
    if (seenTitles.has(titleKey)) continue

    desc = desc.replace(/[\u2026\.]{3,}$/g, '').replace(/[\u2026]+$/g, '').trim()
    if (desc.length > 160) desc = desc.slice(0, 157).trimEnd() + '…'
    const key = normKey(title, desc)
    if (seen.has(key)) continue
    seen.add(key)
    seenTitles.add(titleKey)
    out.push({ title: title.slice(0, 44), desc })
    if (out.length >= 3) break
  }

  const fallback = [
    { title: 'Bezpieczeństwo', desc: 'Systemy wsparcia kierowcy pomagają w codziennej jeździe i zmniejszają stres w mieście.' },
    { title: 'Komfort w kabinie', desc: 'Przemyślane wnętrze i prosta obsługa ułatwiają dojazdy i dłuższe przejazdy.' },
    { title: 'Łączność i multimedia', desc: 'Telefon, nawigacja i sterowanie funkcjami auta są pod ręką — wygodniej w trasie.' },
  ]

  let i = 0
  while (out.length < 3 && i < fallback.length) {
    const f = fallback[i++]
    const key = normKey(f.title, f.desc)
    if (seen.has(key)) continue
    const titleKey = normalize(f.title).replace(/\s+/g, ' ').trim()
    if (seenTitles.has(titleKey)) continue
    seen.add(key)
    seenTitles.add(titleKey)
    out.push(f)
  }

  return out.slice(0, 3)
}

function cleanBoardTile(tile) {
  const allowedIcons = new Set(['gauge','fuel','timer','camera','sparkles','sun','zap','shield','battery','award'])
  let value = String(tile?.value || '').trim()
  let subtitle = String(tile?.subtitle || '').trim()
  const icon = allowedIcons.has(tile?.icon) ? tile.icon : 'sparkles'

  const valueN = normalize(value)
  if (valueN.includes('automatyczne hamowanie awaryjne')) value = 'AEB (auto hamowanie)'
  else if (valueN.includes('adaptacyjny tempomat') || valueN.includes('tempomat adapt')) value = 'ACC/ICC (tempomat)'
  else if (valueN.includes('asystent utrzymania pasa') || valueN.includes('utrzymania pasa')) value = 'ELKA (pas ruchu)'

  value = value.replace(/[\u2026]+/g, '').trim()
  subtitle = subtitle.replace(/[\u2026]+/g, '').trim()
  if (value.length > 34) value = value.slice(0, 34).trimEnd()
  if (subtitle.length > 70) subtitle = subtitle.slice(0, 70).trimEnd()

  // Avoid dangling opening parens after trimming.
  if (value.endsWith('(')) value = value.slice(0, -1).trimEnd()

  if (!value) value = 'Atut'
  if (!subtitle) subtitle = 'Praktyczna korzyść w codziennej jeździe.'
  return { value, subtitle, icon }
}

function strengthsBoardSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      intro: { type: 'string', minLength: 20, maxLength: 160 },
      tiles: {
        type: 'array',
        minItems: 8,
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            value: { type: 'string', minLength: 2, maxLength: 34, pattern: '^(?!\\s).*(?<!\\s)$' },
            subtitle: { type: 'string', minLength: 8, maxLength: 70, pattern: '^(?!\\s).*(?<!\\s)$' },
            icon: {
              type: 'string',
              enum: ['gauge','fuel','timer','camera','sparkles','sun','zap','shield','battery','award'],
            },
          },
          required: ['value', 'subtitle', 'icon'],
        },
      },
    },
    required: ['intro', 'tiles'],
  }
}

async function generateSectionsFromPdfFileSearch({
  client,
  model,
  vectorStoreId,
  brand,
  carModel,
}) {
  const commonRules =
    'Zasady globalne:\n' +
    '- Pisz po polsku. Styl: fakt + praktyczna korzyść.\n' +
    '- Użyj file_search do znalezienia informacji w PDF.\n' +
    '- NIE wymyślaj liczb, wersji, rabatów ani wyposażenia, jeśli nie wynika to z PDF.\n' +
    '- Teksty muszą być krótkie (kafelki/line-clamp). Unikaj bardzo długich słów.\n'

  const designPrompt =
    `Dane: ${brand} ${carModel}.\n` +
    commonRules +
    'Wygeneruj sekcję DESIGN: jedno intro (2–3 zdania) + 3 krótkie wypunktowania.\n' +
    'Zwróć WYŁĄCZNIE JSON: { intro: string, bullets: string[3] }.'

  const strengthsItemsPrompt =
    `Dane: ${brand} ${carModel}.\n` +
    commonRules +
    'Wygeneruj sekcję MOCNE STRONY (lista): intro + 3 elementy (title+desc).\n' +
    'Każdy element: title krótki (2–5 słów), desc: 1–2 zdania, bez lania wody.\n' +
    'Zwróć WYŁĄCZNIE JSON: { intro: string, items: [{title, desc}]x3 }.'

  const strengthsBoardPrompt =
    `Dane: ${brand} ${carModel}.\n` +
    commonRules +
    'Wygeneruj 8 kafelków do planszy "Mocne strony".\n' +
    'Format kafelka: value = krótki fakt (czasem liczba), subtitle = praktyczna korzyść.\n' +
    'Wymagania:\n' +
    '- Dokładnie 8 kafelków.\n' +
    '- value i subtitle muszą mieścić się w 1–2 liniach (bez wielokropków).\n' +
    '- Jeśli nazwa funkcji jest długa, użyj skrótu/akronimu (np. AEB/ACC/ELKA) zamiast pełnej nazwy.\n' +
    '- Jeśli podajesz liczbę, musi wynikać z PDF; w przeciwnym razie użyj faktów bez liczb.\n' +
    '- Jeden kafelek ma dotyczyć GWARANCJI: value ma być "8 lat" (dla BYD), a w subtitle podaj limit km jeśli jest w PDF; ikonka "award".\n' +
    '- Unikaj duplikatów (nie powtarzaj tej samej korzyści).\n' +
    'Zwróć WYŁĄCZNIE JSON: { intro: string, tiles: [{value, subtitle, icon}]x8 }.'

  const [designRes, strengthsRes, boardRes] = await Promise.all([
    askPdfJsonWithFileSearch({
      client,
      model,
      vectorStoreId,
      prompt: designPrompt,
      schemaName: 'model_design_section',
      schema: designSchema(),
      maxResults: 8,
    }),
    askPdfJsonWithFileSearch({
      client,
      model,
      vectorStoreId,
      prompt: strengthsItemsPrompt,
      schemaName: 'model_strengths_items_section',
      schema: strengthsItemsSchema(),
      maxResults: 8,
    }),
    askPdfJsonWithFileSearch({
      client,
      model,
      vectorStoreId,
      prompt: strengthsBoardPrompt,
      schemaName: 'model_strengths_board_tiles',
      schema: strengthsBoardSchema(),
      maxResults: 10,
    }),
  ])

  return {
    design: designRes.data,
    strengthsItems: strengthsRes.data,
    strengthsBoard: boardRes.data,
    strengthsBoardFileSearchText: boardRes.fileSearchText,
  }
}

function readFirstSecretLine(raw) {
  const lines = String(raw || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (!lines.length) return ''
  const first = lines[0]
  // Allow either a plain key, or a KEY=VALUE line.
  const eq = first.indexOf('=')
  if (eq > 0) return first.slice(eq + 1).trim()
  return first
}

function loadDotEnvFile(absPath) {
  if (!exists(absPath)) return
  let raw
  try {
    raw = fs.readFileSync(absPath, 'utf8')
  } catch {
    return
  }

  const lines = String(raw)
    .split(/\r?\n/)
    .map((l) => l.trim())

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (!key) continue
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value
    }
  }
}

function loadDotEnvFiles() {
  // Keep precedence like typical dotenv usage: .env first, then .env.local overrides.
  loadDotEnvFile(path.join(ROOT, '.env'))
  loadDotEnvFile(path.join(ROOT, '.env.local'))
}

function loadOpenAIKey(args) {
  if (process.env.OPENAI_API_KEY) return String(process.env.OPENAI_API_KEY).trim()

  const keyFileArg = args.keyFile ? String(args.keyFile) : null
  const candidates = [
    keyFileArg,
    'secret',
    'secret.txt',
    'Secret.txt',
  ].filter(Boolean)

  for (const rel of candidates) {
    const abs = path.isAbsolute(rel) ? rel : path.join(ROOT, rel)
    if (!exists(abs)) continue
    try {
      const raw = fs.readFileSync(abs, 'utf8')
      const key = readFirstSecretLine(raw)
      if (key) return key
    } catch {
      // ignore
    }
  }

  return ''
}

function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'))
}

function exists(absPath) {
  try {
    fs.accessSync(absPath)
    return true
  } catch {
    return false
  }
}

function ensureDir(absPath) {
  fs.mkdirSync(absPath, { recursive: true })
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const raw = argv[i]
    if (!raw.startsWith('--')) continue
    const key = raw.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }
    args[key] = next
    i++
  }
  return args
}

function listFiles(absDir) {
  return fs
    .readdirSync(absDir)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
    })
    .map((name) => ({
      name,
      absPath: path.join(absDir, name),
    }))
}

function score(name, keywords) {
  const n = normalize(name)
  let s = 0
  for (const [kw, w] of keywords) {
    if (n.includes(kw)) s += w
  }
  return s
}

function findBestImagesDirInGrafiki({ slug, brand, carModel }) {
  const base = path.join(ROOT, 'public', 'grafiki')
  if (!exists(base)) return null

  const entries = fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  if (!entries.length) return null

  const target = normalize(`${brand} ${carModel}`).replace(/\s+/g, ' ')
  const brandN = normalize(brand)
  const modelN = normalize(carModel)
  const slugN = normalize(slug)
  const slugWords = normalize(slug.replace(/-/g, ' '))

  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)))
  const tokenise = (s) =>
    uniq(
      normalize(String(s || ''))
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/g)
        .map((t) => t.trim())
        .filter((t) => t && (t.length >= 2 || /^\d+$/.test(t) || /^[a-z]$/.test(t)))
    )

  const brandTokens = tokenise(brandN)
  const modelTokens = tokenise(modelN)
  const slugTokens = tokenise(slugWords)
  const allTokens = uniq([...brandTokens, ...modelTokens, ...slugTokens])
  const nonBrandTokens = uniq([...modelTokens, ...slugTokens]).filter((t) => t && !brandTokens.includes(t))

  let best = null
  let bestScore = -1
  let bestStrong = false
  let bestNonBrandHits = 0
  for (const dir of entries) {
    const dirN = normalize(dir)
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const dirWords = dirN.split(' ').filter(Boolean)
    const hasToken = (t) => {
      if (!t) return false
      if (t.length === 1 && /^[a-z]$/.test(t)) return dirWords.includes(t)
      return dirN.includes(t)
    }

    let s = 0
    let nonBrandHits = 0
    // Strong signals (keep conservative to avoid generic model-name matches).
    const strong = dirN.includes(target) || dirN.includes(slugN)
    if (dirN.includes(target)) s += 18
    if (dirN.includes(slugN)) s += 14
    if (dirN.includes(brandN)) s += 8
    if (dirN.includes(modelN)) s += 12

    // Token-based fallback (handles folders like "seal-6-dmi" without brand prefix)
    for (const t of allTokens) {
      if (!t) continue
      if (!hasToken(t)) continue
      if (brandTokens.includes(t)) s += 5
      else if (modelTokens.includes(t)) s += 6
      else s += 3
    }

    for (const t of nonBrandTokens) {
      if (!t) continue
      if (hasToken(t)) nonBrandHits += 1
    }

    if (s > bestScore) {
      bestScore = s
      best = dir
      bestStrong = strong
      bestNonBrandHits = nonBrandHits
    }
  }

  // Require a minimal match so we don't accidentally pick a random model.
  if (!best || bestScore < 10) return null
  // Avoid generic matches. Rules:
  // - If the model has <2 non-brand tokens (e.g. just "Seal"), accept only strict matches.
  // - If it has 2 tokens, require both.
  // - If it has 3+ tokens, require at least 3.
  if (nonBrandTokens.length < 2) {
    // Too ambiguous (e.g. model name "Seal"). Prefer explicit --imagesDir or a dedicated folder.
    return null
  }
  const requiredHits = nonBrandTokens.length >= 3 ? 3 : 2
  if (bestNonBrandHits < requiredHits) return null
  return path.join(base, best)
}

function extractNumericCandidates(pdfText) {
  const text = String(pdfText || '')
  if (!text.trim()) return []

  // Capture common automotive numeric tokens (keep original formatting to reduce hallucinations).
  // NOTE: We intentionally include warranty years ("8 lat") and degree values ("360°"),
  // because the StrongSides board often uses them.
  const patterns = [
    /\b\d{1,3}(?:[ \u00A0\u202F]?\d{3})*(?:[.,]\d+)?\s?(?:km\/h|km|kW|kWh|min|h|s|%|l\/100\s?km|l\s?\/\s?100\s?km|l|L|mm|cm|m|kg|W|Wh|V|A)\b/gi,
    /\b\d+\s*(?:lat|lata|roku|rok|l\.)\b/gi,
    /\b\d+\s*(?:Nm|nm)\b/g,
    /\b\d{2,4}\s*°/g,
  ]

  const out = []
  const seen = new Set()
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const raw = String(m[0] || '').trim()
      if (!raw) continue
      const key = normalize(raw).replace(/\s+/g, ' ')
      if (seen.has(key)) continue
      seen.add(key)
      out.push(raw)
      if (out.length >= 40) return out
    }
  }
  return out
}

function extractPdfRelevantText(pdfText) {
  const text = String(pdfText || '')
  if (!text.trim()) return ''
  const keywords = [
    'zasieg',
    'zasięg',
    'ladow',
    'ładow',
    'bateria',
    'akumulator',
    'kwh',
    'kw',
    'km',
    'min',
    'gwar',
    'bezpieczen',
    'bezpieczeń',
    'adas',
    'nfc',
    'blade',
    'lfp',
    'pompa',
    'ciepla',
    'ciepła',
    'bagaz',
    'bagaż',
    'wymiary',
    'moc',
    'przysp',
    '0',
  ]
  const lines = text
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean)

  const picked = []
  for (const line of lines) {
    const ln = normalize(line)
    const hasDigit = /\d/.test(line)
    const hasKw = keywords.some((k) => k && ln.includes(normalize(k)))
    if (hasDigit || hasKw) picked.push(line)
    if (picked.length >= 400) break
  }

  // Keep it small enough for chat prompts; we still preserve the most relevant bits.
  return picked.join('\n').slice(0, 14000)
}

function buildNumericContexts(pdfText, numericCandidates) {
  const text = String(pdfText || '')
  const cands = Array.isArray(numericCandidates) ? numericCandidates : []
  const out = []
  for (const cand of cands.slice(0, 30)) {
    const idx = text.indexOf(cand)
    if (idx < 0) continue
    const start = Math.max(0, idx - 160)
    const end = Math.min(text.length, idx + cand.length + 160)
    const ctx = text.slice(start, end).replace(/\s+/g, ' ').trim()
    out.push({ value: cand, context: ctx })
    if (out.length >= 25) break
  }
  return out
}

function containsAnyNumericCandidate(text, numericCandidates) {
  const t = normalize(String(text || '')).replace(/\s+/g, '')
  if (!t) return false
  for (const cand of numericCandidates || []) {
    const c = normalize(String(cand || '')).replace(/\s+/g, '')
    if (c && t.includes(c)) return true
  }
  return false
}

function enforceBoardNumericCandidates(board, numericCandidates) {
  if (!board || !board.rows) return board
  const cands = Array.isArray(numericCandidates) ? numericCandidates : []
  const fallbackByIcon = {
    gauge: 'Zasięg',
    fuel: 'Efektywność',
    timer: 'Dynamika',
    camera: 'Parkowanie',
    sparkles: 'Komfort',
    sun: 'Przestrzeń',
    zap: 'Technologia',
    shield: 'Bezpieczeństwo',
    battery: 'Ładowanie',
    award: 'Gwarancja',
  }

  const fix = (tile) => {
    if (!tile || typeof tile !== 'object') return tile
    const value = String(tile.value || '')
    if (/\d/.test(value) && !containsAnyNumericCandidate(value, cands)) {
      const fallback = fallbackByIcon[tile.icon] || 'Korzyść'
      return { ...tile, value: fallback }
    }
    return tile
  }

  board.rows.row1 = Array.isArray(board.rows.row1) ? board.rows.row1.map(fix) : board.rows.row1
  board.rows.row2 = Array.isArray(board.rows.row2) ? board.rows.row2.map(fix) : board.rows.row2
  board.rows.row3 = Array.isArray(board.rows.row3) ? board.rows.row3.map(fix) : board.rows.row3
  return board
}

function pickBoardImagesFromMedia(media, seedKey = '') {
  const stableHash32 = (s) => {
    // FNV-1a 32-bit
    let h = 0x811c9dc5
    const str = String(s || '')
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    return h >>> 0
  }

  const pickStable = (arr, salt) => {
    const a = Array.isArray(arr) ? arr.filter(Boolean) : []
    if (!a.length) return null
    const idx = stableHash32(`${seedKey}::${salt}::${a.length}`) % a.length
    return a[idx]
  }

  const hero0 = pickStable(media?.hero, 'hero')
  const hero1 = pickStable(media?.hero, 'hero2') || hero0
  const exterior0 = pickStable(media?.exteriorGrid, 'exterior') || hero0
  const interior0 = pickStable([media?.interior?.opener, ...(media?.interior?.grid || [])].filter(Boolean), 'interior') || hero0
  const tech0 = pickStable(media?.details, 'details') || hero1 || hero0
  if (!exterior0 || !interior0 || !tech0) return null
  return {
    exterior: { src: exterior0.src, alt: exterior0.alt || 'Ujęcie zewnętrzne' },
    interior: { src: interior0.src, alt: interior0.alt || 'Wnętrze' },
    tech: { src: tech0.src, alt: tech0.alt || 'Technologia' },
  }
}

function pickWarrantyFromNumericContexts(numericContexts) {
  const contexts = Array.isArray(numericContexts) ? numericContexts : []
  const kmCandidates = contexts
    .filter((x) => x?.value && /km/i.test(String(x.value)) && isLargeKmValue(String(x.value)))
    .map((x) => ({ ...x, kind: classifyNumericContext(String(x.context || '')) }))

  const kmWarranty = kmCandidates.find((x) => x.kind === 'warranty') || kmCandidates[0] || null
  const km = kmWarranty ? normalizeKmSpacing(String(kmWarranty.value)) : ''

  const yearsCandidates = contexts
    .filter((x) => x?.value && /\b(?:lat|lata|rok|roku|l\.)\b/i.test(String(x.value)))
    .map((x) => ({ ...x, kind: classifyNumericContext(String(x.context || '')) }))

  const yearsWarranty = yearsCandidates.find((x) => x.kind === 'warranty') || yearsCandidates[0] || null
  const years = yearsWarranty ? String(yearsWarranty.value).replace(/\s+/g, ' ').trim() : '8 lat'

  return { years, km }
}

function buildWarrantyTileFromPdf({ numericContexts, brand }) {
  const contexts = Array.isArray(numericContexts) ? numericContexts : []
  const km = contexts
    .filter((x) => x?.value && /km/i.test(String(x.value)) && isLargeKmValue(String(x.value)))
    .map((x) => ({ value: normalizeKmSpacing(String(x.value)), kind: classifyNumericContext(String(x.context || '')) }))
    .filter((x) => x.value)

  const kmWarranty = km.filter((x) => x.kind === 'warranty').map((x) => x.value)
  const kmPicked = (kmWarranty.length ? kmWarranty : km.map((x) => x.value)).slice(0, 3)

  const yearsRaw = pickWarrantyFromNumericContexts(numericContexts)?.years
  const years = normalize(brand).includes('byd') ? '8 lat' : String(yearsRaw || 'Gwarancja')

  const prefix = normalize(brand).includes('byd') ? 'Gwarancja 8 lat. ' : 'Gwarancja. '
  const subtitle = (() => {
    if (kmPicked.length >= 2) {
      return `${prefix}Limit do ${kmPicked[0]} / ${kmPicked[1]} — wg warunków.`
    }
    if (kmPicked.length === 1) {
      return `${prefix}Limit do ${kmPicked[0]} — wg warunków.`
    }
    return `${prefix}Limit km wg warunków.`
  })()

  return { value: years, subtitle, icon: 'award' }
}

function classifyImageByName(name) {
  const n = normalize(String(name || ''))
  const has = (...subs) => subs.some((s) => n.includes(s))
  if (has('premium', 'przemium')) return 'hero'
  if (has('wnetrz', 'wnetrze', 'wewnatrz', 'interior', 'kokpit')) return 'interior'
  if (has('zewnatrz', 'zewnatr', 'exterior')) return 'exterior'
  if (has('detal', 'detale', 'detail', 'details')) return 'details'
  return null
}

function filenameMedia(files) {
  const all = Array.isArray(files) ? files.filter((f) => f && f.name) : []
  if (!all.length) return null

  const hasAnyStandardTag = all.some((f) => classifyImageByName(f.name))
  if (!hasAnyStandardTag) return null

  // Tag-first categorization, then heuristic fallback for untagged.
  // IMPORTANT: premium/przemium stays ONLY in hero.
  const hero = []
  const exteriorGrid = []
  const interiorGrid = []
  const details = []
  const assigned = new Set()
  const heroUsed = new Set()

  const pushAssignedUnique = (arr, f) => {
    if (!f || !f.name) return
    if (assigned.has(f.name)) return
    assigned.add(f.name)
    arr.push(f)
  }

  // Hero can intentionally re-use images from other categories (fallback: use strong exterior shots).
  const pushHeroUnique = (f) => {
    if (!f || !f.name) return
    if (heroUsed.has(f.name)) return
    heroUsed.add(f.name)
    hero.push(f)
  }

  for (const f of all) {
    const kind = classifyImageByName(f.name)
    if (!kind) continue
    if (kind === 'hero') {
      // premium stays ONLY in hero (but must not duplicate)
      assigned.add(f.name)
      pushHeroUnique(f)
    } else if (kind === 'exterior') pushAssignedUnique(exteriorGrid, f)
    else if (kind === 'interior') pushAssignedUnique(interiorGrid, f)
    else if (kind === 'details') pushAssignedUnique(details, f)
  }

  const scoreHero = (name) => score(name, [
    ['premium', 50],
    ['przod', 25],
    ['front', 25],
    ['bok', 18],
    ['profil', 18],
    ['tyl', 14],
    ['rear', 14],
    ['exterior', 14],
  ])

  const scoreExterior = (name) => score(name, [
    ['przod', 18],
    ['front', 18],
    ['bok', 18],
    ['profil', 18],
    ['tyl', 14],
    ['rear', 14],
    ['exterior', 10],
    ['zewnatrz', 16],
  ])

  const scoreInterior = (name) => score(name, [
    ['kokpit', 40],
    ['wnetrz', 35],
    ['wnetrze', 35],
    ['wewnatrz', 35],
    ['interior', 35],
    ['kanap', 28],
    ['dach', 18],
    ['ambient', 18],
    ['wyswietl', 18],
    ['wyświetl', 18],
    ['ekran', 14],
    ['przod wnetrz', 18],
  ])

  const scoreDetails = (name) => score(name, [
    ['detal', 28],
    ['detail', 28],
    ['klamka', 28],
    ['kolo', 28],
    ['koło', 28],
    ['reflekt', 28],
    ['lampa', 24],
    ['ladow', 22],
    ['ładow', 22],
    ['smartfon', 22],
    ['wyswietl', 18],
    ['wyświetl', 18],
    ['ekran', 12],
  ])

  for (const f of all) {
    if (assigned.has(f.name)) continue
    const n = normalize(f.name)
    if (n.includes('premium') || n.includes('przemium')) {
      assigned.add(f.name)
      pushHeroUnique(f)
      continue
    }

    const sExt = scoreExterior(f.name)
    const sInt = scoreInterior(f.name)
    const sDet = scoreDetails(f.name)
    const best = Math.max(sExt, sInt, sDet)

    if (best <= 0) {
      pushAssignedUnique(details, f)
      continue
    }
    if (best === sInt) pushAssignedUnique(interiorGrid, f)
    else if (best === sExt) pushAssignedUnique(exteriorGrid, f)
    else pushAssignedUnique(details, f)
  }

  if (!hero.length) {
    // If user didn't provide premium shots, pick a few strong exterior as hero.
    const exSorted = [...exteriorGrid].sort((a, b) => scoreHero(b.name) - scoreHero(a.name))
    for (const f of exSorted.slice(0, 4)) pushHeroUnique(f)
    if (!hero.length && all.length) pushHeroUnique(all[0])
  }

  return {
    hero,
    exteriorGrid,
    interior: {
      opener: interiorGrid[0] || null,
      grid: interiorGrid,
    },
    details,
    _filenameBased: true,
  }
}

function ensureWarrantyTile(row2, { numericContexts, brand }) {
  const tiles = Array.isArray(row2) ? row2.slice(0, 4) : []
  const tile = buildWarrantyTileFromPdf({ numericContexts, brand })
  while (tiles.length < 4) tiles.push({ value: 'Komfort', subtitle: 'Przemyślane rozwiązania na co dzień.', icon: 'sparkles' })
  tiles[3] = tile
  return tiles
}

function buildRow1NumericTilesFromPdf({ pdfText }) {
  const numericCandidates = extractNumericCandidates(pdfText)
  const numericContexts = buildNumericContexts(pdfText, numericCandidates)
  const scored = numericContexts
    .map((x) => {
      const value = String(x?.value || '').trim()
      const ctx = String(x?.context || '')
      const kind = classifyNumericContext(ctx)
      if (!value || !/\d/.test(value)) return null
      // Exclude large km values entirely: these are almost always warranty / limits, not a key "row1" KPI.
      if (isLargeKmValue(value)) return null
      // Avoid warranty-ish contexts in row1; warranty gets its own tile.
      if (kind === 'warranty') return null
      const scoreByKind = { range: 60, charging: 52, battery: 46, screen: 28, other: 20 }
      const base = scoreByKind[kind] || 18
      const penalty = Math.min(18, Math.max(0, value.length - 12))
      return { value, ctx, kind, score: base - penalty }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)

  const picked = []
  const used = new Set()
  for (const it of scored) {
    if (picked.length >= 4) break
    const key = normalize(it.value).replace(/\s+/g, ' ')
    if (used.has(key)) continue
    used.add(key)
    picked.push(it)
  }

  const iconByKind = { range: 'gauge', charging: 'battery', battery: 'shield', screen: 'sparkles', other: 'zap' }
  const subtitleByKind = {
    range: 'Zasięg dopasowany do codziennych tras.',
    charging: 'Szybkie uzupełnianie energii w trasie.',
    battery: 'Bezpieczna bateria w praktyce (LFP/Blade).',
    screen: 'Czytelne sterowanie funkcjami auta.',
    other: 'Konkretny parametr, realna korzyść.',
  }

  // If we still have <4, fall back to ANY non-warranty numeric contexts.
  if (picked.length < 4) {
    for (const nc of numericContexts) {
      if (picked.length >= 4) break
      const value = String(nc?.value || '').trim()
      if (!value || !/\d/.test(value)) continue
      if (isLargeKmValue(value)) continue
      const kind = classifyNumericContext(String(nc?.context || ''))
      if (kind === 'warranty') continue
      const key = normalize(value).replace(/\s+/g, ' ')
      if (used.has(key)) continue
      used.add(key)
      picked.push({ value, kind })
    }
  }

  const tiles = picked.slice(0, 4).map((it) => {
    const value = normalizeKmSpacing(String(it.value))
    const kind = it.kind || 'other'
    const icon = iconByKind[kind] || 'zap'
    const subtitle = subtitleByKind[kind] || subtitleByKind.other
    return { value, subtitle, icon }
  })

  // Guarantee 4 tiles (even if PDF is extremely poor) with safe, non-hallucinated placeholders.
  while (tiles.length < 4) {
    tiles.push({ value: 'Parametr', subtitle: 'Dane techniczne wg specyfikacji.', icon: 'sparkles' })
  }
  return tiles.slice(0, 4)
}

function hasNonWarrantyNumericKpis({ pdfText }) {
  const numericCandidates = extractNumericCandidates(pdfText)
  const numericContexts = buildNumericContexts(pdfText, numericCandidates)
  for (const nc of numericContexts) {
    const value = String(nc?.value || '').trim()
    if (!value || !/\d/.test(value)) continue
    if (isLargeKmValue(value)) continue
    const kind = classifyNumericContext(String(nc?.context || ''))
    if (kind === 'warranty') continue
    return true
  }
  return false
}

async function generateStrongSidesBoardWithAI({ model, client, brand, carModel, pdfText, media }) {
  if (!client) return null
  const pdfExcerpt = extractPdfRelevantText(pdfText)
  const numericCandidates = extractNumericCandidates(pdfText)
  const numericContexts = buildNumericContexts(pdfText, numericCandidates)
  const images = pickBoardImagesFromMedia(media, `${brand} ${carModel}`)
  if (!images) return null

  const hasNumericKpis = hasNonWarrantyNumericKpis({ pdfText })
  // If PDF doesn't provide real KPIs (common for scanned brochures), don't hallucinate.
  // In that case, row1 becomes qualitative tiles (still fact+benefit, but without digits).
  const row1 = hasNumericKpis ? buildRow1NumericTilesFromPdf({ pdfText }) : null

  const system =
    'Jesteś copywriterem sekcji „Mocne strony” (kafelki). ' +
    'Zwróć 3 kafelki jakościowe bez liczb (żadnych cyfr), styl: fakt + praktyczna korzyść. ' +
    'Krótkie value i subtitle, bez lania wody. Zwróć WYŁĄCZNIE JSON.'

  const userPayload = {
    brand,
    model: carModel,
    pdfText: pdfExcerpt,
    rules: {
      tilesCount: hasNumericKpis ? 3 : 7,
      noDigitsInValueOrSubtitle: true,
      valueMaxChars: 34,
      subtitleMaxChars: 70,
      avoidLongWords: true,
    },
    iconNamesAllowed: ['camera','sparkles','sun','zap','shield','battery','award','gauge','fuel','timer'],
    outputShape: '[{ value: string, subtitle: string, icon: iconName }]',
  }

  let qualitative = null
  try {
    let res
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await client.chat.completions.create({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            {
              role: 'user',
              content:
                'Zwróć JSON: { tiles: [{value,subtitle,icon}] }.\n' +
                '- Dokładnie 3 elementy.\n' +
                '- value i subtitle NIE mogą zawierać cyfr.\n' +
                '- value = krótki fakt (np. "Kamera 360" jest zabroniona, bo cyfra). Użyj np. "Kamery do parkowania".\n' +
                '- subtitle = praktyczna korzyść.\n\n' +
                JSON.stringify(userPayload),
            },
          ],
        })
        break
      } catch (err) {
        const status = err?.status || err?.response?.status
        if (status === 429 && attempt < 2) {
          const wait = parseRetryAfterMs(err)
          console.log(`[generate] OpenAI qualitative tiles rate limited (429); retrying in ${wait}ms`)
          await sleep(wait)
          continue
        }
        throw err
      }
    }
    const jsonText = res?.choices?.[0]?.message?.content
    if (jsonText) {
      const parsed = JSON.parse(jsonText)
      if (Array.isArray(parsed?.tiles)) qualitative = parsed.tiles
    }
  } catch {
    qualitative = null
  }

  const allowedIcons = new Set(['gauge','fuel','timer','camera','sparkles','sun','zap','shield','battery','award'])
  const coerceQual = (t, fallback) => {
    const value = String(t?.value || fallback.value || '').trim()
    const subtitle = String(t?.subtitle || fallback.subtitle || '').trim()
    const icon = allowedIcons.has(t?.icon) ? t.icon : fallback.icon
    const hasDigit = /\d/.test(value + ' ' + subtitle)
    if (!value || !subtitle || hasDigit) return fallback
    return { value, subtitle, icon }
  }

  const fallbackQual = [
    { value: 'Systemy wsparcia', subtitle: 'Mniej stresu w mieście i w trasie.', icon: 'shield' },
    { value: 'Multimedia', subtitle: 'Proste sterowanie funkcjami auta.', icon: 'sparkles' },
    { value: 'Parkowanie', subtitle: 'Łatwiej manewrować w ciasnych miejscach.', icon: 'camera' },
    { value: 'Światła LED', subtitle: 'Lepsza widoczność po zmroku.', icon: 'sparkles' },
    { value: 'Dostęp bez klucza', subtitle: 'Szybciej wsiadasz i ruszasz.', icon: 'zap' },
    { value: 'Komfort kabiny', subtitle: 'Wygodnie w codziennym ruchu.', icon: 'sun' },
    { value: 'Ładowanie telefonu', subtitle: 'Porządek i wygoda w aucie.', icon: 'battery' },
  ]

  const qIn = Array.isArray(qualitative) ? qualitative : []
  const qCount = hasNumericKpis ? 3 : 7
  const qTiles = Array.from({ length: qCount }, (_, i) => coerceQual(qIn[i], fallbackQual[i]))

  const row1Final = hasNumericKpis ? row1 : [qTiles[0], qTiles[1], qTiles[2], qTiles[3]]

  let row2 = hasNumericKpis
    ? [qTiles[0], qTiles[1], qTiles[2], buildWarrantyTileFromPdf({ numericContexts, brand })]
    : [qTiles[4], qTiles[5], qTiles[6], buildWarrantyTileFromPdf({ numericContexts, brand })]

  row2 = ensureWarrantyTile(row2, { numericContexts, brand })

  return {
    intro: 'Najważniejsze parametry i wyposażenie — krótko i konkretnie.',
    images,
    rows: { row1: row1Final, row2, row3: [] },
  }
}

function classifyNumericContext(ctx) {
  const n = normalize(ctx)
  if (n.includes('gwar') || n.includes('warranty') || n.includes('lat') || n.includes('years')) return 'warranty'
  if (n.includes('zasi') || n.includes('range')) return 'range'
  if (n.includes('ladow') || n.includes('charging') || n.includes('dc') || n.includes('ac')) return 'charging'
  if (n.includes('bater') || n.includes('kwh') || n.includes('blade') || n.includes('lfp')) return 'battery'
  if (n.includes('ekran') || n.includes('wyswietl') || n.includes('display') || n.includes('"')) return 'screen'
  return 'other'
}

function isLargeKmValue(text) {
  const s = String(text || '')
  if (!/km/i.test(s)) return false
  const m = s.replace(/\s+/g, '').match(/(\d{4,})km/i)
  if (!m || !m[1]) return false
  const n = Number(m[1])
  return Number.isFinite(n) && n >= 10000
}

function normalizeKmSpacing(text) {
  return String(text || '').replace(/(\d)\s*km\b/gi, '$1 km')
}

function findContextForTileValue(tileValue, numericContexts) {
  const v = String(tileValue || '')
  const vN = normalize(v).replace(/\s+/g, '')
  for (const nc of numericContexts || []) {
    const raw = String(nc?.value || '')
    if (!raw) continue
    if (v.includes(raw)) return nc
    const rawN = normalize(raw).replace(/\s+/g, '')
    if (rawN && vN.includes(rawN)) return nc
  }
  return null
}

function enforceSemanticNumbers(content, { pdfText }) {
  const numericCandidates = extractNumericCandidates(pdfText)
  const numericContexts = buildNumericContexts(pdfText, numericCandidates)

  const board = content?.sections?.strengths?.board
  if (board && board.rows) {
    const fixSubtitle = (tile) => {
      const ctx = findContextForTileValue(tile?.value, numericContexts)
      if (!ctx) return tile
      const kind = classifyNumericContext(ctx.context)
      const sub = String(tile.subtitle || '')
      const subN = normalize(sub)

      if (isLargeKmValue(tile?.value)) {
        // km-limits (150 000 / 250 000) are almost certainly warranty/limit, not driving range.
        return {
          ...tile,
          value: normalizeKmSpacing(tile.value),
          icon: 'award',
          subtitle: 'Limit kilometrów w ramach gwarancji — spokój użytkowania.',
        }
      }

      // Prevent the worst confusion: warranty limits presented as driving range.
      if (kind === 'warranty' && (subN.includes('zasieg') || subN.includes('podroz') || subN.includes('trase'))) {
        return { ...tile, subtitle: 'W ramach gwarancji — spokój użytkowania.' }
      }
      // If it really is range, prefer saying it explicitly.
      if (kind === 'range' && !subN.includes('zasieg')) {
        return { ...tile, subtitle: 'Zasięg dopasowany do codziennych tras.' }
      }
      return tile
    }

    board.rows.row1 = Array.isArray(board.rows.row1) ? board.rows.row1.map(fixSubtitle) : board.rows.row1
    board.rows.row2 = Array.isArray(board.rows.row2) ? board.rows.row2.map(fixSubtitle) : board.rows.row2
    board.rows.row3 = Array.isArray(board.rows.row3) ? board.rows.row3.map(fixSubtitle) : board.rows.row3
  }

  const items = content?.sections?.strengths?.items
  if (Array.isArray(items)) {
    content.sections.strengths.items = items.map((it) => {
      const title = String(it?.title || '')
      const desc = String(it?.desc || '')
      const combined = title + ' ' + desc

      // If item contains a number but we cannot match it to extracted numeric candidates, avoid hallucinating.
      if (/\d/.test(combined) && !containsAnyNumericCandidate(combined, numericCandidates)) {
        return {
          ...it,
          title: 'Szybkie ładowanie',
          desc: 'Wygodne uzupełnianie energii w trasie i na co dzień — bez zbędnego czekania.',
        }
      }

      const ctx = findContextForTileValue(title + ' ' + desc, numericContexts)
      if (!ctx) return it
      const kind = classifyNumericContext(ctx.context)
      if (isLargeKmValue(title + ' ' + desc) && normalize(title).includes('zasieg')) {
        return {
          ...it,
          title: normalizeKmSpacing(title.replace(/zasi[eę]g/gi, 'Gwarancja')),
          desc: 'Limit kilometrów w ramach gwarancji — pewność na lata.',
        }
      }
      if (kind === 'warranty' && normalize(title).includes('zasieg')) {
        const newTitle = title.replace(/zasi[eę]g/gi, 'Gwarancja')
        const newDesc = normalize(desc).includes('podroz') ? 'W ramach gwarancji — większy spokój na lata.' : desc
        return { ...it, title: normalizeKmSpacing(newTitle), desc: newDesc }
      }
      return { ...it, title: normalizeKmSpacing(title), desc }
    })
  }

  return content
}

function addWordBreaks(text, { maxWord = 16, chunk = 8 } = {}) {
  const s = String(text || '')
  // Insert zero-width spaces into overly long "words" so Tailwind line-clamp can wrap them.
  return s.replace(new RegExp(`\\S{${maxWord},}`, 'g'), (word) => {
    const parts = []
    for (let i = 0; i < word.length; i += chunk) parts.push(word.slice(i, i + chunk))
    return parts.join('\u200B')
  })
}

function clampText(text, maxLen) {
  const s = String(text || '').replace(/\s+/g, ' ').trim()
  if (!maxLen || s.length <= maxLen) return addWordBreaks(s)
  return addWordBreaks(s.slice(0, Math.max(0, maxLen - 1)).trimEnd() + '…')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryAfterMs(err) {
  const msg = String(err?.error?.message || err?.message || '')
  const m = msg.match(/try again in\s+(\d+)ms/i)
  if (m && m[1]) {
    const n = Number(m[1])
    if (Number.isFinite(n) && n > 0) return n
  }
  const retryAfter = err?.response?.headers?.['retry-after'] || err?.headers?.['retry-after']
  if (retryAfter) {
    const sec = Number(retryAfter)
    if (Number.isFinite(sec) && sec > 0) return Math.round(sec * 1000)
  }
  return 1200
}

function sanitizeModelPageContentForUi(content) {
  if (!content || typeof content !== 'object') return content
  const c = JSON.parse(JSON.stringify(content))

  if (c.sections?.strengths?.items && Array.isArray(c.sections.strengths.items)) {
    c.sections.strengths.items = c.sections.strengths.items
      .slice(0, 6)
      .map((it) => ({
        title: clampText(it?.title, 42),
        desc: clampText(it?.desc, 160),
      }))
  }

  const board = c.sections?.strengths?.board
  if (board && board.rows) {
    const fixTile = (t) => ({
      ...t,
      value: clampText(t?.value, 34),
      subtitle: clampText(t?.subtitle, 70),
    })
    if (Array.isArray(board.rows.row1)) board.rows.row1 = board.rows.row1.map(fixTile)
    if (Array.isArray(board.rows.row2)) board.rows.row2 = board.rows.row2.map(fixTile)
    if (Array.isArray(board.rows.row3)) board.rows.row3 = board.rows.row3.map(fixTile)
  }

  if (c.sections?.design) {
    c.sections.design.intro = clampText(c.sections.design.intro, 220)
    if (Array.isArray(c.sections.design.bullets)) {
      c.sections.design.bullets = c.sections.design.bullets.slice(0, 6).map((b) => clampText(b, 80))
    }
  }

  if (c.sections?.versions?.intro) c.sections.versions.intro = clampText(c.sections.versions.intro, 220)
  if (c.sections?.specPdf?.intro) c.sections.specPdf.intro = clampText(c.sections.specPdf.intro, 220)
  if (c.sections?.discount?.headline) c.sections.discount.headline = clampText(c.sections.discount.headline, 90)
  if (c.sections?.discount?.body) c.sections.discount.body = clampText(c.sections.discount.body, 220)

  return c
}

function pickUnique(sorted, used, limit) {
  const out = []
  for (const x of sorted) {
    if (out.length >= limit) break
    if (used.has(x.name)) continue
    used.add(x.name)
    out.push(x)
  }
  return out
}

function heuristicMedia(files) {
  const used = new Set()

  const heroSorted = [...files]
    .map((f) => ({ ...f, _score: score(f.name, [
      ['premium', 50],
      ['przod', 25],
      ['front', 25],
      ['bok', 18],
      ['profil', 18],
      ['tyl', 14],
      ['rear', 14],
      ['exterior', 14],
      ['kokpit', -50],
      ['wnetrz', -50],
      ['interior', -50],
      ['kanap', -35],
      ['detail', -20],
      ['detal', -20],
    ]) }))
    .sort((a, b) => b._score - a._score)

  const hero = pickUnique(heroSorted, used, 4)

  const exteriorSorted = [...files]
    .map((f) => ({ ...f, _score: score(f.name, [
      ['premium', 40],
      ['przod', 18],
      ['front', 18],
      ['bok', 18],
      ['profil', 18],
      ['tyl', 14],
      ['rear', 14],
      ['exterior', 10],
      ['kokpit', -40],
      ['wnetrz', -40],
      ['interior', -40],
      ['kanap', -30],
    ]) }))
    .sort((a, b) => b._score - a._score)

  const exteriorGrid = pickUnique(exteriorSorted, used, 4)

  const interiorSorted = [...files]
    .map((f) => ({ ...f, _score: score(f.name, [
      ['kokpit', 40],
      ['wnetrz', 35],
      ['interior', 35],
      ['kanap', 28],
      ['dach', 18],
      ['ambient', 18],
      ['wyswietl', 18],
      ['ekran', 14],
      ['premium', 5],
      ['ladow', -20],
      ['smartfon', -20],
      ['klamka', -20],
      ['kolo', -20],
      ['reflekt', -20],
    ]) }))
    .sort((a, b) => b._score - a._score)

  const opener = pickUnique(interiorSorted, used, 1)[0] || null
  const interiorGrid = pickUnique(interiorSorted, used, 6)

  const detailsSorted = [...files]
    .map((f) => ({ ...f, _score: score(f.name, [
      ['detal', 28],
      ['detail', 28],
      ['klamka', 28],
      ['kolo', 28],
      ['reflekt', 28],
      ['lampa', 24],
      ['ladow', 22],
      ['smartfon', 22],
      ['wyswietl', 18],
      ['ekran', 12],
      ['premium', 6],
    ]) }))
    .sort((a, b) => b._score - a._score)

  const details = pickUnique(detailsSorted, used, 5)

  // fallback: fill any missing slots with remaining files (no repeats here; repeats are handled later)
  const remaining = files.filter((f) => !used.has(f.name))
  while (hero.length < 4 && remaining.length) hero.push(remaining.shift())
  while (exteriorGrid.length < 4 && remaining.length) exteriorGrid.push(remaining.shift())

  return {
    hero,
    exteriorGrid,
    interior: {
      opener: opener || interiorGrid.shift() || files[0] || null,
      grid: interiorGrid,
    },
    details,
  }
}

function toPosixPath(p) {
  return p.split(path.sep).join('/')
}

function encodePathSegments(posixPath) {
  return posixPath
    .split('/')
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join('/')
}

function imagesPublicPrefix(imagesAbsDir) {
  const rel = path.relative(PUBLIC_DIR, imagesAbsDir)
  if (!rel || rel.startsWith('..')) {
    throw new Error(`Images directory must be under /public. Got: ${imagesAbsDir}`)
  }
  return `/${encodePathSegments(toPosixPath(rel))}`
}

function toPublicUrl(publicPrefix, filename) {
  return `${publicPrefix}/${encodeURIComponent(filename)}`
}

function titleFromFilename(filename) {
  const base = filename.replace(path.extname(filename), '')
  return base
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function makeThumbDataUrl(absPath) {
  const buf = await sharp(absPath)
    .rotate()
    .resize({ width: 768, withoutEnlargement: true })
    .jpeg({ quality: 60 })
    .toBuffer()
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

async function extractPdfText(absPdfPath) {
  const normalize = (raw) =>
    String(raw || '')
      // Keep prompt size under control.
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .slice(0, 45000)

  const buf = fs.readFileSync(absPdfPath)

  // pdf-parse has multiple export shapes across versions.
  // - older: function(buffer) -> { text }
  // - newer (in this repo): module exports { PDFParse, VerbosityLevel, ... }
  if (typeof pdfParse === 'function') {
    const data = await pdfParse(buf)
    return normalize(data?.text)
  }

  const PDFParse = pdfParseModule?.PDFParse
  if (typeof PDFParse === 'function') {
    const verbosity = pdfParseModule?.VerbosityLevel?.ERRORS ?? 0
    const parser = new PDFParse({ url: absPdfPath, verbosity })
    try {
      await parser.load()
      const res = await parser.getText()
      return normalize(res?.text)
    } finally {
      try {
        await parser.destroy()
      } catch {
        // ignore
      }
    }
  }

  throw new Error(
    `Unsupported pdf-parse export shape. Got keys: ${Object.keys(pdfParseModule || {}).join(', ')}`
  )
}

function buildPlaceholderContent({ slug, brand, carModel, trims, media, specHref }) {
  const pick = (arr, i) => (arr && arr[i] ? arr[i] : arr && arr[0] ? arr[0] : null)
  const hero0 = pick(media?.hero, 0)
  const hero1 = pick(media?.hero, 1)
  const exterior0 = pick(media?.exteriorGrid, 0) || hero0
  const interior0 = media?.interior?.opener || hero0
  const tech0 = pick(media?.details, 0) || hero1 || hero0

  const safeRecommended = trims?.[1] || trims?.[0] || ''

  return {
    slug,
    brand,
    model: carModel,
    media,
    sections: {
      design: {
        intro: 'Galeria ujęć zewnętrznych, wnętrza i detali.',
        bullets: [],
      },
      strengths: {
        intro: 'Kluczowe przewagi w skrócie — bez marketingowego hałasu.',
        items: [
          { title: 'Komfort na co dzień', desc: 'Dopracowane wnętrze i przemyślana ergonomia.' },
          { title: 'Technologia', desc: 'Nowoczesne multimedia i systemy wsparcia kierowcy.' },
          { title: 'Eksploatacja', desc: 'Wygodne ładowanie i sensowna efektywność w codziennej jeździe.' },
        ],
        board:
          hero0 && exterior0 && interior0 && tech0
            ? {
                intro: 'Wybrane elementy, które najczęściej robią różnicę w odbiorze auta.',
                images: {
                  exterior: { src: exterior0.src, alt: exterior0.alt || 'Ujęcie zewnętrzne' },
                  interior: { src: interior0.src, alt: interior0.alt || 'Wnętrze' },
                  tech: { src: tech0.src, alt: tech0.alt || 'Technologia' },
                },
                rows: {
                  row1: [
                    { value: 'Kompakt', subtitle: 'wygodny w mieście', icon: 'gauge' },
                    { value: 'Bezpieczeństwo', subtitle: 'systemy wsparcia', icon: 'shield' },
                    { value: 'Ładowanie', subtitle: 'wygoda na co dzień', icon: 'battery' },
                    { value: 'Komfort', subtitle: 'cisza i ergonomia', icon: 'sparkles' },
                  ],
                  row2: [
                    { value: 'Multimedia', subtitle: 'czytelny ekran i funkcje', icon: 'sparkles' },
                    { value: 'Kamera', subtitle: 'łatwe parkowanie', icon: 'camera' },
                    { value: 'Przestrzeń', subtitle: 'praktyczne wnętrze', icon: 'sun' },
                    { value: '8 lat', subtitle: 'Gwarancja 8 lat. Limit km wg warunków.', icon: 'award' },
                  ],
                  row3: [],
                },
              }
            : undefined,
      },
      versions: {
        intro: 'Wybierz wariant dopasowany do stylu jazdy.',
        cards:
          trims && trims.length
            ? {
                recommendedTrim: safeRecommended || undefined,
                items: trims.slice(0, 2).map((trim) => ({
                  trim,
                  badge: safeRecommended && trim === safeRecommended ? 'Polecana' : undefined,
                  bullets: [
                    'Najważniejsze elementy wyposażenia',
                    'Pakiet bezpieczeństwa i wsparcia',
                    'Komfort i multimedia',
                    'Dopasowanie pod codzienne potrzeby',
                  ],
                  ctaLabel: 'Zapytaj o ofertę',
                })),
              }
            : undefined,
      },
      specPdf: {
        intro: 'Pełna specyfikacja i wyposażenie w pliku PDF.',
        href: specHref,
        label: 'Pobierz specyfikację (PDF)',
        premium: hero0
          ? {
              backgroundImageSrc: hero0.src,
              description: 'Pełna specyfikacja i wyposażenie w pliku PDF.',
              checklist: ['Wyposażenie i funkcje', 'Dane techniczne', 'Porównanie wersji (jeśli dotyczy)'],
              ctaLabel: 'Pobierz specyfikację (PDF)',
              helperText: 'Pobieranie rozpocznie się automatycznie.',
            }
          : undefined,
      },
      discount: {
        headline: 'Skorzystaj z indywidualnego rabatu',
        body: 'Sprawdź aktualne możliwości rabatowe i finansowanie — przygotujemy konkretną propozycję po krótkiej konsultacji.',
        premium: hero1 || hero0
          ? {
              promoImageSrc: (hero1 || hero0).src,
              benefits: ['Rabat dopasowany do dostępności', 'Szybka wycena i kontakt', 'Wsparcie w finansowaniu'],
              ctaLabel: 'Zapytaj o rabat',
            }
          : undefined,
      },
    },
  }
}

function isValidModelPageContent(x) {
  if (!x || typeof x !== 'object') return false
  if (typeof x.slug !== 'string' || typeof x.brand !== 'string' || typeof x.model !== 'string') return false
  const s = x.sections
  if (!s || typeof s !== 'object') return false
  if (!s.design || typeof s.design.intro !== 'string' || !Array.isArray(s.design.bullets)) return false
  if (!s.strengths || !Array.isArray(s.strengths.items)) return false
  for (const it of s.strengths.items) {
    if (!it || typeof it.title !== 'string' || typeof it.desc !== 'string') return false
  }
  if (!s.versions || typeof s.versions.intro !== 'string') return false
  if (s.versions.cards != null) {
    const c = s.versions.cards
    if (!c || typeof c !== 'object' || !Array.isArray(c.items)) return false
    for (const item of c.items) {
      if (!item || typeof item.trim !== 'string' || !Array.isArray(item.bullets) || typeof item.ctaLabel !== 'string') return false
    }
  }
  if (!s.specPdf || typeof s.specPdf.intro !== 'string' || typeof s.specPdf.href !== 'string' || typeof s.specPdf.label !== 'string') return false
  if (!s.discount || typeof s.discount.headline !== 'string' || typeof s.discount.body !== 'string') return false
  return true
}

function coerceStringArray(value) {
  if (Array.isArray(value)) return value.map((x) => String(x)).filter(Boolean)
  return []
}

function coerceStrengthItems(value) {
  if (!Array.isArray(value)) return null
  const out = []
  for (const item of value) {
    if (item && typeof item === 'object' && typeof item.title === 'string' && typeof item.desc === 'string') {
      out.push({ title: item.title, desc: item.desc })
      continue
    }
    if (typeof item === 'string') {
      const s = item.trim()
      if (!s) continue
      const parts = s.split(/[:\-–—]/)
      const title = (parts[0] || s).trim()
      const desc = (parts.slice(1).join('—') || '').trim() || s
      out.push({ title: title.slice(0, 80), desc: desc.slice(0, 160) })
    }
  }
  return out.length ? out : null
}

function coerceVersionsCards(value, trims) {
  if (!value) return null

  // If already in correct shape.
  if (value && typeof value === 'object' && Array.isArray(value.items)) {
    const recommendedTrim = typeof value.recommendedTrim === 'string' ? value.recommendedTrim : undefined
    const items = value.items
      .map((x) => {
        const trim = String(x.trim || x.title || '').trim()
        const bullets = coerceStringArray(x.bullets)
        const ctaLabel = String(x.ctaLabel || 'Zapytaj o ofertę')
        const badge = x.badge ? String(x.badge) : undefined
        if (!trim || !bullets.length) return null
        return { trim, bullets, ctaLabel, badge }
      })
      .filter(Boolean)
    if (!items.length) return null
    return { recommendedTrim, items }
  }

  // If model returned an array of cards.
  if (Array.isArray(value)) {
    let recommendedTrim
    const items = value
      .map((x) => {
        const trim = String(x.trim || x.title || '').trim()
        const bullets = coerceStringArray(x.bullets)
        const ctaLabel = String(x.ctaLabel || 'Zapytaj o ofertę')
        const isRecommended = Boolean(x.recommendedTrim || x.recommended)
        const badge = x.badge ? String(x.badge) : isRecommended ? 'Polecana' : undefined
        if (isRecommended && trim) recommendedTrim = trim
        if (!trim || !bullets.length) return null
        return { trim, bullets, ctaLabel, badge }
      })
      .filter(Boolean)

    if (!items.length) return null
    // If we still don't have recommended trim, prefer the second trim (often the richer one).
    if (!recommendedTrim && Array.isArray(trims) && trims.length > 1) recommendedTrim = trims[1]
    return { recommendedTrim, items }
  }

  return null
}

function coerceBoard(value, media) {
  const allowedIcons = new Set(['gauge','fuel','timer','camera','sparkles','sun','zap','shield','battery','award'])
  const iconFromText = (value, subtitle) => {
    const t = normalize(`${value || ''} ${subtitle || ''}`)
    if (isLargeKmValue(value)) return 'award'
    if (t.includes('gwar')) return 'award'
    if (t.includes('ladow') || t.includes('charging') || t.includes('dc') || t.includes('ac')) return 'battery'
    if (t.includes('bater') || t.includes('kwh') || t.includes('lfp') || t.includes('blade')) return 'shield'
    if (t.includes('0-100') || t.includes('0–100') || t.includes('przysp') || t.includes('s')) return 'timer'
    if (t.includes('360') || t.includes('kamera') || t.includes('park')) return 'camera'
    if (t.includes('zasieg') || t.includes('km')) return 'gauge'
    if (t.includes('zuzy') || t.includes('l/100') || t.includes('spal')) return 'fuel'
    if (t.includes('ekran') || t.includes('wyswietl') || t.includes('multimedia')) return 'sparkles'
    if (t.includes('dach') || t.includes('swiat') || t.includes('panoram')) return 'sun'
    if (t.includes('moc') || t.includes('w') || t.includes('kw')) return 'zap'
    if (t.includes('adas') || t.includes('bezpiec')) return 'shield'
    return 'sparkles'
  }

  const fixTile = (tile, fallback) => {
    const v = String(tile?.value || fallback?.value || '').trim()
    const s = String(tile?.subtitle || fallback?.subtitle || '').trim()
    const rawIcon = tile?.icon
    const icon = allowedIcons.has(rawIcon) ? rawIcon : iconFromText(v, s)
    return { value: v || 'Komfort', subtitle: s || 'Przemyślane rozwiązania na co dzień.', icon }
  }

  const pickMediaImage = (pref) => {
    const src = pref?.src
    const alt = pref?.alt
    if (typeof src === 'string' && src) return { src, alt: String(alt || '') }
    return null
  }

  const fallbackImages = (() => {
    const hero0 = media?.hero?.[0] || media?.exteriorGrid?.[0]
    const hero1 = media?.hero?.[1] || media?.interior?.opener
    const hero2 = media?.hero?.[2] || media?.details?.[0]
    if (!hero0 || !hero1 || !hero2) return null
    return {
      exterior: { src: hero0.src, alt: hero0.alt || 'Ujęcie zewnętrzne' },
      interior: { src: hero1.src, alt: hero1.alt || 'Wnętrze' },
      tech: { src: hero2.src, alt: hero2.alt || 'Technologia' },
    }
  })()

  const fallbackRows = {
    row1: [
      { value: 'Komfort', subtitle: 'ergonomia i wyciszenie', icon: 'sparkles' },
      { value: 'Bezpieczeństwo', subtitle: 'systemy wsparcia', icon: 'shield' },
      { value: 'Technologie', subtitle: 'funkcje na co dzień', icon: 'zap' },
      { value: 'Miasto', subtitle: 'łatwe parkowanie', icon: 'camera' },
    ],
    row2: [
      { value: 'Ładowanie', subtitle: 'wygoda użytkowania', icon: 'battery' },
      { value: 'Efektywność', subtitle: 'rozsądne zużycie', icon: 'fuel' },
      { value: 'Dynamika', subtitle: 'płynna jazda', icon: 'timer' },
      { value: 'Przestrzeń', subtitle: 'praktyczne wnętrze', icon: 'sun' },
    ],
    row3: [
      { value: 'Gwarancja', subtitle: 'spokój użytkowania', icon: 'award' },
      { value: 'Design', subtitle: 'nowoczesna sylwetka', icon: 'gauge' },
      { value: 'Wyposażenie', subtitle: 'komfort i multimedia', icon: 'sparkles' },
    ],
  }

  // If model returned a board-like object, normalize it.
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const images = {
      exterior: pickMediaImage(value?.images?.exterior) || fallbackImages?.exterior,
      interior: pickMediaImage(value?.images?.interior) || fallbackImages?.interior,
      tech: pickMediaImage(value?.images?.tech) || fallbackImages?.tech,
    }
    if (!images.exterior || !images.interior || !images.tech) return null

    const row1In = Array.isArray(value?.rows?.row1) ? value.rows.row1 : []
    const row2In = Array.isArray(value?.rows?.row2) ? value.rows.row2 : []
    const row3In = Array.isArray(value?.rows?.row3) ? value.rows.row3 : []

    const row1 = Array.from({ length: 4 }, (_, i) => fixTile(row1In[i], fallbackRows.row1[i]))
    const row2 = Array.from({ length: 4 }, (_, i) => fixTile(row2In[i], fallbackRows.row2[i]))
    const row3 = Array.from({ length: 3 }, (_, i) => fixTile(row3In[i], fallbackRows.row3[i]))

    return {
      intro: String(value?.intro || 'Kluczowe liczby i elementy wyposażenia, które realnie przekładają się na komfort.'),
      images,
      rows: { row1, row2, row3 },
    }
  }

  // If model returned a small array of image tiles (common failure mode).
  if (Array.isArray(value)) {
    const hero0 = media?.hero?.[0] || media?.exteriorGrid?.[0]
    const hero1 = media?.hero?.[1] || media?.interior?.opener
    const hero2 = media?.hero?.[2] || media?.details?.[0]
    if (!hero0 || !hero1 || !hero2) return null
    return {
      intro: 'Wybrane elementy, które najczęściej robią różnicę w odbiorze auta.',
      images: {
        exterior: { src: hero0.src, alt: hero0.alt || 'Ujęcie zewnętrzne' },
        interior: { src: hero1.src, alt: hero1.alt || 'Wnętrze' },
        tech: { src: hero2.src, alt: hero2.alt || 'Technologia' },
      },
      rows: {
        row1: [
          { value: 'Komfort', subtitle: 'ergonomia i wyciszenie', icon: 'sparkles' },
          { value: 'Bezpieczeństwo', subtitle: 'systemy wsparcia', icon: 'shield' },
          { value: 'Technologie', subtitle: 'funkcje na co dzień', icon: 'zap' },
          { value: 'Miasto', subtitle: 'łatwe parkowanie', icon: 'camera' },
        ],
        row2: [
          { value: 'Ładowanie', subtitle: 'wygoda użytkowania', icon: 'battery' },
          { value: 'Efektywność', subtitle: 'rozsądne zużycie', icon: 'fuel' },
          { value: 'Dynamika', subtitle: 'płynna jazda', icon: 'timer' },
          { value: 'Przestrzeń', subtitle: 'praktyczne wnętrze', icon: 'sun' },
        ],
        row3: [
          { value: 'Gwarancja', subtitle: 'spokój użytkowania', icon: 'award' },
          { value: 'Design', subtitle: 'nowoczesna sylwetka', icon: 'gauge' },
          { value: 'Wyposażenie', subtitle: 'komfort i multimedia', icon: 'sparkles' },
        ],
      },
    }
  }

  return null
}

function coerceModelPageContent(parsed, ctx) {
  const out = {
    slug: String(parsed?.slug || ctx.slug),
    brand: String(parsed?.brand || ctx.brand),
    model: String(parsed?.model || ctx.carModel),
    media: ctx.media,
    sections: {
      design: {
        intro:
          String(
            parsed?.sections?.design?.intro ||
              parsed?.sections?.design?.description ||
              parsed?.sections?.design?.title ||
              ctx.placeholder.sections.design.intro,
          ),
        bullets:
          Array.isArray(parsed?.sections?.design?.bullets)
            ? coerceStringArray(parsed.sections.design.bullets)
            : coerceStringArray(parsed?.sections?.design?.highlights),
      },
      strengths: {
        intro:
          parsed?.sections?.strengths?.intro && typeof parsed.sections.strengths.intro === 'string'
            ? parsed.sections.strengths.intro
            : ctx.placeholder.sections.strengths.intro,
        items:
          coerceStrengthItems(parsed?.sections?.strengths?.items) ||
          coerceStrengthItems(parsed?.sections?.strengths) ||
          ctx.placeholder.sections.strengths.items,
        board:
          coerceBoard(parsed?.sections?.strengths?.board, ctx.media) ||
          coerceBoard(parsed?.sections?.strengths?.board, parsed?.media) ||
          ctx.placeholder.sections.strengths.board,
      },
      versions: {
        intro:
          String(parsed?.sections?.versions?.intro || parsed?.sections?.versions?.subtitle || ctx.placeholder.sections.versions.intro),
        cards:
          coerceVersionsCards(parsed?.sections?.versions?.cards, ctx.trims) ||
          coerceVersionsCards(parsed?.sections?.versions?.cards, ctx.trims) ||
          ctx.placeholder.sections.versions.cards,
      },
      specPdf: {
        intro: String(parsed?.sections?.specPdf?.intro || ctx.placeholder.sections.specPdf.intro),
        href: String(parsed?.sections?.specPdf?.href || ctx.specHref),
        label: String(parsed?.sections?.specPdf?.label || ctx.placeholder.sections.specPdf.label),
        premium: (() => {
          const p = parsed?.sections?.specPdf?.premium
          if (!p || typeof p !== 'object') return ctx.placeholder.sections.specPdf.premium
          return {
            backgroundImageSrc: String(p.backgroundImageSrc || ctx.placeholder.sections.specPdf.premium?.backgroundImageSrc || ''),
            description: String(p.description || ctx.placeholder.sections.specPdf.premium?.description || ctx.placeholder.sections.specPdf.intro),
            checklist: coerceStringArray(p.checklist).slice(0, 3),
            ctaLabel: String(p.ctaLabel || 'Pobierz specyfikację (PDF)'),
            helperText: String(p.helperText || 'Pobieranie rozpocznie się automatycznie.'),
          }
        })(),
      },
      discount: {
        headline: String(parsed?.sections?.discount?.headline || ctx.placeholder.sections.discount.headline),
        body: String(parsed?.sections?.discount?.body || ctx.placeholder.sections.discount.body),
        premium: (() => {
          const p = parsed?.sections?.discount?.premium
          if (!p || typeof p !== 'object') return ctx.placeholder.sections.discount.premium
          const benefits = coerceStringArray(p.benefits).slice(0, 3)
          return {
            promoImageSrc: String(p.promoImageSrc || ctx.placeholder.sections.discount.premium?.promoImageSrc || ''),
            benefits: benefits.length ? benefits : ctx.placeholder.sections.discount.premium?.benefits || [],
            ctaLabel: String(p.ctaLabel || ctx.placeholder.sections.discount.premium?.ctaLabel || 'Zapytaj o rabat'),
          }
        })(),
      },
    },
  }

  return out
}

function findBestPdfInDir(absDir, { brand, carModel, slug }) {
  if (!exists(absDir)) return null
  const all = fs.readdirSync(absDir).filter((x) => x.toLowerCase().endsWith('.pdf'))
  if (!all.length) return null

  const target = normalize(`${brand} ${carModel}`).replace(/\s+/g, ' ').trim()
  const slugN = normalize(slug)

  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)))
  const tokenise = (s) =>
    uniq(
      normalize(String(s || ''))
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/g)
        .map((t) => t.trim())
        .filter((t) => t && (t.length >= 2 || /^\d+$/.test(t) || /^[a-z]$/.test(t)))
    )

  const brandTokens = tokenise(brand)
  const modelTokens = tokenise(carModel)
  const slugTokens = tokenise(slug.replace(/-/g, ' '))
  const allTokens = uniq([...brandTokens, ...modelTokens, ...slugTokens])
  const nonBrandTokens = uniq([...modelTokens, ...slugTokens]).filter((t) => t && !brandTokens.includes(t))

  let best = null
  let bestScore = -1
  let bestStrong = false
  let bestNonBrandHits = 0
  for (const f of all) {
    const fN = normalize(f)
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const fWords = fN.split(' ').filter(Boolean)
    const hasToken = (t) => {
      if (!t) return false
      if (t.length === 1 && /^[a-z]$/.test(t)) return fWords.includes(t)
      return fN.includes(t)
    }
    let total = 0
    // Strong signals (keep conservative to avoid matching shared brand/model tokens like "seal").
    const strong = fN.includes(target) || fN.includes(slugN)
    if (fN.includes(target)) total += 18
    if (fN.includes(slugN)) total += 14
    for (const t of allTokens) {
      if (!t) continue
      if (!hasToken(t)) continue
      if (brandTokens.includes(t)) total += 5
      else if (modelTokens.includes(t)) total += 6
      else total += 3
    }

    let nonBrandHits = 0
    for (const t of nonBrandTokens) {
      if (!t) continue
      if (hasToken(t)) nonBrandHits += 1
    }

    if (total > bestScore) {
      bestScore = total
      best = f
      bestStrong = strong
      bestNonBrandHits = nonBrandHits
    }
  }

  // Avoid returning a random PDF just because the brand matches.
  if (!best || bestScore < 10) return null
  if (nonBrandTokens.length < 2) {
    // Too ambiguous (e.g. model name "Seal"). Prefer explicit --pdf or a dedicated file.
    return null
  }
  const requiredHits = nonBrandTokens.length >= 3 ? 3 : 2
  if (bestNonBrandHits < requiredHits) return null
  return { absPath: path.join(absDir, best), score: bestScore }
}

function findBestPdfInDirs(absDirs, ctx) {
  let best = null
  for (const absDir of absDirs) {
    const candidate = findBestPdfInDir(absDir, ctx)
    if (!candidate) continue
    if (!best || candidate.score > best.score) best = candidate
  }
  return best
}

function ensurePdfInPublicSpec({ srcAbsPath, slug, overwrite }) {
  const specDir = path.join(ROOT, 'public', 'spec')
  ensureDir(specDir)
  const destAbsPath = path.join(specDir, `${slug}.pdf`)

  if (exists(destAbsPath) && !overwrite) return destAbsPath
  fs.copyFileSync(srcAbsPath, destAbsPath)
  return destAbsPath
}

async function maybeRefineWithVision({ model, client, images, draft }) {
  if (!client) return draft

  // Send a diverse set of thumbnails for grounding + all filenames.
  const wanted = [
    'premium',
    'zewn',
    'exterior',
    'wnetrz',
    'interior',
    'kokpit',
    'deska',
    'bagaz',
    'baga',
    'ladow',
    'charging',
    'przod',
    'front',
    'tyl',
    'rear',
    'swiatl',
    'reflektor',
    'wyswietl',
    'screen',
  ]
  const scored = images
    .map((img) => ({
      img,
      s: score(img.name, wanted.map((w, i) => [w, 30 - Math.min(i, 20)])),
    }))
    .sort((a, b) => b.s - a.s)

  const sample = (() => {
    const picked = []
    const used = new Set()
    for (const it of scored) {
      if (picked.length >= 16) break
      if (used.has(it.img.name)) continue
      used.add(it.img.name)
      picked.push(it.img)
    }
    // Always include a few from the start as a safe fallback.
    for (const it of images.slice(0, 6)) {
      if (picked.length >= 16) break
      if (used.has(it.name)) continue
      used.add(it.name)
      picked.push(it)
    }
    return picked
  })()
  const thumbs = []
  for (const img of sample) {
    try {
      const dataUrl = await makeThumbDataUrl(img.absPath)
      thumbs.push({ name: img.name, dataUrl })
    } catch {
      // ignore thumbnail failures
    }
  }

  const system =
    'Jesteś asystentem, który układa zdjęcia samochodu do sekcji strony. ' +
    'Masz dopasować role zdjęć do kategorii: hero(4), exteriorGrid(4), interior.opener(1), interior.grid(6), details(5). ' +
    'Zwróć WYŁĄCZNIE JSON zgodny z podanym schematem i używaj wyłącznie dostarczonych nazw plików.'

  const userText =
    `Dostępne pliki (nazwy):\n${images.map((x) => `- ${x.name}`).join('\n')}\n\n` +
    `Wstępny (heurystyczny) wybór:\n${JSON.stringify({
      hero: draft.hero.map((x) => x.name),
      exteriorGrid: draft.exteriorGrid.map((x) => x.name),
      interior: { opener: draft.interior.opener?.name, grid: draft.interior.grid.map((x) => x.name) },
      details: draft.details.map((x) => x.name),
    }, null, 2)}\n\n` +
    'Jeśli uważasz, że coś jest źle sklasyfikowane (np. wnętrze vs detale), popraw. ' +
    'Wybierz najlepsze, najbardziej premium ujęcia do hero i zewnętrza.'

  const content = [{ type: 'text', text: userText }]
  for (const t of thumbs) {
    content.push({ type: 'text', text: `Miniatura: ${t.name}` })
    content.push({ type: 'image_url', image_url: { url: t.dataUrl } })
  }

  let res
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await client.chat.completions.create({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content },
          ],
        })
        break
      } catch (err) {
        const status = err?.status || err?.response?.status
        if (status === 429 && attempt < 2) {
          const wait = parseRetryAfterMs(err)
          console.log(`[generate] OpenAI vision rate limited (429); retrying in ${wait}ms`)
          await sleep(wait)
          continue
        }
        throw err
      }
    }
  } catch (err) {
    const status = err?.status || err?.response?.status
    const code = err?.code || err?.error?.code
    const message = err?.error?.message || err?.message
    if (status === 401 || code === 'invalid_api_key') {
      console.log('[generate] OpenAI vision skipped: invalid API key (401)')
    } else {
      console.log('[generate] OpenAI vision skipped due to error')
      console.log(`[generate] status=${status || '-'} code=${code || '-'} message=${message ? String(message).slice(0, 240) : '-'}`)
    }
    return draft
  }

  const jsonText = res?.choices?.[0]?.message?.content
  if (!jsonText) return draft

  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    return draft
  }

  const byName = new Map(images.map((x) => [x.name, x]))
  const pick = (name) => byName.get(name) || null

  const hero = (parsed.hero || []).map(pick).filter(Boolean)
  const exteriorGrid = (parsed.exteriorGrid || []).map(pick).filter(Boolean)
  const interiorOpener = pick(parsed?.interior?.opener)
  const interiorGrid = (parsed?.interior?.grid || []).map(pick).filter(Boolean)
  const details = (parsed.details || []).map(pick).filter(Boolean)

  if (hero.length >= 3) {
    return {
      hero: hero.slice(0, 4),
      exteriorGrid: exteriorGrid.slice(0, 4),
      interior: {
        opener: interiorOpener || draft.interior.opener,
        grid: interiorGrid.slice(0, 6),
      },
      details: details.slice(0, 5),
    }
  }

  return draft
}

async function generateContentWithAI({ model, client, slug, brand, carModel, trims, pdfText, media, specHref, imagesDirName, imageFiles }) {
  if (!client) {
    return buildPlaceholderContent({ slug, brand, carModel, trims, media, specHref })
  }

  const numericCandidates = extractNumericCandidates(pdfText)
  const pdfExcerpt = extractPdfRelevantText(pdfText)
  const numericContexts = buildNumericContexts(pdfText, numericCandidates)

  const availableImages = imageFiles.map((x) => ({
    filename: x.name,
    url: toPublicUrl(imagesDirName, x.name),
  }))

  const system =
    'Jesteś marketingowym asystentem strony ofertowej samochodów. ' +
    'Twoim zadaniem jest wygenerować JSON content dla strony modelu. ' +
    'Pisz w stylu: fakt + praktyczna korzyść (bez lania wody). ' +
    'Jeśli podajesz twardą liczbę, MUSI wynikać z treści PDF (nie zgaduj). ' +
    'Teksty mają mieścić się w kafelkach: krótkie, konkretne, bez bardzo długich słów. ' +
    'Zwróć WYŁĄCZNIE poprawny JSON. Bez markdown.'

  const user = {
    slug,
    brand,
    model: carModel,
    trims,
    specHref,
    hasPdfText: Boolean(String(pdfText || '').trim()),
    pdfText: pdfExcerpt,
    pdfTextNote: 'Wyciąg z PDF (linie z liczbami/kluczowymi frazami), nie pełny tekst.',
    numericCandidates,
    numericContexts,
    mediaDraft: media,
    availableImages,
    iconNamesAllowed: ['gauge','fuel','timer','camera','sparkles','sun','zap','shield','battery','award'],
    requirements: {
      strengths: {
        wantMixNumbersAndMarketing: true,
        tileCopyStyle: {
          titleMaxChars: 42,
          descMaxChars: 160,
          avoidVeryLongWords: true,
        },
        boardCopyStyle: {
          valueMaxChars: 34,
          subtitleMaxChars: 70,
          preferNumbersWhenPdfAvailable: true,
          atLeastTilesWithNumbers: 4,
        },
        boardLayout: {
          row1Count: 4,
          row2Count: 4,
          row3Count: 0,
          images: 3,
        },
        typographyNotes: {
          valueMaxLines: 2,
          subtitleMaxLines: 2,
        },
      },
      pdfPremium: {
        checklistCount: 3,
      },
      discountPremium: {
        benefitsCount: 3,
      },
    },
  }

  let res
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await client.chat.completions.create({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            {
              role: 'user',
              content:
                'Wygeneruj obiekt zgodny z typem ModelPageContent z pliku src/lib/modelPageContent.ts.\n' +
                'Zwróć WYŁĄCZNIE JSON (bez markdown), dokładnie z tymi polami i kształtami: \n' +
                '{\n' +
                '  slug: string, brand: string, model: string,\n' +
                '  media: { hero: [{src,alt}]x4, exteriorGrid: [{src,alt}]x4, interior: { opener:{src,alt}, grid:[{src,alt}]x6 }, details:[{src,alt}]x5 },\n' +
                '  sections: {\n' +
                '    design: { intro: string, bullets: string[] },\n' +
                '    strengths: { intro?: string, items: [{ title: string, desc: string }], board?: { intro: string, images:{ exterior:{src,alt}, interior:{src,alt}, tech:{src,alt} }, rows:{ row1:[{value,subtitle,icon}]x4, row2:[...]x4, row3:[...]x3 } } },\n' +
                '    versions: { intro: string, cards?: { recommendedTrim?: string, items: [{ trim: string, badge?: string, bullets: string[], ctaLabel: string }] } },\n' +
                '    specPdf: { intro: string, href: string, label: string, premium?: { backgroundImageSrc: string, description: string, checklist: string[], ctaLabel: string, helperText: string } },\n' +
                '    discount: { headline: string, body: string, premium?: { promoImageSrc: string, benefits: string[], ctaLabel: string } }\n' +
                '  }\n' +
                '}\n\n' +
                'Zasady:\n' +
                '- W `media` używaj WYŁĄCZNIE url z availableImages (mogą być z /grafiki/... lub /cars/...).\n' +
                '- Jeśli hasPdfText=false, NIE podawaj żadnych konkretnych liczb (zasięg, minuty ładowania itp.) — opisuj ogólnie.\n' +
                '- Jeśli hasPdfText=true, wszystkie liczby w `strengths` muszą pochodzić z numericCandidates (kopiuj dokładnie) i pasować do kontekstu z numericContexts.\n' +
                '- Minimum 2–3 konkretne liczby w sekcji mocne strony.\n' +
                '- Sekcja `strengths.board` ma być „konkret + korzyść”: value = liczba/krótki fakt, subtitle = krótka korzyść (2 linie).\n' +
                '- Unikaj długich słów (mogą się ucinać w line-clamp). Stosuj proste sformułowania.\n' +
                '- `versions.cards` to OBIEKT z polem `items` (a nie tablica). Używaj pola `trim` (nie `title`).\n' +
                '- Dla `strengths.items` zawsze tablica obiektów {title, desc} (nie stringi).\n\n' +
                JSON.stringify(user),
            },
          ],
        })
        break
      } catch (err) {
        const status = err?.status || err?.response?.status
        if (status === 429 && attempt < 2) {
          const wait = parseRetryAfterMs(err)
          console.log(`[generate] OpenAI text rate limited (429); retrying in ${wait}ms`)
          await sleep(wait)
          continue
        }
        throw err
      }
    }
  } catch (err) {
    const status = err?.status || err?.response?.status
    const code = err?.code || err?.error?.code
    const message = err?.error?.message || err?.message
    if (status === 401 || code === 'invalid_api_key') {
      console.log('[generate] OpenAI text skipped: invalid API key (401)')
    } else {
      console.log('[generate] OpenAI text skipped due to error')
      console.log(`[generate] status=${status || '-'} code=${code || '-'} message=${message ? String(message).slice(0, 240) : '-'}`)
    }
    // fallback to placeholder content
    return generateContentWithAI({
      model,
      client: null,
      slug,
      brand,
      carModel,
      trims,
      pdfText,
      media,
      specHref,
      imagesDirName,
      imageFiles,
    })
  }

  const jsonText = res?.choices?.[0]?.message?.content
  if (!jsonText) {
    console.log('[generate] OpenAI returned empty content; using fallback')
    return generateContentWithAI({
      model,
      client: null,
      slug,
      brand,
      carModel,
      trims,
      pdfText,
      media,
      specHref,
      imagesDirName,
      imageFiles,
    })
  }

  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    console.log('[generate] OpenAI returned invalid JSON; using fallback')
    return buildPlaceholderContent({ slug, brand, carModel, trims, media, specHref })
  }

  if (!isValidModelPageContent(parsed)) {
    console.log('[generate] OpenAI returned JSON with invalid shape; will attempt normalization')
    return parsed
  }

  return parsed
}

function buildGeneratedIndexTs(jsonFiles) {
  const lines = []
  lines.push("import type { ModelPageContent } from '@/lib/modelPageContent'")

  for (const file of jsonFiles) {
    const varName = file
      .replace(/\.json$/i, '')
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => String(c).toUpperCase())
      .replace(/^[^a-zA-Z]+/, '')
    lines.push(`import ${varName} from './${file}'`)
  }

  lines.push('')
  lines.push('export const generatedBySlug: Record<string, ModelPageContent> = {')
  for (const file of jsonFiles) {
    const slug = file.replace(/\.json$/i, '')
    const varName = file
      .replace(/\.json$/i, '')
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => String(c).toUpperCase())
      .replace(/^[^a-zA-Z]+/, '')
    lines.push(`  '${slug}': ${varName} as ModelPageContent,`)
  }
  lines.push('}')
  lines.push('')

  return lines.join('\n')
}

async function main() {
  const args = parseArgs(process.argv)

  // Ensure OPENAI_API_KEY can come from .env when running as a standalone Node script.
  loadDotEnvFiles()

  if (args.checkKey) {
    const openaiKey = loadOpenAIKey(args)
    console.log(`[generate] openai=${openaiKey ? 'enabled' : 'disabled'}`)
    process.exit(openaiKey ? 0 : 1)
  }

  if (args.checkAuth) {
    const openaiKey = args.noOpenAI ? '' : loadOpenAIKey(args)
    if (!openaiKey) {
      console.log('[generate] openai auth: missing key')
      process.exitCode = 1
      return
    }

    const client = new OpenAI({ apiKey: openaiKey })
    try {
      // Minimal auth probe. Any successful response implies the key is valid.
      await client.models.list()
      console.log('[generate] openai auth: OK')
      process.exitCode = 0
      return
    } catch (err) {
      const status = err?.status || err?.response?.status
      const code = err?.code || err?.error?.code
      const message = err?.error?.message || err?.message
      console.log(`[generate] openai auth: FAILED${status ? ` (${status})` : ''}${code ? ` ${code}` : ''}`)
      if (message) console.log(`[generate] message: ${String(message).slice(0, 200)}`)
      process.exitCode = 1
      return
    }
  }

  if (args.listSlugs || args['list-slugs']) {
    const inventoryPath = path.join(ROOT, 'src', 'data', 'inventory.json')
    const inventory = readJson(inventoryPath)
    if (!Array.isArray(inventory)) {
      console.error(`[generate] inventory is not an array: ${inventoryPath}`)
      process.exitCode = 1
      return
    }

    const normalizeSlugPart = (v) =>
      normalize(v)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    function modelGroupSlug(brand, model) {
      const b = normalizeSlugPart(brand)
      const m = normalizeSlugPart(model)
      return [b, m].filter(Boolean).join('-')
    }

    const bySlug = new Map()
    for (const item of inventory) {
      if (!item || typeof item !== 'object') continue
      if (String(item.availability || '') !== 'IN_STOCK') continue
      const slug = modelGroupSlug(item.brand, item.model)
      if (!slug) continue
      const existing = bySlug.get(slug)
      if (!existing) {
        bySlug.set(slug, {
          slug,
          brand: String(item.brand || ''),
          model: String(item.model || ''),
          trims: new Set([String(item.trim || '')].filter(Boolean)),
          availableCount: 1,
          minGross: typeof item.ourPriceGross === 'number' && item.ourPriceGross > 0 ? item.ourPriceGross : null,
        })
        continue
      }

      existing.availableCount += 1
      if (item.trim) existing.trims.add(String(item.trim))
      if (typeof item.ourPriceGross === 'number' && item.ourPriceGross > 0) {
        existing.minGross = existing.minGross === null ? item.ourPriceGross : Math.min(existing.minGross, item.ourPriceGross)
      }
    }

    const rows = Array.from(bySlug.values()).sort((a, b) => {
      const brand = String(a.brand).localeCompare(String(b.brand), 'pl')
      if (brand) return brand
      const model = String(a.model).localeCompare(String(b.model), 'pl')
      if (model) return model
      return String(a.slug).localeCompare(String(b.slug), 'pl')
    })

    const publicSpecDir = path.join(ROOT, 'public', 'spec')
    console.log('slug\tbrand\tmodel\ttrims\tavailable\tminGross\tgenerated\timagesDir\tpdf')
    for (const r of rows) {
      const generatedAbs = path.join(ROOT, 'src', 'generated', 'models', `${r.slug}.json`)
      const hasGenerated = exists(generatedAbs)

      const imagesAbs = findBestImagesDirInGrafiki({ slug: r.slug, brand: r.brand, carModel: r.model })
      const imagesDir = imagesAbs ? path.basename(imagesAbs) : ''

      const bestPdf = findBestPdfInDir(publicSpecDir, { slug: r.slug, brand: r.brand, carModel: r.model })
      const pdfName = bestPdf ? path.basename(bestPdf.absPath) : ''

      const trims = Array.from(r.trims.values()).filter(Boolean).sort((x, y) => x.localeCompare(y, 'pl'))
      console.log(
        [
          r.slug,
          r.brand,
          r.model,
          trims.join(', '),
          String(r.availableCount),
          r.minGross === null ? '' : String(r.minGross),
          hasGenerated ? 'yes' : 'no',
          imagesDir,
          pdfName,
        ].join('\t'),
      )
    }

    if (!rows.length) {
      console.log('[generate] (no IN_STOCK models found in inventory)')
    } else {
      console.log('\n[generate] Tip: use e.g. `npm run generate:model -- --slug <slug>`')
    }
    process.exitCode = 0
    return
  }

  const slug = String(args.slug || '').trim()
  if (!slug) {
    console.error('Missing --slug')
    process.exit(1)
  }

  const allowMissingPdf = Boolean(args.allowMissingPdf)

  const inventoryPath = path.join(ROOT, 'src', 'data', 'inventory.json')
  const inventory = readJson(inventoryPath)

  // Find brand/model/trims for slug.
  const normalizeSlugPart = (v) =>
    normalize(v)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  function modelGroupSlug(brand, model) {
    const b = normalizeSlugPart(brand)
    const m = normalizeSlugPart(model)
    return [b, m].filter(Boolean).join('-')
  }

  const items = inventory.filter((x) => modelGroupSlug(x.brand, x.model) === slug)
  if (!items.length) {
    console.error(`No inventory items for slug: ${slug}`)
    process.exit(1)
  }

  const brand = items[0].brand
  const carModel = items[0].model
  const trims = [...new Set(items.map((x) => x.trim).filter(Boolean))]

  const imagesDirArg = args.imagesDir ? String(args.imagesDir) : null
  let imagesAbsDir = imagesDirArg
    ? path.resolve(ROOT, imagesDirArg)
    : path.join(ROOT, 'public', 'grafiki', slug)

  // If the conventional public/grafiki/<slug>/ folder is missing, try to find the best match
  // among all folders in public/grafiki (users often name folders with spaces / brand names).
  if (!imagesDirArg && !exists(imagesAbsDir)) {
    const best = findBestImagesDirInGrafiki({ slug, brand, carModel })
    if (best) imagesAbsDir = best
  }

  if (!exists(imagesAbsDir)) {
    // Convenience fallback for early experiments.
    const carsDir = path.join(ROOT, 'public', 'cars')
    if (exists(carsDir)) {
      const allCars = listFiles(carsDir)
      const modelNeedle = normalize(carModel)
      const slugNeedle = normalize(slug.replace(/-/g, ' '))
      const filtered = allCars.filter((x) => {
        const n = normalize(x.name)
        return n.includes(modelNeedle) || n.includes(slugNeedle)
      })

      if (filtered.length) {
        console.log(`[generate] images dir not found; using filtered public/cars (${filtered.length} images)`) 
        imagesAbsDir = carsDir
      } else {
        console.error(`Images dir not found: ${imagesAbsDir}`)
        console.error('Tip: create public/grafiki/<slug>/ (or any folder under public/grafiki matching the model name), or pass --imagesDir')
        process.exit(1)
      }
    } else {
      console.error(`Images dir not found: ${imagesAbsDir}`)
      console.error('Tip: create public/grafiki/<slug>/ (or any folder under public/grafiki matching the model name), or pass --imagesDir')
      process.exit(1)
    }
  }

  const allImageFiles = listFiles(imagesAbsDir)
  const imageFiles = imagesAbsDir.endsWith(path.join('public', 'cars'))
    ? allImageFiles.filter((x) => {
        const n = normalize(x.name)
        return n.includes(normalize(carModel)) || n.includes(normalize(slug.replace(/-/g, ' ')))
      })
    : allImageFiles

  if (!imageFiles.length) {
    console.error(`No images found in: ${imagesAbsDir}`)
    process.exit(1)
  }

  const publicPrefix = imagesPublicPrefix(imagesAbsDir)

  const pdfArg = args.pdf ? String(args.pdf) : null
  const defaultPdf = path.join(ROOT, 'public', 'spec', `${slug}.pdf`)
  let pdfAbsPath = pdfArg ? path.resolve(ROOT, pdfArg) : defaultPdf

  // If default public/spec/<slug>.pdf is missing, try to find a matching PDF
  // in other known locations (e.g. "Karty katalogowe") and optionally copy it into public/spec.
  if (!exists(pdfAbsPath)) {
    const best = findBestPdfInDirs(
      [
        path.join(ROOT, 'public', 'spec'),
        path.join(ROOT, 'Karty katalogowe'),
      ],
      { brand, carModel, slug },
    )

    const found = best?.absPath
    if (found) {
      const underPublicSpec = path.relative(path.join(ROOT, 'public', 'spec'), found)
      const isUnderSpec = underPublicSpec && !underPublicSpec.startsWith('..')
      const shouldCopy = !args.noCopyPdf && !isUnderSpec
      const overwrite = Boolean(args.overwritePdf)

      if (shouldCopy) {
        const copied = ensurePdfInPublicSpec({ srcAbsPath: found, slug, overwrite })
        console.log(`[generate] copied PDF to public/spec/${slug}.pdf`)
        pdfAbsPath = copied
      } else {
        pdfAbsPath = found
      }
    }
  }

  if (!exists(pdfAbsPath)) {
    // keep going; handled below (optionally allowed)
  }

  let specHref
  if (exists(pdfAbsPath)) {
    // Prefer stable href matching the copied name if present.
    const specDir = path.join(ROOT, 'public', 'spec')
    const rel = path.relative(specDir, pdfAbsPath)
    const isUnderSpec = rel && !rel.startsWith('..')
    specHref = isUnderSpec ? `/spec/${toPosixPath(rel)}` : `/spec/${slug}.pdf`
  } else {
    specHref = `/spec/${slug}.pdf`
    if (!allowMissingPdf) {
      console.error(`PDF not found: ${pdfAbsPath}`)
      console.error('Tip: put PDF in public/spec/<slug>.pdf or pass --pdf (or pass --allowMissingPdf to generate placeholders)')
      process.exit(1)
    }
    console.log('[generate] WARNING: PDF missing; generating placeholder copy')
  }

  const openaiKey = args.noOpenAI ? '' : loadOpenAIKey(args)
  const client = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null
  const model = String(args.model || process.env.OPENAI_MODEL || 'gpt-4o-mini')
  // PDF file_search uses the Responses API + structured outputs. Some lightweight models may return empty output.
  // Allow overriding separately to keep cost/perf knobs independent.
  const pdfModel = String(args.pdfModel || process.env.OPENAI_PDF_MODEL || 'gpt-5.2')

  console.log(`[generate] slug=${slug}`)
  console.log(`[generate] brand=${brand} model=${carModel}`)
  console.log(`[generate] images=${imageFiles.length} dir=${imagesAbsDir} publicPrefix=${publicPrefix}`)
  console.log(`[generate] pdf=${exists(pdfAbsPath) ? pdfAbsPath : '(missing)'}`)
  console.log(
    `[generate] openai=${client ? 'enabled' : 'disabled (set OPENAI_API_KEY or create secret/secret.txt/Secret.txt)'}`,
  )
  if (client && exists(pdfAbsPath)) {
    console.log(`[generate] pdfModel=${pdfModel}`)
  }

  const byName = filenameMedia(imageFiles)
  const useFilenameMedia = Boolean(byName)
  const draft = byName || heuristicMedia(imageFiles)
  const refined = byName ? byName : await maybeRefineWithVision({ model, client, images: imageFiles, draft })

  const pickOrFallback = (primary, fallback) => {
    const p = (primary || []).filter(Boolean)
    if (p.length) return p
    const f = (fallback || []).filter(Boolean)
    return f
  }

  // Variable counts: use exactly what exists in each section.
  // If we can categorize by filename, avoid cross-category fallbacks (prevents leaks like premium -> detale).
  const heroFiles = useFilenameMedia ? (refined.hero || []) : pickOrFallback(refined.hero, imageFiles)
  const exteriorFiles = useFilenameMedia ? (refined.exteriorGrid || []) : pickOrFallback(refined.exteriorGrid, heroFiles)
  const interiorGridFiles = useFilenameMedia ? (refined.interior?.grid || []) : pickOrFallback(refined.interior?.grid, heroFiles)
  const detailsFiles = useFilenameMedia ? (refined.details || []) : pickOrFallback(refined.details, heroFiles)
  const interiorOpenerFile =
    refined.interior?.opener || interiorGridFiles[0] || heroFiles[0] || exteriorFiles[0] || detailsFiles[0] || imageFiles[0]

  const media = {
    hero: heroFiles.map((x) => ({ src: toPublicUrl(publicPrefix, x.name), alt: titleFromFilename(x.name) })),
    exteriorGrid: exteriorFiles.map((x) => ({ src: toPublicUrl(publicPrefix, x.name), alt: titleFromFilename(x.name) })),
    interior: {
      opener: { src: toPublicUrl(publicPrefix, interiorOpenerFile.name), alt: titleFromFilename(interiorOpenerFile.name) },
      grid: interiorGridFiles.map((x) => ({ src: toPublicUrl(publicPrefix, x.name), alt: titleFromFilename(x.name) })),
    },
    details: detailsFiles.map((x) => ({ src: toPublicUrl(publicPrefix, x.name), alt: titleFromFilename(x.name) })),
  }

  const pdfText = exists(pdfAbsPath) ? await extractPdfText(pdfAbsPath) : ''

  const placeholder = buildPlaceholderContent({ slug, brand, carModel, trims, media, specHref })
  const usePdfFileSearchOverrides = Boolean(client && exists(pdfAbsPath))
  const content = usePdfFileSearchOverrides
    ? placeholder
    : await generateContentWithAI({
        model,
        client,
        slug,
        brand,
        carModel,
        trims,
        pdfText,
        media,
        specHref,
        imagesDirName: publicPrefix,
        imageFiles,
      })

  const normalized = (() => {
    // If OpenAI returned slightly different structure, try to coerce it to our schema.
    const coerced = coerceModelPageContent(content, {
      slug,
      brand,
      carModel,
      trims,
      specHref,
      media,
      placeholder,
    })
    return isValidModelPageContent(coerced) ? coerced : placeholder
  })()

  // PDF-driven per-section overrides (full document via file_search).
  // This makes each section configurable by targeted prompts instead of a single monolithic prompt.
  let fileSearchNumericExtraText = ''
  if (client && exists(pdfAbsPath)) {
    try {
      const pdfOverrides = await withPdfVectorStore({ client, pdfAbsPath }, async ({ vectorStoreId }) => {
        return await generateSectionsFromPdfFileSearch({
          client,
          model: pdfModel,
          vectorStoreId,
          brand,
          carModel,
        })
      })

      if (pdfOverrides?.design && normalized?.sections?.design) {
        normalized.sections.design.intro = pdfOverrides.design.intro
        normalized.sections.design.bullets = pdfOverrides.design.bullets
      }

      if (pdfOverrides?.strengthsItems && normalized?.sections?.strengths) {
        normalized.sections.strengths.intro = pdfOverrides.strengthsItems.intro
        normalized.sections.strengths.items = cleanStrengthItems(pdfOverrides.strengthsItems.items)
      }

      if (pdfOverrides?.strengthsBoard && normalized?.sections?.strengths) {
        const images = pickBoardImagesFromMedia(media, slug)
        const tilesRaw = Array.isArray(pdfOverrides.strengthsBoard.tiles) ? pdfOverrides.strengthsBoard.tiles : []
        const tiles = tilesRaw.map((t) => cleanBoardTile(t))
        if (images && tiles.length === 8) {
          const isWarranty = (t) => {
            const valueN = normalize(String(t?.value || '')).replace(/\s+/g, ' ').trim()
            const subN = normalize(String(t?.subtitle || '')).replace(/\s+/g, ' ').trim()
            if (valueN === '8 lat') return true
            if (t?.icon === 'award' && (subN.includes('gwar') || subN.includes('km') || subN.includes('lat'))) return true
            return false
          }

          const warrantyFromTiles = tiles.find(isWarranty) || null
          const otherTiles = tiles.filter((t) => !isWarranty(t))

          const numericCandidates = extractNumericCandidates(pdfText)
          const numericContexts = buildNumericContexts(pdfText, numericCandidates)
          const warrantyTile = cleanBoardTile(warrantyFromTiles || buildWarrantyTileFromPdf({ numericContexts, brand }))

          const row1 = otherTiles.slice(0, 4).map((t) => cleanBoardTile(t))
          let row2 = otherTiles.slice(4, 7)
          row2 = row2.map((t) => cleanBoardTile(t))
          row2.push(warrantyTile)
          row2 = ensureWarrantyTile(row2, { numericContexts, brand })
          row2 = row2.map((t) => cleanBoardTile(t))
          normalized.sections.strengths.board = {
            intro: pdfOverrides.strengthsBoard.intro,
            images,
            rows: { row1, row2, row3: [] },
          }
          fileSearchNumericExtraText = String(pdfOverrides.strengthsBoardFileSearchText || '')
        }
      }
    } catch (err) {
      const status = err?.status || err?.response?.status
      const code = err?.code || err?.error?.code
      const message = err?.error?.message || err?.message
      if (status === 401 || code === 'invalid_api_key') {
        console.log('[generate] OpenAI file_search skipped: invalid API key (401)')
      } else {
        console.log('[generate] OpenAI file_search overrides skipped due to error')
        console.log(`[generate] status=${status || '-'} code=${code || '-'} message=${message ? String(message).slice(0, 240) : '-'}`)
      }
    }
  }

  // Generate the StrongSides board separately (tighter prompt => better consistency).
  // This also enforces the 8-tile layout (row1=4 numeric, row2=4 incl. warranty, row3=[])
  // without changing any UI components.
  // If file_search already produced a board, keep it.
  if (client && String(pdfText || '').trim() && !normalized?.sections?.strengths?.board) {
    const board = await generateStrongSidesBoardWithAI({
      model,
      client,
      brand,
      carModel,
      pdfText,
      media,
    })
    if (board) {
      if (!normalized.sections.strengths) normalized.sections.strengths = { items: [], intro: '' }
      normalized.sections.strengths.board = board
    }
  }

  enforceSemanticNumbers(normalized, { pdfText })

  // Final guard: ensure strengths list always has 3 unique items.
  // enforceSemanticNumbers() may replace multiple items with the same safe fallback.
  if (normalized?.sections?.strengths?.items) {
    normalized.sections.strengths.items = cleanStrengthItems(normalized.sections.strengths.items)
  }

  // Guard against hallucinated numbers: keep only numeric tiles that reference extracted candidates.
  if (normalized?.sections?.strengths?.board) {
    const candidates = extractNumericCandidates(pdfText)
    // If we used file_search, include candidates from the retrieved snippets too.
    if (String(fileSearchNumericExtraText || '').trim()) {
      const extra = extractNumericCandidates(fileSearchNumericExtraText)
      for (const v of extra) candidates.push(v)
    }
    // User preference: show warranty as "8 lat" for BYD (keep it from being stripped by numeric gating).
    if (normalize(brand).includes('byd')) {
      const has = candidates.some((x) => normalize(String(x || '')).replace(/\s+/g, ' ') === '8 lat')
      if (!has) candidates.unshift('8 lat')
    }
    normalized.sections.strengths.board = enforceBoardNumericCandidates(normalized.sections.strengths.board, candidates)
  }

  const sanitized = sanitizeModelPageContentForUi(normalized)

  const outDir = path.join(ROOT, 'src', 'generated', 'models')
  ensureDir(outDir)

  const jsonPath = path.join(outDir, `${slug}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(sanitized, null, 2) + '\n', 'utf8')

  const jsonFiles = fs
    .readdirSync(outDir)
    .filter((f) => f.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.localeCompare(b, 'en'))

  const indexPath = path.join(outDir, 'index.ts')
  fs.writeFileSync(indexPath, buildGeneratedIndexTs(jsonFiles), 'utf8')

  console.log(`[generate] wrote ${path.relative(ROOT, jsonPath)}`)
  console.log(`[generate] updated ${path.relative(ROOT, indexPath)}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
