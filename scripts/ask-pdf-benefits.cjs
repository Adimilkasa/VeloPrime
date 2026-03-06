/*
  Ask OpenAI for 8 marketing benefits grounded in a PDF.

  Usage:
    node scripts/ask-pdf-benefits.cjs --pdf public/spec/byd-dolphin-surf.pdf

  Env:
    OPENAI_API_KEY=...
    OPENAI_MODEL=gpt-4o-mini (optional)
*/

const fs = require('fs')
const path = require('path')
const pdfParseModule = require('pdf-parse')
const OpenAI = require('openai')

const { PDFParse, VerbosityLevel } = pdfParseModule

const ROOT = path.resolve(__dirname, '..')

function exists(absPath) {
  try {
    fs.accessSync(absPath)
    return true
  } catch {
    return false
  }
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

async function extractPdfText(absPdfPath) {
  if (!PDFParse) {
    throw new Error('pdf-parse: missing PDFParse export')
  }
  const verbosity = VerbosityLevel?.ERRORS ?? 0
  const parser = new PDFParse({ url: absPdfPath, verbosity })
  try {
    await parser.load()
    const res = await parser.getText()
    return String(res?.text || '')
  } finally {
    try {
      await parser.destroy()
    } catch {
      // ignore
    }
  }
}

function extractPdfRelevantText(pdfText) {
  const text = String(pdfText || '')
  if (!text.trim()) return ''

  const keywords = [
    'gwar',
    'adas',
    'bezpiec',
    'blade',
    'lfp',
    'nfc',
    'kamera',
    'led',
    'ladow',
    'ekran',
    'multimedia',
    'komfort',
    'wnetrz',
    'design',
  ]

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const picked = []
  const seen = new Set()
  for (const line of lines) {
    const n = normalize(line)
    const hit = keywords.some((k) => n.includes(k)) || /\d/.test(n)
    if (!hit) continue
    const key = n
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(line)
    if (picked.length >= 140) break
  }

  return picked.join('\n')
}

async function main() {
  const args = parseArgs(process.argv)
  const pdfRel = String(args.pdf || 'public/spec/byd-dolphin-surf.pdf')
  const pdfAbs = path.isAbsolute(pdfRel) ? pdfRel : path.resolve(ROOT, pdfRel)

  if (!exists(pdfAbs)) {
    console.error('PDF not found:', pdfAbs)
    process.exitCode = 1
    return
  }

  const apiKey = String(process.env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY')
    process.exitCode = 1
    return
  }

  const model = String(process.env.OPENAI_MODEL || 'gpt-4o-mini')
  const client = new OpenAI({ apiKey })

  const pdfTextRaw = await extractPdfText(pdfAbs)
  const pdfExcerpt = extractPdfRelevantText(pdfTextRaw)

  const system =
    'Jesteś copywriterem oferty samochodów. ' +
    'Twoim zadaniem jest wypisać 8 marketingowych korzyści (fakt + praktyczna korzyść), ' +
    'krótko, konkretnie, bez lania wody. ' +
    'Nie wymyślaj liczb ani parametrów, jeśli nie ma ich w treści PDF. ' +
    'Zwróć WYŁĄCZNIE JSON.'

  const user = {
    task: 'Wymień 8 marketingowych korzyści związanych z tym samochodem.',
    categoriesHint: ['gwarancja', 'nowoczesność', 'wygląd', 'bezpieczeństwo', 'komfort', 'praktyczność', 'technologia', 'eksploatacja'],
    format: { items: 'Array<{ title: string; benefit: string }>' },
    pdfExcerpt,
  }

  const res = await client.chat.completions.create({
    model,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: 'Zwróć JSON: { items: [{ title, benefit }] }\n\n' + JSON.stringify(user) },
    ],
  })

  const text = res?.choices?.[0]?.message?.content
  if (!text) {
    console.error('Empty response')
    process.exitCode = 1
    return
  }

  // Print raw model output (what you asked for).
  process.stdout.write(text.trim() + '\n')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
