import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { google, sheets_v4 } from 'googleapis'

export type OfferLeadInput = {
  name: string
  email: string
  phone: string
  selectedModel: string
  message: string
  pricingMode: 'business' | 'private'
  source: string
  consents: {
    acceptPrivacy: boolean
    acceptContact: boolean
  }
}

export type OfferLeadRecord = OfferLeadInput & {
  leadId: string
  createdAt: string
}

type SheetClient = {
  sheets: sheets_v4.Sheets
  spreadsheetId: string
}

const OFFER_COLUMNS_RANGE = 'A:L'
const OFFER_HEADERS = [
  'Data zgloszenia',
  'Imie i nazwisko',
  'E-mail',
  'Telefon',
  'Interesujacy model',
  'Wiadomosc',
  'Tryb oferty',
  'Polityka prywatnosci',
  'Zgoda kontakt',
  'Zrodlo',
  'ID zgloszenia',
  'Status',
]

let ensuredSheetAt = 0
let ensuredSheetPromise: Promise<void> | null = null
let ensuredSpreadsheetId = ''

function env(name: string) {
  const value = process.env[name]
  return value === undefined ? '' : value.trim()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function resolveSpreadsheetId(value: string) {
  const trimmedValue = value.trim()
  const match = trimmedValue.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match?.[1] || trimmedValue
}

function isRetryableGoogleError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  const status = 'code' in error && typeof error.code === 'number' ? error.code : null
  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true
  }

  const message = error.message.toLowerCase()
  return (
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('econnreset') ||
    message.includes('socket hang up')
  )
}

async function withSheetsRetry<T>(operation: string, task: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      lastError = error
      if (attempt === attempts || !isRetryableGoogleError(error)) {
        throw error
      }

      const delayMs = 250 * 2 ** (attempt - 1) + Math.floor(Math.random() * 150)
      console.warn(`[offer:sheets-retry] ${operation} attempt ${attempt} failed, retrying in ${delayMs}ms`, error)
      await sleep(delayMs)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Google Sheets operation failed: ${operation}`)
}

async function loadGoogleCredentials() {
  const rawJson = env('GOOGLE_SERVICE_ACCOUNT_JSON')
  if (rawJson) {
    try {
      return JSON.parse(rawJson)
    } catch {
      return JSON.parse(rawJson.replace(/\r?\n/g, '\\n'))
    }
  }

  const filePath = env('GOOGLE_SERVICE_ACCOUNT_FILE')
  if (!filePath) {
    throw new Error('Brak GOOGLE_SERVICE_ACCOUNT_FILE lub GOOGLE_SERVICE_ACCOUNT_JSON.')
  }

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  const fileContents = await fs.readFile(absolutePath, 'utf8')
  return JSON.parse(fileContents)
}

async function createSheetClient(): Promise<SheetClient> {
  const spreadsheetId = resolveSpreadsheetId(
    env('GOOGLE_OFFER_SHEET_ID') ||
      env('GOOGLE_COOPERATION_SHEET_ID') ||
      env('GOOGLE_WEBINAR_SHEET_ID') ||
      env('GOOGLE_PARTNER_SIGNUPS_SHEET_ID'),
  )
  if (!spreadsheetId) {
    throw new Error(
      'Brak GOOGLE_OFFER_SHEET_ID, GOOGLE_COOPERATION_SHEET_ID, GOOGLE_WEBINAR_SHEET_ID lub GOOGLE_PARTNER_SIGNUPS_SHEET_ID.',
    )
  }

  const credentials = await loadGoogleCredentials()
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return {
    sheets: google.sheets({ version: 'v4', auth }),
    spreadsheetId,
  }
}

function getOfferSheetTab() {
  return env('GOOGLE_OFFER_SHEET_TAB') || 'Oferta'
}

async function getSheetIdByTitle(client: SheetClient, tabName: string) {
  const spreadsheet = await withSheetsRetry(`getSheetIdByTitle:${tabName}`, () =>
    client.sheets.spreadsheets.get({ spreadsheetId: client.spreadsheetId }),
  )

  const sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === tabName)
  const sheetId = sheet?.properties?.sheetId
  if (sheetId === undefined) {
    throw new Error(`Nie znaleziono zakładki Google Sheets: ${tabName}`)
  }

  return sheetId
}

async function formatSheetTab(client: SheetClient, tabName: string) {
  const sheetId = await getSheetIdByTitle(client, tabName)

  await withSheetsRetry(`formatSheetTab:${tabName}`, () =>
    client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: client.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: OFFER_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.788, green: 0.631, blue: 0.231 },
                  horizontalAlignment: 'CENTER',
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                  },
                  wrapStrategy: 'WRAP',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: OFFER_HEADERS.length,
              },
            },
          },
        ],
      },
    }),
  )
}

async function ensureSheetTabExists(client: SheetClient, tabName: string) {
  const spreadsheet = await withSheetsRetry(`ensureSheetTabExists:get:${tabName}`, () =>
    client.sheets.spreadsheets.get({ spreadsheetId: client.spreadsheetId }),
  )

  const existingSheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === tabName)
  if (existingSheet) {
    return
  }

  await withSheetsRetry(`ensureSheetTabExists:add:${tabName}`, () =>
    client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: client.spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: tabName } } }],
      },
    }),
  )

  await withSheetsRetry(`ensureSheetTabExists:header:${tabName}`, () =>
    client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A1:L1`,
      valueInputOption: 'RAW',
      requestBody: { values: [OFFER_HEADERS] },
    }),
  )

  await formatSheetTab(client, tabName)
}

