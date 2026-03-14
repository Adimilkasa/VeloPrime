import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import { google, sheets_v4 } from 'googleapis'

export type WebinarSlotKey = 'tuesday-2000' | 'thursday-2000' | 'saturday-1100'

export type WebinarSignupInput = {
  name: string
  email: string
  phone: string
  source: string
  selectedSlot?: WebinarSlotKey
  consents: {
    acceptPrivacy: boolean
    acceptContact: boolean
  }
}

export type WebinarRecordStatus = 'booked' | 'waitlist'

export type WebinarLeadRecord = Omit<WebinarSignupInput, 'selectedSlot'> & {
  selectedSlot: WebinarSlotKey | null
  leadId: string
  createdAt: string
  webinarDateLabel: string
  webinarDayLabel: string
  webinarTimeLabel: string
  webinarLink: string
  webinarDateIso: string
  webinarDateKey: string
  reminderSentAt: string
  status: WebinarRecordStatus
  note: string
}

export type WebinarSlotAvailability = {
  key: WebinarSlotKey
  label: string
  helper: string
  webinarDateLabel: string
  webinarDayLabel: string
  webinarTimeLabel: string
  remainingSeats: number
  capacity: number
  isAvailable: boolean
  isFull: boolean
  isExpired: boolean
  isSingleUse: boolean
}

export type WebinarRegistrationResult = {
  status: 'confirmed' | 'waitlist'
  leadId: string
  webinarDateLabel: string
  webinarDayLabel: string
  webinarTimeLabel: string
  hasWebinarLink: boolean
  message: string
  availability: WebinarSlotAvailability[]
}

export class WebinarSignupError extends Error {
  statusCode: number
  code: 'slot-required' | 'slot-unavailable'
  availability: WebinarSlotAvailability[]

  constructor(
    message: string,
    options: {
      statusCode: number
      code: 'slot-required' | 'slot-unavailable'
      availability: WebinarSlotAvailability[]
    },
  ) {
    super(message)
    this.name = 'WebinarSignupError'
    this.statusCode = options.statusCode
    this.code = options.code
    this.availability = options.availability
  }
}

type SheetClient = {
  sheets: sheets_v4.Sheets
  spreadsheetId: string
}

type SheetRowMatch = {
  rowNumber: number
  values: string[]
}

type MailConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

type WarsawParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  weekday: number
}

const WARSAW_TIME_ZONE = 'Europe/Warsaw'
const WEBINAR_COLUMNS_RANGE = 'A:P'
const WEBINAR_HEADERS = [
  'Data zgloszenia',
  'Termin webinaru',
  'Dzien webinaru',
  'Godzina webinaru',
  'Imie i nazwisko',
  'E-mail',
  'Telefon',
  'Polityka prywatnosci',
  'Zgoda kontakt',
  'Zrodlo',
  'Link webinaru',
  'Przypomnienie wyslane',
  'ID zgloszenia',
  'Data webinaru ISO',
  'Status',
  'Notatka',
]
const SHEET_STRUCTURE_CACHE_TTL_MS = 5 * 60 * 1000
const DEFAULT_SLOT_CAPACITY = 50
const SLOT_KEYS: WebinarSlotKey[] = ['tuesday-2000', 'thursday-2000', 'saturday-1100']
const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}
const SLOT_CONFIG: Record<
  WebinarSlotKey,
  {
    weekday: number
    dayLabel: string
    hour: number
    minute: number
    timeLabel: string
    linkEnvName: string
    capacityEnvName: string
    fixedDateEnvName?: string
  }
> = {
  'tuesday-2000': {
    weekday: 2,
    dayLabel: 'Wtorek',
    hour: 20,
    minute: 0,
    timeLabel: '20:00',
    linkEnvName: 'WEBINAR_LINK_TUESDAY_2000',
    capacityEnvName: 'WEBINAR_SLOT_TUESDAY_2000_CAPACITY',
  },
  'thursday-2000': {
    weekday: 4,
    dayLabel: 'Czwartek',
    hour: 20,
    minute: 0,
    timeLabel: '20:00',
    linkEnvName: 'WEBINAR_LINK_THURSDAY_2000',
    capacityEnvName: 'WEBINAR_SLOT_THURSDAY_2000_CAPACITY',
    fixedDateEnvName: 'WEBINAR_SLOT_THURSDAY_2000_FIXED_DATE',
  },
  'saturday-1100': {
    weekday: 6,
    dayLabel: 'Sobota',
    hour: 11,
    minute: 0,
    timeLabel: '11:00',
    linkEnvName: 'WEBINAR_LINK_SATURDAY_1100',
    capacityEnvName: 'WEBINAR_SLOT_SATURDAY_1100_CAPACITY',
  },
}

