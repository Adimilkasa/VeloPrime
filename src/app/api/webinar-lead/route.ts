import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string
      email?: string
      phone?: string
      source?: string
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const phone = (body.phone || '').trim()

    if (!name || !email || !phone) {
      return NextResponse.json({ ok: false, error: 'Uzupełnij wymagane pola (imię, email, telefon).' }, { status: 400 })
    }

    console.log('[webinar-lead]', {
      name,
      email,
      phone,
      source: body.source || 'webinar',
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Nieprawidłowe dane.' }, { status: 400 })
  }
}
