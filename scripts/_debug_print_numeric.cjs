const path = require('path')
const pdfParseModule = require('pdf-parse')

const { PDFParse, VerbosityLevel } = pdfParseModule

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

function extractNumericCandidates(pdfText) {
  const text = String(pdfText || '')
  if (!text.trim()) return []

  const patterns = [
    /\b\d{1,3}(?:[ \u00A0]?\d{3})*(?:[.,]\d+)?\s?(?:km\/h|km|kW|kWh|min|h|s|%|l\/100\s?km|l\s?\/\s?100\s?km|l|L|mm|cm|m|kg|W|Wh|V|A)\b/gi,
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
      if (out.length >= 200) return out
    }
  }
  return out
}

async function main() {
  const pdfAbs = path.resolve('public/spec/byd-dolphin-surf.pdf')
  const parser = new PDFParse({ url: pdfAbs, verbosity: VerbosityLevel?.ERRORS ?? 0 })
  await parser.load()
  const res = await parser.getText()
  try {
    await parser.destroy()
  } catch {
    // ignore
  }

  const text = normalize(res?.text)
  const cands = extractNumericCandidates(text)

  console.log('PDF:', pdfAbs)
  console.log('numericCandidates count =', cands.length)
  console.log('--- first 120 candidates ---')
  console.log(cands.slice(0, 120).join('\n'))

  const hasLargeKm = cands.filter((x) => /km/i.test(x)).slice(0, 20)
  console.log('--- first km candidates ---')
  console.log(hasLargeKm.join('\n'))
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