let ensuredSheetTabAt = 0
let ensuredSheetTabPromise: Promise<void> | null = null
let ensuredSheetTabSpreadsheetId = ''

function env(name: string) {
  const value = process.env[name]
  return value === undefined ? '' : value.trim()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function parsePositiveInteger(value: string, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return Math.floor(parsed)
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function normalizeCellValue(value: string | undefined) {
  return String(value ?? '').trim().toLowerCase()
}

function escapeHtml(value: string | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function resolveSpreadsheetId(value: string) {
  const trimmedValue = value.trim()
  const match = trimmedValue.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match?.[1] || trimmedValue
}

function getSlotCapacity(slotKey: WebinarSlotKey) {
  return parsePositiveInteger(env(SLOT_CONFIG[slotKey].capacityEnvName), DEFAULT_SLOT_CAPACITY)
}

function getConfiguredSlotDate(slotKey: WebinarSlotKey) {
  const fixedDateEnvName = SLOT_CONFIG[slotKey].fixedDateEnvName
  if (!fixedDateEnvName) {
    return null
  }

  const rawValue = env(fixedDateEnvName)
  if (!rawValue) {
    return null
  }

  const configuredDate = new Date(rawValue)
  if (Number.isNaN(configuredDate.getTime())) {
    throw new Error(`Nieprawidlowa data dla ${fixedDateEnvName}. Uzyj formatu ISO, np. 2026-03-19T20:00:00+01:00.`)
  }

  return configuredDate
}

function getRecordStatus(values: string[]): WebinarRecordStatus {
  return normalizeCellValue(values[14]) === 'waitlist' ? 'waitlist' : 'booked'
}

function readMailConfig(): MailConfig | null {
  const host = env('SMTP_HOST')
  const portRaw = env('SMTP_PORT')
  const user = env('SMTP_USER')
  const pass = env('SMTP_PASS')
  const from = env('SMTP_FROM')

  if (!host || !portRaw || !user || !pass || !from) {
    return null
  }

  return {
    host,
    port: Number(portRaw),
    secure: env('SMTP_SECURE') === 'true' || Number(portRaw) === 465,
    user,
    pass,
    from,
  }
}

function getMissingMailConfigFields() {
  return ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].filter((name) => !env(name))
}

function describeMailError(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Nieznany blad SMTP.'
  }

  const message = error.message.toLowerCase()

  if (message.includes('invalid login') || message.includes('authentication failed') || message.includes('535')) {
    return [
      'Blad autoryzacji SMTP.',
      'Sprawdz pelny adres w SMTP_USER, poprawnosc SMTP_PASS oraz czy konto Zoho wymaga hasla aplikacyjnego.',
      'Dla domenowego konta Zoho zwykle uzyj smtppro.zoho.eu:587 (TLS) albo smtppro.zoho.eu:465 (SSL).',
    ].join(' ')
  }

  if (message.includes('relaying disallowed')) {
    return 'Serwer odrzucil wysylke, bo SMTP_FROM nie pasuje do konta SMTP_USER albo jego aliasu.'
  }

  if (message.includes('enotfound') || message.includes('eai_again')) {
    return 'Nie udalo sie odnalezc hosta SMTP. Sprawdz SMTP_HOST i region uslugi SMTP.'
  }

  if (message.includes('self signed certificate') || message.includes('certificate')) {
    return 'Blad certyfikatu TLS po stronie SMTP. Sprawdz poprawnosc hosta i ustawien szyfrowania.'
  }

  return error.message
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
      console.warn(`[webinar:sheets-retry] ${operation} attempt ${attempt} failed, retrying in ${delayMs}ms`, error)
      await sleep(delayMs)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Google Sheets operation failed: ${operation}`)
}

function createTransport() {
  const config = readMailConfig()
  if (!config) {
    return null
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: { user: config.user, pass: config.pass },
    tls: {
      servername: config.host,
    },
  })
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
  const spreadsheetId = resolveSpreadsheetId(env('GOOGLE_WEBINAR_SHEET_ID') || env('GOOGLE_PARTNER_SIGNUPS_SHEET_ID'))
  if (!spreadsheetId) {
    throw new Error('Brak GOOGLE_WEBINAR_SHEET_ID lub GOOGLE_PARTNER_SIGNUPS_SHEET_ID.')
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

function getWebinarSheetTab() {
  return env('GOOGLE_WEBINAR_SHEET_TAB') || 'Webinar'
}

async function getWebinarRows(client: SheetClient, tabName: string) {
  const response = await withSheetsRetry(`getWebinarRows:${tabName}`, () =>
    client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!${WEBINAR_COLUMNS_RANGE}`,
    }),
  )

  return response.data.values || []
}

