import { NextResponse } from 'next/server'

import { registerCooperationLead } from '@/lib/cooperationLead'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string
      email?: string
      phone?: string
      company?: string
      city?: string
      message?: string
      source?: string
      consents?: {
        acceptPrivacy?: boolean
        acceptContact?: boolean
      }
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const phone = (body.phone || '').trim()
    const company = (body.company || '').trim()
    const city = (body.city || '').trim()
    const message = (body.message || '').trim()

    if (!name || !email || !phone) {
      return NextResponse.json({ ok: false, error: 'Uzupełnij wymagane pola: imię, email i telefon.' }, { status: 400 })
    }

    if (!body.consents?.acceptPrivacy || !body.consents?.acceptContact) {
      return NextResponse.json(
        { ok: false, error: 'Zaakceptuj politykę prywatności i zgodę na kontakt.' },
        { status: 400 },
      )
    }

    const result = await registerCooperationLead({
      name,
      email,
      phone,
      company,
      city,
      message,
      source: body.source || 'wspolpraca',
      consents: {
        acceptPrivacy: Boolean(body.consents.acceptPrivacy),
        acceptContact: Boolean(body.consents.acceptContact),
      },
    })

    return NextResponse.json({
      ok: true,
      ...result,
      message: 'Dziękujemy. Formularz został wysłany, a nasz zespół wróci do Ciebie z informacją o współpracy.',
    })
  } catch (error) {
    console.error('[cooperation-lead]', error)
    return NextResponse.json({ ok: false, error: 'Nie udało się wysłać formularza. Spróbuj ponownie.' }, { status: 500 })
  }
}