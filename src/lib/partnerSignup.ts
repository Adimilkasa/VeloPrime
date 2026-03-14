import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import { google, sheets_v4 } from 'googleapis'

export type PartnerSignupPayload = {
  leadId: string
  name: string
  email: string
  phone: string
  addressLine: string
  postalCode: string
  city: string
  company: string
  taxId: string
  customerType: 'private' | 'company'
  planName: string | null
  paymentMode: 'one' | 'installments' | null
  installmentMonths: number | null
  priceLabel: string | null
  note: string
  consents: {
    acceptTerms: boolean
    acceptPrivacy: boolean
    acceptEarlyStart: boolean | null
  }
  source: string
  createdAt: string
}

type SheetClient = {
  sheets: sheets_v4.Sheets
  spreadsheetId: string
}

type SheetRowMatch = {
  rowNumber: number
  values: string[]
}

type PartnerSignupIdentity = {
  name?: string
  email?: string
  phone?: string
  planName?: string | null
}

type MailConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

const PARTNER_SIGNUP_COLUMNS_RANGE = 'A:T'
const SHEET_STRUCTURE_CACHE_TTL_MS = 5 * 60 * 1000
const PARTNER_SIGNUP_HEADERS = [
  'Data zgloszenia',
  'Data potwierdzenia wplaty',
  'Pakiet',
  'Platnosc',
  'Liczba rat',
  'Kwota',
  'Typ klienta',
  'Imie i nazwisko',
  'Firma',
  'NIP',
  'E-mail',
  'Telefon',
  'Adres',
  'Kod pocztowy',
  'Miasto',
  'Notatka',
  'Regulamin',
  'Polityka prywatnosci',
  'Wczesniejsze wdrozenie',
  'ID zgloszenia',
]
const LEGACY_PARTNER_SIGNUP_HEADERS = [
  'leadId',
  'createdAt',
  'paymentConfirmedAt',
  'source',
  'status',
  'planName',
  'paymentMode',
  'installmentMonths',
  'priceLabel',
  'customerType',
  'name',
  'company',
  'taxId',
  'email',
  'phone',
  'addressLine',
  'postalCode',
  'city',
  'note',
  'acceptTerms',
  'acceptPrivacy',
  'acceptEarlyStart',
]

let ensuredSheetTabsAt = 0
let ensuredSheetTabsPromise: Promise<void> | null = null
let ensuredSheetTabsSpreadsheetId = ''

function env(name: string) {
  const value = process.env[name]
  return value === undefined ? '' : value.trim()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
  return ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].filter(
    (name) => !env(name),
  )
}