async function getSheetIdByTitle(client: SheetClient, tabName: string) {
  const spreadsheet = await withSheetsRetry(`getSheetIdByTitle:${tabName}`, () =>
    client.sheets.spreadsheets.get({ spreadsheetId: client.spreadsheetId }),
  )

  const sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === tabName)
  const sheetId = sheet?.properties?.sheetId
  if (sheetId === undefined) {
    throw new Error(`Nie znaleziono zakladki Google Sheets: ${tabName}`)
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
                endColumnIndex: WEBINAR_HEADERS.length,
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
                endIndex: WEBINAR_HEADERS.length,
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
      range: `${tabName}!A1:P1`,
      valueInputOption: 'RAW',
      requestBody: { values: [WEBINAR_HEADERS] },
    }),
  )

  await formatSheetTab(client, tabName)
}

async function ensureSheetTabStructure(client: SheetClient, tabName: string) {
  const response = await withSheetsRetry(`ensureSheetTabStructure:get:${tabName}`, () =>
    client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A:P`,
    }),
  )

  const rows = response.data.values || []
  const headerRow = rows[0] || []
  const normalizedHeader = headerRow.map((value) => normalizeHeader(String(value)))
  const normalizedExpectedHeader = WEBINAR_HEADERS.map(normalizeHeader)

  const isExpectedHeader =
    normalizedHeader.length >= normalizedExpectedHeader.length &&
    normalizedExpectedHeader.every((value, index) => normalizedHeader[index] === value)

  if (rows.length === 0) {
    await withSheetsRetry(`ensureSheetTabStructure:init:${tabName}`, () =>
      client.sheets.spreadsheets.values.update({
        spreadsheetId: client.spreadsheetId,
        range: `${tabName}!A1:P1`,
        valueInputOption: 'RAW',
        requestBody: { values: [WEBINAR_HEADERS] },
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
    const normalizedRow = row.slice(0, WEBINAR_HEADERS.length).map((value) => String(value ?? ''))
    while (normalizedRow.length < WEBINAR_HEADERS.length) {
      normalizedRow.push('')
    }
    return normalizedRow
  })

  await withSheetsRetry(`ensureSheetTabStructure:clear:${tabName}`, () =>
    client.sheets.spreadsheets.values.clear({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A:P`,
    }),
  )

  await withSheetsRetry(`ensureSheetTabStructure:update:${tabName}`, () =>
    client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A1:P${preservedRows.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [WEBINAR_HEADERS, ...preservedRows] },
    }),
  )

  await formatSheetTab(client, tabName)
}

async function ensureRequiredSheetTabs(client: SheetClient) {
  if (ensuredSheetTabSpreadsheetId === client.spreadsheetId && Date.now() - ensuredSheetTabAt < SHEET_STRUCTURE_CACHE_TTL_MS) {
    return
  }

  if (ensuredSheetTabPromise && ensuredSheetTabSpreadsheetId === client.spreadsheetId) {
    await ensuredSheetTabPromise
    return
  }

  ensuredSheetTabSpreadsheetId = client.spreadsheetId
  ensuredSheetTabPromise = (async () => {
    await ensureSheetTabExists(client, getWebinarSheetTab())
    await ensureSheetTabStructure(client, getWebinarSheetTab())
    ensuredSheetTabAt = Date.now()
  })()

  try {
    await ensuredSheetTabPromise
  } finally {
    ensuredSheetTabPromise = null
  }
}

function getWarsawParts(date: Date): WarsawParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: WARSAW_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  })

  const parts = formatter.formatToParts(date)
  const lookup = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || ''

  return {
    year: Number(lookup('year')),
    month: Number(lookup('month')),
    day: Number(lookup('day')),
    hour: Number(lookup('hour')),
    minute: Number(lookup('minute')),
    weekday: WEEKDAY_MAP[lookup('weekday')] ?? 0,
  }
}

function zonedLocalToUtc(parts: Omit<WarsawParts, 'weekday'>) {
  let guessMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = getWarsawParts(new Date(guessMs))
    const diffMs =
      Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) -
      Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute)

    guessMs += diffMs
    if (diffMs === 0) {
      break
    }
  }

  return new Date(guessMs)
}

