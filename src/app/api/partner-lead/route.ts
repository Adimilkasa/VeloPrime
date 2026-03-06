import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string
      company?: string
      email?: string
      phone?: string
      region?: string
      note?: string
      source?: string
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const phone = (body.phone || '').trim()
    const region = (body.region || '').trim()

    if (!name || !email || !phone || !region) {
      return NextResponse.json(
        { ok: false, error: 'Uzupełnij wymagane pola (imię, email, telefon, region).' },
        { status: 400 },
      )
    }

    console.log('[partner-lead]', {
      name,
      company: (body.company || '').trim(),
      email,
      phone,
      region,
      note: (body.note || '').trim(),
      source: body.source || 'unknown',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Nieprawidłowe dane.' }, { status: 400 })
  }
}