function describeMailError(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Nieznany błąd SMTP.'
  }

  const message = error.message.toLowerCase()

  if (message.includes('invalid login') || message.includes('authentication failed') || message.includes('535')) {
    return [
      'Błąd autoryzacji SMTP.',
      'Sprawdź pełny adres w SMTP_USER, poprawność SMTP_PASS oraz czy konto Zoho wymaga hasła aplikacyjnego.',
      'Dla domenowego konta Zoho zwykle użyj smtppro.zoho.eu:587 (TLS) albo smtppro.zoho.eu:465 (SSL).',
    ].join(' ')
  }

  if (message.includes('relaying disallowed')) {
    return 'Serwer odrzucił wysyłkę, bo SMTP_FROM nie pasuje do konta SMTP_USER albo jego aliasu.'
  }

  if (message.includes('enotfound') || message.includes('eai_again')) {
    return 'Nie udało się odnaleźć hosta SMTP. Sprawdź SMTP_HOST i region Zoho (np. .eu).'
  }

  if (message.includes('self signed certificate') || message.includes('certificate')) {
    return 'Błąd certyfikatu TLS po stronie SMTP. Sprawdź poprawność hosta i ustawień szyfrowania.'
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
      console.warn(`[partner-signup:sheets-retry] ${operation} attempt ${attempt} failed, retrying in ${delayMs}ms`, error)
      await sleep(delayMs)
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Google Sheets operation failed: ${operation}`)
}

function resolveSpreadsheetId(value: string) {
  const trimmedValue = value.trim()
  const match = trimmedValue.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match?.[1] || trimmedValue
}

export function createPartnerLeadId() {
  return randomUUID()
}

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function toPaymentModeLabel(paymentMode: PartnerSignupPayload['paymentMode']) {
  return paymentMode === 'installments' ? 'Raty' : 'Jednorazowo'
}

function toCustomerTypeLabel(customerType: PartnerSignupPayload['customerType']) {
  return customerType === 'company' ? 'Firma' : 'Osoba prywatna'
}

function fromPaymentModeLabel(value: string): PartnerSignupPayload['paymentMode'] {
  const normalizedValue = normalizeHeader(value)
  if (normalizedValue === 'raty') return 'installments'
  if (normalizedValue === 'jednorazowo') return 'one'
  return null
}

function fromCustomerTypeLabel(value: string): PartnerSignupPayload['customerType'] {
  return normalizeHeader(value) === 'firma' ? 'company' : 'private'
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
  const spreadsheetId = resolveSpreadsheetId(env('GOOGLE_PARTNER_SIGNUPS_SHEET_ID'))
  if (!spreadsheetId) {
    throw new Error('Brak GOOGLE_PARTNER_SIGNUPS_SHEET_ID.')
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

async function formatSheetTab(client: SheetClient, tabName: string) {
  const sheetId = await getSheetIdByTitle(client, tabName)

  await withSheetsRetry(`formatSheetTab:${tabName}`, () =>
    client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: client.spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
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
                endColumnIndex: PARTNER_SIGNUP_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.788,
                    green: 0.631,
                    blue: 0.231,
                  },
                  horizontalAlignment: 'CENTER',
                  textFormat: {
                    bold: true,
                    foregroundColor: {
                      red: 1,
                      green: 1,
                      blue: 1,
                    },
                  },
                  wrapStrategy: 'WRAP',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)',
            },
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: PARTNER_SIGNUP_HEADERS.length - 1,
                endIndex: PARTNER_SIGNUP_HEADERS.length,
              },
              properties: {
                hiddenByUser: true,
              },
              fields: 'hiddenByUser',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: PARTNER_SIGNUP_HEADERS.length - 1,
              },
            },
          },
        ],
      },
    }),
  )
}

function toReadableSheetRow(
  payload: PartnerSignupPayload,
  paymentConfirmedAt: string,
): Array<string | number> {
  return [
    payload.createdAt,
    paymentConfirmedAt,
    payload.planName || '',
    toPaymentModeLabel(payload.paymentMode),
    payload.paymentMode === 'installments' ? payload.installmentMonths ?? '' : '',
    payload.priceLabel || '',
    toCustomerTypeLabel(payload.customerType),
    payload.name,
    payload.company,
    payload.taxId,
    payload.email,
    payload.phone,
    payload.addressLine,
    payload.postalCode,
    payload.city,
    payload.note,
    payload.consents.acceptTerms ? 'TAK' : 'NIE',
    payload.consents.acceptPrivacy ? 'TAK' : 'NIE',
    payload.consents.acceptEarlyStart === null ? '' : payload.consents.acceptEarlyStart ? 'TAK' : 'NIE',
    payload.leadId,
  ]
}

function fromReadableSheetRow(values: string[]): PartnerSignupPayload {
  return {
    leadId: values[19] || '',
    createdAt: values[0] || '',
    source: 'partnerstwo-modal',
    planName: values[2] || null,
    paymentMode: fromPaymentModeLabel(values[3] || ''),
    installmentMonths: values[4] ? Number(values[4]) : null,
    priceLabel: values[5] || null,
    customerType: fromCustomerTypeLabel(values[6] || ''),
    name: values[7] || '',
    company: values[8] || '',
    taxId: values[9] || '',
    email: values[10] || '',
    phone: values[11] || '',
    addressLine: values[12] || '',
    postalCode: values[13] || '',
    city: values[14] || '',
    note: values[15] || '',
    consents: {
      acceptTerms: values[16] === 'TAK',
      acceptPrivacy: values[17] === 'TAK',
      acceptEarlyStart: values[18] ? values[18] === 'TAK' : null,
    },
  }
}

function convertLegacyRowToReadable(values: string[]) {
  const payload: PartnerSignupPayload = {
    leadId: values[0] || '',
    createdAt: values[1] || '',
    source: values[3] || 'partnerstwo-modal',
    planName: values[5] || null,
    paymentMode: values[6] === 'installments' ? 'installments' : values[6] === 'one' ? 'one' : null,
    installmentMonths: values[7] ? Number(values[7]) : null,
    priceLabel: values[8] || null,
    customerType: values[9] === 'company' ? 'company' : 'private',
    name: values[10] || '',
    company: values[11] || '',
    taxId: values[12] || '',
    email: values[13] || '',
    phone: values[14] || '',
    addressLine: values[15] || '',
    postalCode: values[16] || '',
    city: values[17] || '',
    note: values[18] || '',
    consents: {
      acceptTerms: values[19] === 'TAK',
      acceptPrivacy: values[20] === 'TAK',
      acceptEarlyStart: values[21] ? values[21] === 'TAK' : null,
    },
  }

  return toReadableSheetRow(payload, values[2] || '')
}

async function ensureSheetTabStructure(client: SheetClient, tabName: string) {
  const response = await withSheetsRetry(`ensureSheetTabStructure:get:${tabName}`, () =>
    client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A:V`,
    }),
  )

  const rows = response.data.values || []
  const headerRow = rows[0] || []
  const normalizedHeader = headerRow.map((value) => normalizeHeader(String(value)))
  const normalizedReadableHeader = PARTNER_SIGNUP_HEADERS.map(normalizeHeader)
  const normalizedLegacyHeader = LEGACY_PARTNER_SIGNUP_HEADERS.map(normalizeHeader)

  const isReadableHeader =
    normalizedHeader.length >= normalizedReadableHeader.length &&
    normalizedReadableHeader.every((value, index) => normalizedHeader[index] === value)

  const isLegacyHeader =
    normalizedHeader.length >= normalizedLegacyHeader.length &&
    normalizedLegacyHeader.every((value, index) => normalizedHeader[index] === value)

  if (rows.length === 0) {
    await withSheetsRetry(`ensureSheetTabStructure:init:${tabName}`, () =>
      client.sheets.spreadsheets.values.update({
        spreadsheetId: client.spreadsheetId,
        range: `${tabName}!A1:T1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [PARTNER_SIGNUP_HEADERS],
        },
      }),
    )
    await formatSheetTab(client, tabName)
    return
  }

  if (isReadableHeader) {
    await formatSheetTab(client, tabName)
    return
  }

  const readableRows = isLegacyHeader
    ? rows.slice(1).map(convertLegacyRowToReadable)
    : rows.slice(1).map((row) => row.slice(0, PARTNER_SIGNUP_HEADERS.length))

  await withSheetsRetry(`ensureSheetTabStructure:clear:${tabName}`, () =>
    client.sheets.spreadsheets.values.clear({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A:V`,
    }),
  )

  await withSheetsRetry(`ensureSheetTabStructure:update:${tabName}`, () =>
    client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A1:T${readableRows.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [PARTNER_SIGNUP_HEADERS, ...readableRows],
      },
    }),
  )

  await formatSheetTab(client, tabName)
}