function toWarsawDateKey(date: Date) {
  const parts = getWarsawParts(date)
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

function formatWebinarDateLabel(date: Date) {
  return new Intl.DateTimeFormat('pl-PL', {
    timeZone: WARSAW_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function resolveSlot(slotKey: WebinarSlotKey, now = new Date()) {
  const config = SLOT_CONFIG[slotKey]
  const configuredDate = getConfiguredSlotDate(slotKey)

  let startsAt: Date
  let isSingleUse = false

  if (configuredDate) {
    startsAt = configuredDate
    isSingleUse = true
  } else {
    const nowWarsaw = getWarsawParts(now)
    let dayDelta = (config.weekday - nowWarsaw.weekday + 7) % 7
    const currentMinutes = nowWarsaw.hour * 60 + nowWarsaw.minute
    const targetMinutes = config.hour * 60 + config.minute

    if (dayDelta === 0 && currentMinutes >= targetMinutes) {
      dayDelta = 7
    }

    const targetDateSeed = new Date(
      Date.UTC(nowWarsaw.year, nowWarsaw.month - 1, nowWarsaw.day) + dayDelta * 24 * 60 * 60 * 1000,
    )
    startsAt = zonedLocalToUtc({
      year: targetDateSeed.getUTCFullYear(),
      month: targetDateSeed.getUTCMonth() + 1,
      day: targetDateSeed.getUTCDate(),
      hour: config.hour,
      minute: config.minute,
    })
  }

  return {
    startsAt,
    isSingleUse,
    webinarDateIso: startsAt.toISOString(),
    webinarDateKey: toWarsawDateKey(startsAt),
    webinarDateLabel: formatWebinarDateLabel(startsAt),
    webinarDayLabel: config.dayLabel,
    webinarTimeLabel: config.timeLabel,
    webinarLink: env(config.linkEnvName),
  }
}

function countBookedSeats(rows: string[][], webinarDateKey: string) {
  return rows
    .slice(1)
    .map((values) => values.map((value) => String(value ?? '')))
    .filter((values) => values[13] && getRecordStatus(values) !== 'waitlist')
    .filter((values) => toWarsawDateKey(new Date(values[13])) === webinarDateKey).length
}

function buildSlotAvailability(rows: string[][], slotKey: WebinarSlotKey, now = new Date()): WebinarSlotAvailability {
  const config = SLOT_CONFIG[slotKey]
  const slot = resolveSlot(slotKey, now)
  const capacity = getSlotCapacity(slotKey)
  const isExpired = slot.startsAt.getTime() <= now.getTime()
  const bookedSeats = isExpired ? capacity : countBookedSeats(rows, slot.webinarDateKey)
  const remainingSeats = isExpired ? 0 : Math.max(0, capacity - bookedSeats)
  const isFull = !isExpired && remainingSeats <= 0

  let helper = `${slot.webinarDateLabel}. Pozostalo ${remainingSeats} z ${capacity} miejsc.`
  if (isExpired) {
    helper = slot.isSingleUse ? 'Ten jednorazowy termin nie jest juz dostepny.' : 'Ten termin nie jest juz dostepny.'
  } else if (isFull) {
    helper = `${slot.webinarDateLabel}. Brak miejsc (${capacity}/${capacity}).`
  }

  return {
    key: slotKey,
    label: `${config.dayLabel}, ${config.timeLabel}`,
    helper,
    webinarDateLabel: slot.webinarDateLabel,
    webinarDayLabel: slot.webinarDayLabel,
    webinarTimeLabel: slot.webinarTimeLabel,
    remainingSeats,
    capacity,
    isAvailable: !isExpired && !isFull,
    isFull,
    isExpired,
    isSingleUse: slot.isSingleUse,
  }
}

function buildAvailability(rows: string[][], now = new Date()) {
  return SLOT_KEYS.map((slotKey) => buildSlotAvailability(rows, slotKey, now))
}

function buildAvailabilityNote(availability: WebinarSlotAvailability[]) {
  return availability
    .map((slot) => {
      if (slot.isAvailable) {
        return `${slot.label}: ${slot.remainingSeats}/${slot.capacity} miejsc`
      }
      if (slot.isExpired) {
        return `${slot.label}: termin niedostepny`
      }
      return `${slot.label}: brak miejsc`
    })
    .join(' | ')
}

function toSheetRow(record: WebinarLeadRecord): Array<string | number> {
  return [
    record.createdAt,
    record.webinarDateLabel,
    record.webinarDayLabel,
    record.webinarTimeLabel,
    record.name,
    record.email,
    record.phone,
    record.consents.acceptPrivacy ? 'TAK' : 'NIE',
    record.consents.acceptContact ? 'TAK' : 'NIE',
    record.source,
    record.webinarLink,
    record.reminderSentAt,
    record.leadId,
    record.webinarDateIso,
    record.status,
    record.note,
  ]
}

function fromSheetRow(values: string[]): WebinarLeadRecord {
  const selectedSlot: WebinarSlotKey | null =
    values[2] === 'Wtorek' ? 'tuesday-2000' : values[2] === 'Czwartek' ? 'thursday-2000' : values[2] === 'Sobota' ? 'saturday-1100' : null

  const storedWebinarLink = values[10] || ''
  const envWebinarLink = selectedSlot ? env(SLOT_CONFIG[selectedSlot].linkEnvName) : ''

  return {
    leadId: values[12] || '',
    createdAt: values[0] || '',
    webinarDateLabel: values[1] || '',
    webinarDayLabel: values[2] || '',
    webinarTimeLabel: values[3] || '',
    name: values[4] || '',
    email: values[5] || '',
    phone: values[6] || '',
    consents: {
      acceptPrivacy: normalizeCellValue(values[7]) === 'tak',
      acceptContact: normalizeCellValue(values[8]) === 'tak',
    },
    source: values[9] || 'webinar',
    webinarLink: storedWebinarLink || envWebinarLink,
    reminderSentAt: values[11] || '',
    webinarDateIso: values[13] || '',
    webinarDateKey: values[13] ? toWarsawDateKey(new Date(values[13])) : '',
    selectedSlot,
    status: getRecordStatus(values),
    note: values[15] || '',
  }
}

async function appendRowToTab(client: SheetClient, tabName: string, row: Array<string | number>) {
  await withSheetsRetry(`appendRowToTab:${tabName}`, () =>
    client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!${WEBINAR_COLUMNS_RANGE}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    }),
  )
}

async function updateRow(client: SheetClient, tabName: string, rowNumber: number, row: Array<string | number>) {
  await withSheetsRetry(`updateRow:${tabName}:${rowNumber}`, () =>
    client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A${rowNumber}:P${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    }),
  )
}

async function findRowByLeadId(client: SheetClient, tabName: string, leadId: string): Promise<SheetRowMatch | null> {
  const response = await withSheetsRetry(`findRowByLeadId:${tabName}`, () =>
    client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!${WEBINAR_COLUMNS_RANGE}`,
    }),
  )

  const rows = response.data.values || []
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index]?.map((value) => String(value ?? '').trim()) || []
    if ((row[12] || '') === leadId || row.includes(leadId)) {
      return { rowNumber: index + 1, values: rows[index].map((value) => String(value ?? '')) }
    }
  }

  return null
}

async function getRowsNeedingReminder(client: SheetClient, tabName: string) {
  const response = await withSheetsRetry(`getRowsNeedingReminder:${tabName}`, () =>
    client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!${WEBINAR_COLUMNS_RANGE}`,
    }),
  )

  const todayKey = toWarsawDateKey(new Date())
  const rows = response.data.values || []

  return rows
    .slice(1)
    .map((values, index) => ({ rowNumber: index + 2, values: values.map((value) => String(value ?? '')) }))
    .filter(({ values }) => values[13] && toWarsawDateKey(new Date(values[13])) === todayKey && !values[11])
}

