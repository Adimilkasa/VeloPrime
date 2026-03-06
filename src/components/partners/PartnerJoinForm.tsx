'use client'

import * as React from 'react'

import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export function PartnerJoinForm() {
  const [state, setState] = React.useState<FormState>({ status: 'idle' })

  const [name, setName] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [region, setRegion] = React.useState('')
  const [note, setNote] = React.useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState({ status: 'submitting' })

    try {
      const res = await fetch('/api/partner-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          region,
          note,
          source: 'dla-partnerow',
        }),
      })

      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Nie udało się wysłać zgłoszenia.')
      }

      setState({ status: 'success' })
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Błąd wysyłki.' })
    }
  }

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-stroke bg-bg-primary p-4">
        <Text className="text-text-primary font-medium">Dziękujemy — zgłoszenie wysłane.</Text>
        <Text className="mt-2" variant="muted">
          Wrócimy do Ciebie z kontaktem w sprawie dalszych kroków partnerstwa.
        </Text>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div>
        <label className="text-sm text-text-secondary">Imię i nazwisko</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
          placeholder="Jan Kowalski"
        />
      </div>

      <div>
        <label className="text-sm text-text-secondary">Firma (opcjonalnie)</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
          placeholder="Nazwa firmy"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm text-text-secondary">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
            placeholder="email@domena.pl"
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Telefon</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
            placeholder="+48 ..."
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-text-secondary">Region / miasto</label>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
          className="mt-2 h-11 w-full rounded-md border border-stroke bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
          placeholder="np. Wrocław / Dolny Śląsk"
        />
      </div>

      <div>
        <label className="text-sm text-text-secondary">Kilka słów (opcjonalnie)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 min-h-[110px] w-full rounded-md border border-stroke bg-bg-section px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
          placeholder="Jak sprzedajesz, jakie masz doświadczenie, w czym możemy pomóc…"
        />
      </div>

      {state.status === 'error' ? (
        <Text className="text-red-600">{state.message}</Text>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Wysyłanie…' : 'Wyślij zgłoszenie'}
        </Button>
      </div>

      <Text variant="muted">
        Wysyłając, zgadzasz się na kontakt w sprawie partnerstwa.
      </Text>
    </form>
  )
}