async function ensureSheetTabStructure(client: SheetClient, tabName: string) {
  const response = await withSheetsRetry(`ensureSheetTabStructure:get:${tabName}`, () =>
    client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A:L`,
    }),
  )

  const rows = response.data.values || []
  const headerRow = rows[0] || []
  const normalizedHeader = headerRow.map((value) => normalizeHeader(String(value)))
  const normalizedExpectedHeader = OFFER_HEADERS.map(normalizeHeader)

  const isExpectedHeader =
    normalizedHeader.length >= normalizedExpectedHeader.length &&
    normalizedExpectedHeader.every((value, index) => normalizedHeader[index] === value)

  if (rows.length === 0) {
    await withSheetsRetry(`ensureSheetTabStructure:init:${tabName}`, () =>
      client.sheets.spreadsheets.values.update({
        spreadsheetId: client.spreadsheetId,
        range: `${tabName}!A1:L1`,
        valueInputOption: 'RAW',
        requestBody: { values: [OFFER_HEADERS] },
      }),
    )
    await formatSheetTab(client, tabName)
    return
  }

  if (isExpectedHeader) {
    await formatSheetTab(client, tabName)
    return
  }

  const preservedRows = rows.slice(1).map((row) => {
    const normalizedRow = row.slice(0, OFFER_HEADERS.length).map((value) => String(value ?? ''))
    while (normalizedRow.length < OFFER_HEADERS.length) {
      normalizedRow.push('')
    }
    return normalizedRow
  })

  await withSheetsRetry(`ensureSheetTabStructure:clear:${tabName}`, () =>
    client.sheets.spreadsheets.values.clear({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A:L`,
    }),
  )

  await withSheetsRetry(`ensureSheetTabStructure:update:${tabName}`, () =>
    client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A1:L${preservedRows.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [OFFER_HEADERS, ...preservedRows] },
    }),
  )

  await formatSheetTab(client, tabName)
}

async function ensureRequiredSheetTab(client: SheetClient) {
  const ttlMs = 5 * 60 * 1000

  if (ensuredSpreadsheetId === client.spreadsheetId && Date.now() - ensuredSheetAt < ttlMs) {
    return
  }

  if (ensuredSheetPromise && ensuredSpreadsheetId === client.spreadsheetId) {
    await ensuredSheetPromise
    return
  }

  ensuredSpreadsheetId = client.spreadsheetId
  ensuredSheetPromise = (async () => {
    await ensureSheetTabExists(client, getOfferSheetTab())
    await ensureSheetTabStructure(client, getOfferSheetTab())
    ensuredSheetAt = Date.now()
  })()

  try {
    await ensuredSheetPromise
  } finally {
    ensuredSheetPromise = null
  }
}

function toPricingModeLabel(value: OfferLeadInput['pricingMode']) {
  return value === 'business' ? 'Firma' : 'Prywatnie'
}

function toSheetRow(record: OfferLeadRecord): Array<string | number> {
  return [
    record.createdAt,
    record.name,
    record.email,
    record.phone,
    record.selectedModel,
    record.message,
    toPricingModeLabel(record.pricingMode),
    record.consents.acceptPrivacy ? 'TAK' : 'NIE',
    record.consents.acceptContact ? 'TAK' : 'NIE',
    record.source,
    record.leadId,
    'new',
  ]
}

async function appendRowToTab(client: SheetClient, tabName: string, row: Array<string | number>) {
  await withSheetsRetry(`appendRowToTab:${tabName}`, () =>
    client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!${OFFER_COLUMNS_RANGE}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    }),
  )
}

async function sendDiscordNotification(record: OfferLeadRecord) {
  const webhookUrl = env('DISCORD_OFFER_WEBHOOK_URL') || env('DISCORD_PARTNER_SIGNUPS_WEBHOOK_URL')
  if (!webhookUrl) {
    return
  }

  const message = [
    'Nowe zapytanie ofertowe Velo Prime',
    `Imię i nazwisko: ${record.name}`,
    `Telefon: ${record.phone}`,
    `E-mail: ${record.email || '—'}`,
    `Interesujący model: ${record.selectedModel || '—'}`,
    `Tryb oferty: ${toPricingModeLabel(record.pricingMode)}`,
    `Wiadomość: ${record.message || '—'}`,
    `Źródło: ${record.source}`,
  ].join('\n')

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  })

  if (!response.ok) {
    throw new Error(`Discord webhook returned ${response.status}.`)
  }
}

export async function registerOfferLead(input: OfferLeadInput) {
  const record: OfferLeadRecord = {
    ...input,
    leadId: randomUUID(),
    createdAt: new Date().toISOString(),
  }

  const client = await createSheetClient()
  await ensureRequiredSheetTab(client)
  await appendRowToTab(client, getOfferSheetTab(), toSheetRow(record))

  const notifications = await Promise.allSettled([sendDiscordNotification(record)])
  notifications.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('[offer:discord]', result.reason)
    }
  })

  return { leadId: record.leadId }
}