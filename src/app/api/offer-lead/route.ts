import { NextResponse } from 'next/server'

import { registerOfferLead } from '@/lib/offerLead'

export const runtime = 'nodejs'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string
      email?: string
      phone?: string
      selectedModel?: string
      message?: string
      pricingMode?: 'business' | 'private'
      source?: string
      consents?: {
        acceptPrivacy?: boolean
        acceptContact?: boolean
      }
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const phone = (body.phone || '').trim()
    const selectedModel = (body.selectedModel || '').trim()
    const message = (body.message || '').trim()
    const pricingMode = body.pricingMode === 'private' ? 'private' : 'business'

    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: 'Uzupełnij wymagane pola: imię i telefon.' }, { status: 400 })
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'Podaj poprawny adres email.' }, { status: 400 })
    }

    if (!body.consents?.acceptPrivacy || !body.consents?.acceptContact) {
      return NextResponse.json(
        { ok: false, error: 'Zaakceptuj politykę prywatności i zgodę na kontakt.' },
        { status: 400 },
      )
    }

    const result = await registerOfferLead({
      name,
      email,
      phone,
      selectedModel,
      message,
      pricingMode,
      source: body.source || 'offer-widget',
      consents: {
        acceptPrivacy: Boolean(body.consents.acceptPrivacy),
        acceptContact: Boolean(body.consents.acceptContact),
      },
    })

    return NextResponse.json({
      ok: true,
      ...result,
      message: 'Dziękujemy. Otrzymaliśmy Twoje zapytanie i wrócimy z ofertą tak szybko, jak to możliwe.',
    })
  } catch (error) {
    console.error('[offer-lead]', error)
    return NextResponse.json({ ok: false, error: 'Nie udało się wysłać formularza. Spróbuj ponownie.' }, { status: 500 })
  }
}