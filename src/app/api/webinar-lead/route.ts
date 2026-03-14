import { NextResponse } from 'next/server'

import { getWebinarAvailability, registerWebinarLead, WebinarSignupError, type WebinarSlotKey } from '@/lib/webinarSignup'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const availability = await getWebinarAvailability()
    return NextResponse.json({ ok: true, availability })
  } catch (error) {
    console.error('[webinar-availability]', error)
    return NextResponse.json({ ok: false, error: 'Nie udało się pobrać dostępności terminów.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string
      email?: string
      phone?: string
      source?: string
      selectedSlot?: WebinarSlotKey
      consents?: {
        acceptPrivacy?: boolean
        acceptContact?: boolean
      }
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const phone = (body.phone || '').trim()

    if (!name || !email || !phone) {
      return NextResponse.json({ ok: false, error: 'Uzupełnij wymagane pola (imię, email, telefon).' }, { status: 400 })
    }

    if (!body.consents?.acceptPrivacy || !body.consents?.acceptContact) {
      return NextResponse.json(
        { ok: false, error: 'Zaakceptuj wymagane zgody, aby kontynuować zapis na webinar.' },
        { status: 400 },
      )
    }

    const result = await registerWebinarLead({
      name,
      email,
      phone,
      source: body.source || 'webinar',
      selectedSlot: body.selectedSlot,
      consents: {
        acceptPrivacy: Boolean(body.consents.acceptPrivacy),
        acceptContact: Boolean(body.consents.acceptContact),
      },
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    if (error instanceof WebinarSignupError) {
      return NextResponse.json(
        { ok: false, error: error.message, code: error.code, availability: error.availability },
        { status: error.statusCode },
      )
    }

    console.error('[webinar-lead]', error)
    return NextResponse.json({ ok: false, error: 'Nieprawidłowe dane.' }, { status: 400 })
  }
}
