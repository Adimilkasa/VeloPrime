import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string
      company?: string
      customerType?: 'private' | 'company'
      email?: string
      phone?: string
      region?: string
      addressLine?: string
      postalCode?: string
      city?: string
      taxId?: string
      planName?: string
      paymentMode?: 'one' | 'installments'
      installmentMonths?: number | null
      priceLabel?: string
      consents?: {
        acceptTerms?: boolean
        acceptPrivacy?: boolean
        acceptEarlyStart?: boolean | null
      }
      note?: string
      source?: string
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const phone = (body.phone || '').trim()
    const region = (body.region || '').trim()
    const city = (body.city || '').trim()
    const source = body.source || 'unknown'
    const customerType = body.customerType === 'company' ? 'company' : 'private'
    const company = (body.company || '').trim()
    const taxId = (body.taxId || '').trim()
    const addressLine = (body.addressLine || '').trim()
    const postalCode = (body.postalCode || '').trim()

    if (source === 'partnerstwo-modal') {
      if (!name || !email || !phone || !addressLine || !postalCode || !city) {
        return NextResponse.json(
          { ok: false, error: 'Uzupełnij wymagane pola formularza.' },
          { status: 400 },
        )
      }

      if (customerType === 'company' && (!company || !taxId)) {
        return NextResponse.json(
          { ok: false, error: 'Dla firmy wymagane są nazwa firmy i NIP.' },
          { status: 400 },
        )
      }

      if (!body.consents?.acceptTerms || !body.consents?.acceptPrivacy) {
        return NextResponse.json(
          { ok: false, error: 'Zaakceptuj regulamin i politykę prywatności.' },
          { status: 400 },
        )
      }

      if (customerType === 'private' && !body.consents?.acceptEarlyStart) {
        return NextResponse.json(
          { ok: false, error: 'Osoba prywatna musi wyrazić zgodę na wcześniejsze rozpoczęcie wdrożenia.' },
          { status: 400 },
        )
      }

      console.log('[partner-signup]', {
        name,
        email,
        phone,
        addressLine,
        postalCode,
        city,
        company,
        taxId,
        customerType,
        planName: body.planName || null,
        paymentMode: body.paymentMode || null,
        installmentMonths: body.installmentMonths ?? null,
        priceLabel: body.priceLabel || null,
        note: (body.note || '').trim(),
        consents: body.consents || {},
        createdAt: new Date().toISOString(),
      })

      return NextResponse.json({ ok: true })
    }

    if (!name || !email || !phone || !region) {
      return NextResponse.json(
        { ok: false, error: 'Uzupełnij wymagane pola (imię, email, telefon, region).' },
        { status: 400 },
      )
    }

    console.log('[partner-lead]', {
      name,
      company,
      email,
      phone,
      region,
      note: (body.note || '').trim(),
      source,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Nieprawidłowe dane.' }, { status: 400 })
  }
}