function buildConfirmationText(record: WebinarLeadRecord) {
  return [
    `Dzien dobry ${record.name},`,
    '',
    'Twoje miejsce na webinarze Velo Prime zostalo zarezerwowane.',
    '',
    'Szczegoly spotkania:',
    `Termin: ${record.webinarDateLabel}`,
    `Telefon kontaktowy: ${record.phone}`,
    `Adres e-mail: ${record.email}`,
    record.webinarLink ? `Link do webinaru: ${record.webinarLink}` : 'Link do webinaru uzupelnimy w osobnej wiadomosci po podaniu adresu spotkania.',
    '',
    'W dniu webinaru wyslemy dodatkowe przypomnienie e-mail.',
    '',
    'Pozdrawiamy,',
    'Zespol Velo Prime',
  ].join('\n')
}

function buildReminderText(record: WebinarLeadRecord) {
  return [
    `Dzien dobry ${record.name},`,
    '',
    'Przypominamy o dzisiejszym webinarze Velo Prime.',
    '',
    `Termin: ${record.webinarDateLabel}`,
    record.webinarLink ? `Link do webinaru: ${record.webinarLink}` : 'Link do webinaru zostanie przekazany osobno.',
    '',
    'Do zobaczenia online,',
    'Zespol Velo Prime',
  ].join('\n')
}

function buildWaitlistText(record: WebinarLeadRecord) {
  return [
    `Dzien dobry ${record.name},`,
    '',
    'Wszystkie obecne terminy webinaru Velo Prime sa juz zajete.',
    'Zapisalismy Twoje dane na liste oczekujacych i powiadomimy Cie, gdy uruchomimy kolejny termin.',
    '',
    `Telefon kontaktowy: ${record.phone}`,
    `Adres e-mail: ${record.email}`,
    '',
    'Pozdrawiamy,',
    'Zespol Velo Prime',
  ].join('\n')
}