async function ensureSheetTabExists(client: SheetClient, tabName: string) {
  const spreadsheet = await withSheetsRetry(`ensureSheetTabExists:get:${tabName}`, () =>
    client.sheets.spreadsheets.get({
      spreadsheetId: client.spreadsheetId,
    }),
  )

  const existingSheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === tabName)
  if (existingSheet) {
    return
  }

  await withSheetsRetry(`ensureSheetTabExists:add:${tabName}`, () =>
    client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: client.spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: tabName,
              },
            },
          },
        ],
      },
    }),
  )

  await withSheetsRetry(`ensureSheetTabExists:header:${tabName}`, () =>
    client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!A1:T1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [PARTNER_SIGNUP_HEADERS],
      },
    }),
  )

  await formatSheetTab(client, tabName)
}

async function ensureRequiredSheetTabs(client: SheetClient) {
  if (
    ensuredSheetTabsSpreadsheetId === client.spreadsheetId &&
    Date.now() - ensuredSheetTabsAt < SHEET_STRUCTURE_CACHE_TTL_MS
  ) {
    return
  }

  if (ensuredSheetTabsPromise && ensuredSheetTabsSpreadsheetId === client.spreadsheetId) {
    await ensuredSheetTabsPromise
    return
  }

  ensuredSheetTabsSpreadsheetId = client.spreadsheetId
  ensuredSheetTabsPromise = (async () => {
    await ensureSheetTabExists(client, getPendingSheetTab())
    await ensureSheetTabExists(client, getPaidSheetTab())
    await ensureSheetTabStructure(client, getPendingSheetTab())
    await ensureSheetTabStructure(client, getPaidSheetTab())
    ensuredSheetTabsAt = Date.now()
  })()

  try {
    await ensuredSheetTabsPromise
  } finally {
    ensuredSheetTabsPromise = null
  }
}

