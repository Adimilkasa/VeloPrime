import { NextResponse } from 'next/server'

import { sendWebinarReminders } from '@/lib/webinarSignup'

export const runtime = 'nodejs'

function env(name: string) {
  const value = process.env[name]
  return value === undefined ? '' : value.trim()
}

function isAuthorized(request: Request) {
  const expected = env('CRON_SECRET') || env('WEBINAR_CRON_SECRET')
  if (!expected) {
    return false
  }

  const authorization = request.headers.get('authorization') || ''
  return authorization === `Bearer ${expected}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendWebinarReminders()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[webinar-reminders]', error)
    return NextResponse.json({ ok: false, error: 'Nie udało się wysłać przypomnień.' }, { status: 500 })
  }
}