function buildEmailShell(options: {
  eyebrow: string
  title: string
  intro: string
  summaryRows: Array<{ label: string; value: string }>
  buttonLabel?: string
  buttonHref?: string
  buttonNote?: string
  note: string
  footer: string
}) {
  const summaryHtml = options.summaryRows
    .map(
      (row) =>
        '<tr><td style="padding:0 0 10px;font-size:14px;color:#6b7280;width:38%;">' +
        escapeHtml(row.label) +
        '</td><td style="padding:0 0 10px;font-size:15px;font-weight:600;color:#111827;">' +
        escapeHtml(row.value) +
        '</td></tr>',
    )
    .join('')

  return [
    '<div style="margin:0;padding:0;background:#efe7da;">',
    '<div style="max-width:720px;margin:0 auto;padding:36px 20px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.65;">',
    '<div style="background:#ffffff;border:1px solid #e5d8c2;border-radius:28px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.10);">',
    '<div style="padding:18px 32px;background:#111111;color:#f7f1e7;border-bottom:1px solid #2a2a2a;">',
    '<div style="display:inline-block;padding:7px 12px;border:1px solid rgba(201,161,59,0.45);border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#c9a13b;">' + escapeHtml(options.eyebrow) + '</div>',
    '<h1 style="margin:18px 0 10px;font-size:30px;line-height:1.2;font-weight:700;color:#ffffff;">' + escapeHtml(options.title) + '</h1>',
    '<p style="margin:0;font-size:15px;color:#d8d1c7;">' + escapeHtml(options.intro) + '</p>',
    '</div>',
    '<div style="padding:32px;">',
    '<div style="margin:0 0 26px;padding:22px;border-radius:20px;background:linear-gradient(180deg,#fbf8f3,#f5ede1);border:1px solid #e8dcc8;">',
    '<div style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9a7b2f;">Szczegoly</div>',
    '<table role="presentation" style="width:100%;border-collapse:collapse;">',
    summaryHtml,
    '</table>',
    '</div>',
    options.buttonHref
      ? '<div style="margin:0 0 24px;"><a href="' + escapeHtml(options.buttonHref) + '" style="display:inline-block;padding:13px 20px;border-radius:14px;background:#b6841c;border:1px solid #8d6310;color:#ffffff !important;text-decoration:none;font-weight:700;line-height:1.2;mso-line-height-rule:exactly;">' + escapeHtml(options.buttonLabel || 'Otworz webinar') + '</a>' +
        (options.buttonNote
          ? '<div style="margin-top:12px;font-size:13px;color:#6b7280;">' + escapeHtml(options.buttonNote) + '</div>'
          : '') +
        '<div style="margin-top:12px;padding:12px 14px;border-radius:14px;background:#f8f4ec;border:1px solid #eadfc8;font-size:14px;line-height:1.5;color:#111827;word-break:break-word;">' +
        'Link do webinaru: <a href="' +
        escapeHtml(options.buttonHref) +
        '" style="color:#8d6310;text-decoration:underline;">' +
        escapeHtml(options.buttonHref) +
        '</a></div></div>'
      : '',
    '<div style="margin:0 0 24px;padding:18px 20px;border-left:3px solid #c9a13b;background:#faf7f2;border-radius:0 14px 14px 0;font-size:15px;color:#374151;">' + escapeHtml(options.note) + '</div>',
    '<p style="margin:0;font-size:15px;">' + escapeHtml(options.footer) + '</p>',
    '<div style="margin-top:18px;font-size:12px;color:#8b8b8b;">Velo Prime • webinar • sprzedaz premium • partnerstwo regionalne</div>',
    '</div>',
    '</div>',
    '</div>',
  ].join('')
}