function getPendingSheetTab() {
  return env('GOOGLE_PARTNER_SIGNUPS_PENDING_SHEET_TAB') || 'Bez platnosci'
}

function getPaidSheetTab() {
  return env('GOOGLE_PARTNER_SIGNUPS_PAID_SHEET_TAB') || 'Partnerzy'
}

function toSheetRow(
  payload: PartnerSignupPayload,
  status: 'pending_payment' | 'payment_confirmed',
  paymentConfirmedAt: string,
) {
  void status
  return toReadableSheetRow(payload, paymentConfirmedAt)
}

function fromSheetRow(values: string[]): PartnerSignupPayload {
  return fromReadableSheetRow(values)
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

function toPaymentSummary(payload: PartnerSignupPayload) {
  if (payload.paymentMode === 'installments') {
    return `Raty (${payload.installmentMonths ?? '—'} mies.)`
  }

  return 'Jednorazowo'
}

function toAddressSummary(payload: PartnerSignupPayload) {
  return [payload.addressLine, `${payload.postalCode} ${payload.city}`.trim()].filter(Boolean).join(', ')
}

async function getWelcomeEmailImageAttachment() {
  const imagePath = path.join(process.cwd(), 'public', 'cars', 'do email.png')

  try {
    await fs.access(imagePath)
    return {
      filename: 'veloprime-welcome.png',
      path: imagePath,
      cid: 'veloprime-welcome-image',
    }
  } catch {
    return null
  }
}

function rowMatchesIdentity(values: string[], identity: PartnerSignupIdentity) {
  const emailMatches = identity.email
    ? normalizeCellValue(values[10]) === normalizeCellValue(identity.email)
    : true
  const phoneMatches = identity.phone
    ? normalizeCellValue(values[11]) === normalizeCellValue(identity.phone)
    : true
  const nameMatches = identity.name
    ? normalizeCellValue(values[7]) === normalizeCellValue(identity.name)
    : true
  const planMatches = identity.planName
    ? normalizeCellValue(values[2]) === normalizeCellValue(identity.planName)
    : true

  return emailMatches && phoneMatches && nameMatches && planMatches
}

async function appendRowToTab(client: SheetClient, tabName: string, row: Array<string | number>) {
  await withSheetsRetry(`appendRowToTab:${tabName}`, () =>
    client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!${PARTNER_SIGNUP_COLUMNS_RANGE}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    }),
  )
}

