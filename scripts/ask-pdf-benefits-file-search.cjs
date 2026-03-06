/*
  Ask OpenAI for 8 marketing benefits grounded in a FULL PDF via File Search.

  This uploads the PDF to a vector store, lets the model search it, and returns
  a strict JSON payload (no freeform text).

  Usage:
    node scripts/ask-pdf-benefits-file-search.cjs --pdf public/spec/byd-dolphin-surf.pdf

  Env:
    OPENAI_API_KEY=your_openai_api_key_here
    OPENAI_MODEL=gpt-5.2 (optional)

  Notes:
    - This sends the entire PDF file to OpenAI (upload) and uses `file_search`.
    - By default, the vector store is deleted at the end (to avoid clutter).
      Use --keep to keep it.
*/

const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')

const ROOT = path.resolve(__dirname, '..')

function loadDotEnvIfPresent(absPath) {
  if (!absPath) return
  try {
    const raw = fs.readFileSync(absPath, 'utf8')
    const lines = raw.split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (!key) continue
      if (process.env[key]) continue
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  } catch {
    // ignore
  }
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

function exists(absPath) {
  try {
    fs.accessSync(absPath)
    return true
  } catch {
    return false
  }
}

function jsonSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      items: {
        type: 'array',
        minItems: 8,
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: {
              type: 'string',
              minLength: 2,
              maxLength: 44,
              pattern: '^(?!\\s).*(?<!\\s)$',
            },
            benefit: {
              type: 'string',
              minLength: 12,
              maxLength: 140,
              pattern: '^(?!\\s).*[\\.\\!\\?]$',
            },
          },
          required: ['title', 'benefit'],
        },
      },
    },
    required: ['items'],
  }
}

async function main() {
  const args = parseArgs(process.argv)
  const pdfRel = String(args.pdf || 'public/spec/byd-dolphin-surf.pdf')
  const keep = Boolean(args.keep)
  const debug = Boolean(args.debug)

  const pdfAbs = path.isAbsolute(pdfRel) ? pdfRel : path.resolve(ROOT, pdfRel)
  if (!exists(pdfAbs)) {
    console.error('PDF not found:', pdfAbs)
    process.exitCode = 1
    return
  }

  loadDotEnvIfPresent(path.resolve(ROOT, '.env.local'))
  loadDotEnvIfPresent(path.resolve(ROOT, '.env'))

  const apiKey = String(process.env.OPENAI_API_KEY || '').trim()
  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY')
    process.exitCode = 1
    return
  }

  const model = String(process.env.OPENAI_MODEL || 'gpt-5.2')
  const client = new OpenAI({ apiKey })

  const vectorStore = await client.vectorStores.create({
    name: `pdf-benefits:${path.basename(pdfAbs)}:${Date.now()}`,
  })

  try {
    await client.vectorStores.files.uploadAndPoll(vectorStore.id, fs.createReadStream(pdfAbs))

    const prompt =
      'Jesteś copywriterem oferty samochodów (PL).\n' +
      'Na podstawie treści PDF (użyj file_search, nie zgaduj), wypisz DOKŁADNIE 8 marketingowych korzyści: fakt + praktyczna korzyść.\n' +
      'Wymagania:\n' +
      '- krótko, konkretnie, sprzedażowo; bez lania wody\n' +
      '- żadnych liczb/parametrów, jeśli NIE wynikają z PDF\n' +
      '- nie obiecuj rabatów, gratisów, dostępności ani wyposażenia jeśli w PDF brak\n' +
      '- tytuł bardzo krótki (2–5 słów), bez kropek na końcu\n' +
      '- benefit: jedno, pełne zdanie zakończone kropką/!/? (bez urwanych słów, bez spacji na końcu)\n' +
      'Zwróć WYŁĄCZNIE JSON zgodny ze schematem.'

    const response = await client.responses.create({
      model,
      temperature: 0.2,
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vectorStore.id],
          max_num_results: 8,
        },
      ],
      include: debug ? ['file_search_call.results'] : undefined,
      text: {
        format: {
          type: 'json_schema',
          name: 'pdf_marketing_benefits',
          schema: jsonSchema(),
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

    const out = String(response.output_text || '').trim()
    if (!out) {
      console.error('Empty response')
      process.exitCode = 1
      return
    }

    process.stdout.write(out + '\n')

    if (debug) {
      const outputs = Array.isArray(response.output) ? response.output : []
      const fsCalls = outputs.filter((o) => o && o.type === 'file_search_call')
      if (fsCalls.length) {
        process.stderr.write('\n[file_search_call outputs]\n')
        process.stderr.write(JSON.stringify(fsCalls, null, 2) + '\n')
      }
    }
  } finally {
    if (!keep) {
      try {
        await client.vectorStores.delete(vectorStore.id)
      } catch {
        // ignore
      }
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