async function sendConfirmationEmail(record: WebinarLeadRecord) {
  const transport = createTransport()
  const config = readMailConfig()

  if (!transport || !config) {
    const missingFields = getMissingMailConfigFields()
    if (missingFields.length > 0) {
      console.warn('[webinar:confirmation-email:config]', `Brakuje: ${missingFields.join(', ')}`)
    }
    return
  }

  try {
    await transport.sendMail({
      from: config.from,
      to: record.email,
      replyTo: env('WEBINAR_CONFIRMATION_REPLY_TO') || undefined,
      subject: `Potwierdzenie rezerwacji webinaru Velo Prime - ${record.webinarDayLabel}, ${record.webinarTimeLabel}`,
      text: buildConfirmationText(record),
      html: buildEmailShell({
        eyebrow: 'Webinar Velo Prime',
        title: 'Potwierdzenie rezerwacji miejsca',
        intro: 'Twoje zgloszenie zostalo zapisane. Ponizej znajdziesz szczegoly najblizszego webinaru.',
        summaryRows: [
          { label: 'Termin', value: record.webinarDateLabel },
          { label: 'Telefon', value: record.phone },
          { label: 'E-mail', value: record.email },
          { label: 'Zrodlo zapisu', value: record.source },
        ],
        buttonLabel: record.webinarLink ? 'Przejdz do webinaru' : undefined,
        buttonHref: record.webinarLink || undefined,
        buttonNote: record.webinarLink ? 'Jesli przycisk nie wyswietla sie poprawnie, skorzystaj z jawnego linku ponizej.' : undefined,
        note: record.webinarLink
          ? 'W dniu webinaru wyslemy dodatkowe przypomnienie z tym samym linkiem.'
          : 'Link do webinaru uzupelnimy po otrzymaniu wlasciwego adresu spotkania.',
        footer: 'Pozdrawiamy, Zespol Velo Prime',
      }),
    })
  } catch (error) {
    console.error('[webinar:confirmation-email]', describeMailError(error), error)
  }
}

async function sendReminderEmail(record: WebinarLeadRecord) {
  const transport = createTransport()
  const config = readMailConfig()

  if (!transport || !config) {
    const missingFields = getMissingMailConfigFields()
    if (missingFields.length > 0) {
      console.warn('[webinar:reminder-email:config]', `Brakuje: ${missingFields.join(', ')}`)
    }
    return
  }

  try {
    await transport.sendMail({
      from: config.from,
      to: record.email,
      replyTo: env('WEBINAR_REMINDER_REPLY_TO') || undefined,
      subject: `Przypomnienie: dzisiaj webinar Velo Prime o ${record.webinarTimeLabel}`,
      text: buildReminderText(record),
      html: buildEmailShell({
        eyebrow: 'Przypomnienie webinaru',
        title: 'Dzisiaj widzimy sie online',
        intro: 'To krotkie przypomnienie o Twoim dzisiejszym webinarze Velo Prime.',
        summaryRows: [
          { label: 'Termin', value: record.webinarDateLabel },
          { label: 'Telefon', value: record.phone },
          { label: 'E-mail', value: record.email },
        ],
        buttonLabel: record.webinarLink ? 'Otworz pokoj webinarowy' : undefined,
        buttonHref: record.webinarLink || undefined,
        buttonNote: record.webinarLink ? 'Jesli przycisk nie wyswietla sie poprawnie, skorzystaj z jawnego linku ponizej.' : undefined,
        note: record.webinarLink
          ? 'Zachowaj te wiadomosc pod reka. Link pozostaje aktywny dla wybranego terminu.'
          : 'Link do webinaru zostanie przekazany osobno.',
        footer: 'Do zobaczenia, Zespol Velo Prime',
      }),
    })
  } catch (error) {
    console.error('[webinar:reminder-email]', describeMailError(error), error)
    throw error
  }
}

async function sendWaitlistEmail(record: WebinarLeadRecord) {
  const transport = createTransport()
  const config = readMailConfig()

  if (!transport || !config) {
    const missingFields = getMissingMailConfigFields()
    if (missingFields.length > 0) {
      console.warn('[webinar:waitlist-email:config]', `Brakuje: ${missingFields.join(', ')}`)
    }
    return
  }

  try {
    await transport.sendMail({
      from: config.from,
      to: record.email,
      replyTo: env('WEBINAR_CONFIRMATION_REPLY_TO') || undefined,
      subject: 'Lista oczekujacych webinaru Velo Prime',
      text: buildWaitlistText(record),
      html: buildEmailShell({
        eyebrow: 'Lista oczekujacych',
        title: 'Wszystkie aktualne terminy sa zajete',
        intro: 'Zapisalismy Twoje dane i damy znac, gdy pojawi sie nowy termin webinaru Velo Prime.',
        summaryRows: [
          { label: 'Telefon', value: record.phone },
          { label: 'E-mail', value: record.email },
          { label: 'Zrodlo zapisu', value: record.source },
        ],
        note: 'Nie musisz robic nic wiecej. Powiadomimy Cie o najblizszym dostepnym terminie.',
        footer: 'Pozdrawiamy, Zespol Velo Prime',
      }),
    })
  } catch (error) {
    console.error('[webinar:waitlist-email]', describeMailError(error), error)
  }
}