async function findRowByLeadId(client: SheetClient, tabName: string, leadId: string): Promise<SheetRowMatch | null> {
  const response = await withSheetsRetry(`findRowByLeadId:${tabName}`, () =>
    client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!${PARTNER_SIGNUP_COLUMNS_RANGE}`,
    }),
  )

  const rows = response.data.values || []
  const leadIdColumnIndex = PARTNER_SIGNUP_HEADERS.length - 1
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index]?.map((value) => String(value ?? '').trim()) || []
    const hasLeadIdInExpectedColumn = (row[leadIdColumnIndex] || '') === leadId
    const hasLeadIdAnywhereInRow = row.includes(leadId)

    if (hasLeadIdInExpectedColumn || hasLeadIdAnywhereInRow) {
      return {
        rowNumber: index + 1,
        values: rows[index].map((value) => String(value ?? '')),
      }
    }
  }

  return null
}

async function findLatestRowByIdentity(
  client: SheetClient,
  tabName: string,
  identity: PartnerSignupIdentity,
): Promise<SheetRowMatch | null> {
  const response = await withSheetsRetry(`findLatestRowByIdentity:${tabName}`, () =>
    client.sheets.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range: `${tabName}!${PARTNER_SIGNUP_COLUMNS_RANGE}`,
    }),
  )

  const rows = response.data.values || []
  for (let index = rows.length - 1; index >= 1; index -= 1) {
    const values = rows[index].map((value) => String(value ?? ''))
    if (rowMatchesIdentity(values, identity)) {
      return {
        rowNumber: index + 1,
        values,
      }
    }
  }

  return null
}

async function getSheetIdByTitle(client: SheetClient, tabName: string) {
  const spreadsheet = await withSheetsRetry(`getSheetIdByTitle:${tabName}`, () =>
    client.sheets.spreadsheets.get({
      spreadsheetId: client.spreadsheetId,
    }),
  )

  const sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === tabName)
  const sheetId = sheet?.properties?.sheetId
  if (sheetId === undefined) {
    throw new Error(`Nie znaleziono zakładki Google Sheets: ${tabName}`)
  }

  return sheetId
}

async function deleteRow(client: SheetClient, tabName: string, rowNumber: number) {
  const sheetId = await getSheetIdByTitle(client, tabName)

  await withSheetsRetry(`deleteRow:${tabName}:${rowNumber}`, () =>
    client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: client.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    }),
  )
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

async function sendWelcomeEmail(payload: PartnerSignupPayload) {
  const transport = createTransport()
  const config = readMailConfig()

  if (!transport || !config) {
    const missingFields = getMissingMailConfigFields()
    if (missingFields.length > 0) {
      console.warn('[partner-signup:welcome-email:config]', `Brakuje: ${missingFields.join(', ')}`)
    }
    return
  }

  try {
    const imageAttachment = await getWelcomeEmailImageAttachment()
    const paymentSummary = toPaymentSummary(payload)
    await transport.sendMail({
      from: config.from,
      to: payload.email,
      replyTo: env('PARTNER_WELCOME_REPLY_TO') || undefined,
      subject: `Potwierdzenie zgłoszenia Velo Prime - ${payload.planName || 'Pakiet partnerski'}`,
      text: [
        `Dzień dobry ${payload.name},`,
        '',
        'dziękujemy za potwierdzenie udziału w programie partnerskim Velo Prime.',
        'Twoje zgłoszenie zostało zapisane i przekazane do dalszej obsługi.',
        '',
        'Podsumowanie zgłoszenia:',
        `Pakiet: ${payload.planName || '—'}`,
        `Forma płatności: ${toPaymentSummary(payload)}`,
        `Kwota: ${payload.priceLabel || '—'}`,
        `Typ klienta: ${toCustomerTypeLabel(payload.customerType)}`,
        `Telefon kontaktowy: ${payload.phone}`,
        `Adres e-mail: ${payload.email}`,
        '',
        'Co dalej:',
        '1. W ciągu 24 godzin roboczych skontaktujemy się z Tobą w sprawie startu wdrożenia.',
        '2. Potwierdzimy kolejne kroki organizacyjne i terminy działań.',
        payload.paymentMode === 'installments'
          ? `3. Przekażemy harmonogram kolejnych ${Math.max((payload.installmentMonths ?? 1) - 1, 0)} rat.`
          : '3. Przekażemy dalsze informacje organizacyjne dotyczące wdrożenia.',
        '',
        'Jeżeli chcesz uzupełnić dane lub doprecyzować zgłoszenie, odpowiedz na tę wiadomość.',
        '',
        'Pozdrawiamy,',
        'Zespół Velo Prime',
      ].join('\n'),
      html: [
        '<div style="margin:0;padding:0;background:#efe7da;">',
        '<div style="max-width:720px;margin:0 auto;padding:36px 20px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.65;">',
        '<div style="background:#ffffff;border:1px solid #e5d8c2;border-radius:28px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.10);">',
        '<div style="padding:18px 32px;background:#111111;color:#f7f1e7;border-bottom:1px solid #2a2a2a;">',
        '<div style="display:inline-block;padding:7px 12px;border:1px solid rgba(201,161,59,0.45);border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#c9a13b;">Velo Prime</div>',
        '<h1 style="margin:18px 0 10px;font-size:30px;line-height:1.2;font-weight:700;color:#ffffff;">Potwierdzenie zgłoszenia do programu partnerskiego</h1>',
        '<p style="margin:0;font-size:15px;color:#d8d1c7;">Twoje zgłoszenie zostało przyjęte. Przechodzimy do kolejnego etapu przygotowania wdrożenia.</p>',
        '</div>',
        '<div style="padding:32px;">',
        '<p style="margin:0 0 16px;font-size:16px;">Dzień dobry ' + escapeHtml(payload.name) + ',</p>',
        '<p style="margin:0 0 12px;font-size:16px;">dziękujemy za potwierdzenie udziału w programie partnerskim Velo Prime.</p>',
        '<p style="margin:0 0 28px;font-size:16px;color:#4b5563;">To moment, w którym formalnie rozpoczynamy przygotowanie Twojego wejścia do programu i dalszych działań organizacyjnych.</p>',
        '<div style="margin:0 0 26px;padding:22px;border-radius:20px;background:linear-gradient(180deg,#fbf8f3,#f5ede1);border:1px solid #e8dcc8;">',
        '<div style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9a7b2f;">Podsumowanie zgłoszenia</div>',
        '<table role="presentation" style="width:100%;border-collapse:collapse;">',
        '<tr><td style="padding:0 0 10px;font-size:14px;color:#6b7280;width:42%;">Pakiet</td><td style="padding:0 0 10px;font-size:15px;font-weight:600;color:#111827;">' + escapeHtml(payload.planName || '—') + '</td></tr>',
        '<tr><td style="padding:0 0 10px;font-size:14px;color:#6b7280;">Forma płatności</td><td style="padding:0 0 10px;font-size:15px;font-weight:600;color:#111827;">' + escapeHtml(paymentSummary) + '</td></tr>',
        '<tr><td style="padding:0 0 10px;font-size:14px;color:#6b7280;">Kwota</td><td style="padding:0 0 10px;font-size:15px;font-weight:600;color:#111827;">' + escapeHtml(payload.priceLabel || '—') + '</td></tr>',
        '<tr><td style="padding:0 0 10px;font-size:14px;color:#6b7280;">Typ klienta</td><td style="padding:0 0 10px;font-size:15px;font-weight:600;color:#111827;">' + escapeHtml(toCustomerTypeLabel(payload.customerType)) + '</td></tr>',
        '<tr><td style="padding:0 0 10px;font-size:14px;color:#6b7280;">Telefon kontaktowy</td><td style="padding:0 0 10px;font-size:15px;font-weight:600;color:#111827;">' + escapeHtml(payload.phone) + '</td></tr>',
        '<tr><td style="padding:0;font-size:14px;color:#6b7280;">Adres e-mail</td><td style="padding:0;font-size:15px;font-weight:600;color:#111827;">' + escapeHtml(payload.email) + '</td></tr>',
        '</table>',
        '</div>',
        '<div style="margin:0 0 26px;padding:22px 22px 18px;border-radius:20px;background:#ffffff;border:1px solid #ece5d8;box-shadow:inset 0 1px 0 rgba(255,255,255,0.7);">',
        '<div style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9a7b2f;">Co dalej</div>',
        '<ol style="margin:0;padding-left:20px;color:#374151;">',
        '<li style="margin:0 0 10px;">W ciągu 24 godzin roboczych skontaktujemy się z Tobą w sprawie startu wdrożenia.</li>',
        '<li style="margin:0 0 10px;">Potwierdzimy kolejne kroki organizacyjne i terminy działań.</li>',
        '<li style="margin:0;">' + escapeHtml(
          payload.paymentMode === 'installments'
            ? `Przekażemy harmonogram kolejnych ${Math.max((payload.installmentMonths ?? 1) - 1, 0)} rat.`
            : 'Przekażemy dalsze informacje organizacyjne dotyczące wdrożenia.',
        ) + '</li>',
        '</ol>',
        '</div>',
        '<div style="margin:0 0 24px;padding:18px 20px;border-left:3px solid #c9a13b;background:#faf7f2;border-radius:0 14px 14px 0;font-size:15px;color:#374151;">Jeżeli chcesz uzupełnić dane lub doprecyzować zgłoszenie, odpowiedz na tę wiadomość.</div>',
        '<p style="margin:0 0 20px;font-size:15px;">Pozdrawiamy,<br /><span style="font-weight:700;color:#111827;">Zespół Velo Prime</span></p>',
        imageAttachment
          ? '<div style="margin-top:28px;border-radius:20px;overflow:hidden;border:1px solid #e6dac6;box-shadow:0 12px 24px rgba(15,23,42,0.08);"><img src="cid:veloprime-welcome-image" alt="Velo Prime" style="display:block;width:100%;height:auto;" /></div>'
          : '',
        '<div style="margin-top:18px;font-size:12px;color:#8b8b8b;">Velo Prime • program partnerski • wdrożenie • sprzedaż premium</div>',
        '</div>',
        '</div>',
        '</div>',
      ].join(''),
      attachments: imageAttachment ? [imageAttachment] : [],
    })
  } catch (error) {
    console.error('[partner-signup:welcome-email]', describeMailError(error), error)
    throw error
  }
}

async function sendAdminEmail(payload: PartnerSignupPayload) {
  const transport = createTransport()
  const config = readMailConfig()
  const adminEmail = env('PARTNER_SIGNUP_ADMIN_EMAIL') || config?.from || ''

  if (!transport || !config || !adminEmail) {
    const missingFields = getMissingMailConfigFields()
    if (missingFields.length > 0) {
      console.warn('[partner-signup:admin-email:config]', `Brakuje: ${missingFields.join(', ')}`)
    }
    return
  }

  try {
    await transport.sendMail({
      from: config.from,
      to: adminEmail,
      subject: `Nowe zgłoszenie partnera Velo Prime - ${payload.name} (${payload.planName || 'brak pakietu'})`,
      text: [
        'Nowe zgłoszenie partnera Velo Prime.',
        '',
        'Status: oczekuje na potwierdzenie płatności',
        '',
        'Pakiet i płatność:',
        `Pakiet: ${payload.planName || '—'}`,
        `Forma płatności: ${toPaymentSummary(payload)}`,
        `Kwota: ${payload.priceLabel || '—'}`,
        '',
        'Dane kontaktowe:',
        `Imię i nazwisko: ${payload.name}`,
        `Typ klienta: ${toCustomerTypeLabel(payload.customerType)}`,
        `Telefon: ${payload.phone}`,
        `E-mail: ${payload.email}`,
        `Adres: ${toAddressSummary(payload) || '—'}`,
        '',
        'Dane rozliczeniowe:',
        `Firma: ${payload.company || '—'}`,
        `NIP: ${payload.taxId || '—'}`,
        '',
        'Zgody:',
        `Regulamin: ${payload.consents.acceptTerms ? 'TAK' : 'NIE'}`,
        `Polityka prywatności: ${payload.consents.acceptPrivacy ? 'TAK' : 'NIE'}`,
        `Wcześniejsze wdrożenie: ${payload.consents.acceptEarlyStart === null ? 'nie dotyczy' : payload.consents.acceptEarlyStart ? 'TAK' : 'NIE'}`,
        '',
        'Dodatkowe informacje:',
        `Notatka: ${payload.note || '—'}`,
        '',
        'Dane techniczne:',
        `ID: ${payload.leadId}`,
        `Data: ${payload.createdAt}`,
        `Źródło: ${payload.source}`,
      ].join('\n'),
    })
  } catch (error) {
    console.error('[partner-signup:admin-email]', describeMailError(error), error)
    throw error
  }
}

async function sendDiscordNotification(payload: PartnerSignupPayload) {
  const webhookUrl = env('DISCORD_PARTNER_SIGNUPS_WEBHOOK_URL')
  if (!webhookUrl) {
    return
  }

  const message = [
    'Nowy uczestnik programu partnerskiego',
    `Imię i nazwisko: ${payload.name}`,
    `Telefon: ${payload.phone}`,
    `Miejscowość: ${payload.city}`,
    `Pakiet: ${payload.planName || '—'}`,
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

export async function registerPartnerSignup(payload: Omit<PartnerSignupPayload, 'leadId'>) {
  const client = await createSheetClient()
  await ensureRequiredSheetTabs(client)
  const leadId = createPartnerLeadId()
  const record: PartnerSignupPayload = {
    ...payload,
    leadId,
  }

  await appendRowToTab(client, getPendingSheetTab(), toSheetRow(record, 'pending_payment', ''))

  const notificationResults = await Promise.allSettled([sendAdminEmail(record)])

  notificationResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      const targets = ['admin-email']
      console.error(`[partner-signup:${targets[index]}]`, result.reason)
    }
  })

  return leadId
}

export async function confirmPartnerSignupPayment(leadId: string, identity?: PartnerSignupIdentity) {
  const client = await createSheetClient()
  await ensureRequiredSheetTabs(client)
  const pendingTab = getPendingSheetTab()
  const paidTab = getPaidSheetTab()

  const alreadyPaid = await findRowByLeadId(client, paidTab, leadId)
  const pendingRow =
    (await findRowByLeadId(client, pendingTab, leadId)) ||
    (identity ? await findLatestRowByIdentity(client, pendingTab, identity) : null)

  if (alreadyPaid) {
    if (pendingRow) {
      try {
        await deleteRow(client, pendingTab, pendingRow.rowNumber)
      } catch (error) {
        console.warn('[partner-signup:pending-cleanup]', error)
      }
    }

    return
  }

  if (!pendingRow) {
    throw new Error('Nie znaleziono zgłoszenia do potwierdzenia płatności.')
  }

  const payload = {
    ...fromSheetRow(pendingRow.values),
    leadId,
  }
  const paymentConfirmedAt = new Date().toISOString()

  try {
    await appendRowToTab(client, paidTab, toSheetRow(payload, 'payment_confirmed', paymentConfirmedAt))
  } catch (error) {
    const paidRowAfterFailure = await findRowByLeadId(client, paidTab, leadId)
    if (!paidRowAfterFailure) {
      throw error
    }
  }

  try {
    await deleteRow(client, pendingTab, pendingRow.rowNumber)
  } catch (error) {
    const paidRowAfterFailure = await findRowByLeadId(client, paidTab, leadId)
    if (!paidRowAfterFailure) {
      throw error
    }

    console.warn('[partner-signup:pending-delete-skipped]', error)
  }

  const notificationResults = await Promise.allSettled([
    sendWelcomeEmail(payload),
    sendDiscordNotification(payload),
  ])

  notificationResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      const targets = ['welcome-email', 'discord']
      console.error(`[partner-signup:${targets[index]}]`, result.reason)
    }
  })
}