async function registerWebinarWaitlistLead(
  client: SheetClient,
  input: WebinarSignupInput,
  availability: WebinarSlotAvailability[],
): Promise<WebinarRegistrationResult> {
  const leadId = randomUUID()
  const record: WebinarLeadRecord = {
    ...input,
    selectedSlot: input.selectedSlot || null,
    leadId,
    createdAt: new Date().toISOString(),
    webinarDateLabel: 'Wszystkie obecne terminy sa zajete',
    webinarDayLabel: '',
    webinarTimeLabel: '',
    webinarLink: '',
    webinarDateIso: '',
    webinarDateKey: '',
    reminderSentAt: '',
    status: 'waitlist',
    note: buildAvailabilityNote(availability),
  }

  await appendRowToTab(client, getWebinarSheetTab(), toSheetRow(record))
  await sendWaitlistEmail(record)

  return {
    status: 'waitlist',
    leadId: record.leadId,
    webinarDateLabel: record.webinarDateLabel,
    webinarDayLabel: record.webinarDayLabel,
    webinarTimeLabel: record.webinarTimeLabel,
    hasWebinarLink: false,
    message: 'Wszystkie aktualne terminy sa juz zajete. Zapisalismy Twoje dane i powiadomimy Cie o kolejnym webinarze.',
    availability,
  }
}

export async function getWebinarAvailability() {
  const client = await createSheetClient()
  await ensureRequiredSheetTabs(client)

  const rows = await getWebinarRows(client, getWebinarSheetTab())
  return buildAvailability(rows)
}

export async function registerWebinarLead(input: WebinarSignupInput): Promise<WebinarRegistrationResult> {
  const client = await createSheetClient()
  await ensureRequiredSheetTabs(client)

  const rows = await getWebinarRows(client, getWebinarSheetTab())
  const availability = buildAvailability(rows)
  const availableSlots = availability.filter((slot) => slot.isAvailable)

  if (!input.selectedSlot) {
    if (availableSlots.length === 0) {
      return registerWebinarWaitlistLead(client, input, availability)
    }

    throw new WebinarSignupError('Wybierz termin webinaru.', {
      statusCode: 400,
      code: 'slot-required',
      availability,
    })
  }

  const selectedAvailability = availability.find((slot) => slot.key === input.selectedSlot)
  if (!selectedAvailability?.isAvailable) {
    if (availableSlots.length === 0) {
      return registerWebinarWaitlistLead(client, input, availability)
    }

    throw new WebinarSignupError(
      selectedAvailability?.isExpired
        ? 'Ten termin webinaru nie jest juz dostepny. Wybierz inny termin.'
        : 'Ten termin webinaru jest juz zajety. Wybierz inny termin.',
      {
        statusCode: 409,
        code: 'slot-unavailable',
        availability,
      },
    )
  }

  const leadId = randomUUID()
  const slot = resolveSlot(input.selectedSlot)
  const record: WebinarLeadRecord = {
    ...input,
    selectedSlot: input.selectedSlot,
    leadId,
    createdAt: new Date().toISOString(),
    webinarDateLabel: slot.webinarDateLabel,
    webinarDayLabel: slot.webinarDayLabel,
    webinarTimeLabel: slot.webinarTimeLabel,
    webinarLink: slot.webinarLink,
    webinarDateIso: slot.webinarDateIso,
    webinarDateKey: slot.webinarDateKey,
    reminderSentAt: '',
    status: 'booked',
    note: '',
  }

  await appendRowToTab(client, getWebinarSheetTab(), toSheetRow(record))
  await sendConfirmationEmail(record)

  return {
    status: 'confirmed',
    leadId: record.leadId,
    webinarDateLabel: record.webinarDateLabel,
    webinarDayLabel: record.webinarDayLabel,
    webinarTimeLabel: record.webinarTimeLabel,
    hasWebinarLink: Boolean(record.webinarLink),
    message: 'Dzieki! Zgloszenie zapisane. Szczegoly webinaru wyslemy na podany email.',
    availability,
  }
}

export async function sendWebinarReminders() {
  const client = await createSheetClient()
  await ensureRequiredSheetTabs(client)

  const tabName = getWebinarSheetTab()
  const reminderRows = await getRowsNeedingReminder(client, tabName)
  let sent = 0

  for (const row of reminderRows) {
    const record = fromSheetRow(row.values)
    if (record.status === 'waitlist') {
      continue
    }

    await sendReminderEmail(record)
    const updatedRecord: WebinarLeadRecord = {
      ...record,
      reminderSentAt: new Date().toISOString(),
    }
    await updateRow(client, tabName, row.rowNumber, toSheetRow(updatedRecord))
    sent += 1
  }

  return { sent }
}

export async function getWebinarLeadById(leadId: string) {
  const client = await createSheetClient()
  await ensureRequiredSheetTabs(client)

  const row = await findRowByLeadId(client, getWebinarSheetTab(), leadId)
  return row ? fromSheetRow(row.values) : null
}
