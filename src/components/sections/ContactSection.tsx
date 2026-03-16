'use client'

import * as React from 'react'

import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { usePricingMode } from '@/components/providers/PricingModeProvider'

type FormState = {
  name: string
  phone: string
  email: string
  message: string
  consent: boolean
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(values: FormState): Errors {
  const errors: Errors = {}

  if (!values.name.trim()) errors.name = 'Imię jest wymagane.'

  const phoneDigits = values.phone.replace(/\D/g, '')
  if (!phoneDigits) errors.phone = 'Telefon jest wymagany.'
  else if (phoneDigits.length < 7) errors.phone = 'Podaj poprawny numer telefonu.'

  if (values.email.trim()) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
    if (!ok) errors.email = 'Podaj poprawny adres email.'
  }

  if (!values.consent) errors.consent = 'Zgoda jest wymagana, abyśmy mogli oddzwonić.'

  return errors
}

export function ContactSection() {
  const { mode } = usePricingMode()
  const [values, setValues] = React.useState<FormState>({
    name: '',
    phone: '',
    email: '',
    message: '',
    consent: false,
  })
  const [touched, setTouched] = React.useState<Partial<Record<keyof FormState, boolean>>>({})
  const [copied, setCopied] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = React.useState('')

  const errors = React.useMemo(() => validate(values), [values])

  const nameErrorId = 'contact-name-error'
  const phoneErrorId = 'contact-phone-error'
  const emailErrorId = 'contact-email-error'
  const consentErrorId = 'contact-consent-error'

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  function markTouched<K extends keyof FormState>(key: K) {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    setTouched({ name: true, phone: true, email: true, message: true, consent: true })

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('loading')
    setStatusMessage('')

    try {
      const response = await fetch('/api/offer-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          selectedModel: '',
          pricingMode: mode,
          source: 'contact-section',
          consents: {
            acceptPrivacy: values.consent,
            acceptContact: values.consent,
          },
        }),
      })

      const json = (await response.json().catch(() => null)) as null | { ok?: boolean; error?: string; message?: string }

      if (!response.ok || !json?.ok) {
        setStatus('error')
        setStatusMessage(json?.error || 'Nie udało się wysłać formularza. Spróbuj ponownie.')
        return
      }

      setStatus('success')
      setStatusMessage(json.message || 'Dziękujemy. Wrócimy z odpowiedzią tak szybko, jak to możliwe.')
      setValues({ name: '', phone: '', email: '', message: '', consent: false })
      setTouched({})
    } catch {
      setStatus('error')
      setStatusMessage('Nie udało się wysłać formularza. Spróbuj ponownie.')
    }
  }

  async function onCopyNumber() {
    try {
      await navigator.clipboard.writeText('+48 506 606 415')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // ignore (e.g. insecure context)
    }
  }

  return (
    <>
      <Section id="kontakt" variant="primary" className="relative">
        <div className="max-w-2xl">
          <Heading level={2}>Kontakt</Heading>
          <Text className="mt-4">
            Masz pytania dotyczące dostępności lub finansowania? Porozmawiajmy — oddzwonimy w godzinach pracy.
          </Text>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Left column – ContactCard */}
          <Card className="rounded-2xl p-7 md:p-10">
            <div className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
              +48 506 606 415
            </div>
            <Text variant="muted" className="mt-3">
              Infolinia: pon.–pt. 9:00–17:00
            </Text>

            <ul className="mt-7 space-y-3">
              {[
                'Szybka weryfikacja dostępności',
                'Dobór finansowania z 16 instytucji',
                'Bez presji — transparentnie',
              ].map((label) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-[7px] inline-block h-2 w-2 rounded-full bg-brand-gold" aria-hidden />
                  <span className="text-sm text-text-secondary">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" size="md" onClick={onCopyNumber}>
                {copied ? 'Skopiowano' : 'Skopiuj numer'}
              </Button>
              {copied ? (
                <Text variant="muted" className="text-sm">
                  Numer skopiowany do schowka.
                </Text>
              ) : null}
            </div>
          </Card>

          {/* Right column – FormCard */}
          <Card className="rounded-2xl p-7 md:p-10">
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-text-secondary">Imię *</label>
                  <input
                    name="name"
                    value={values.name}
                    onChange={(e) => setField('name', e.target.value)}
                    onBlur={() => markTouched('name')}
                    aria-invalid={Boolean(touched.name && errors.name)}
                    aria-describedby={touched.name && errors.name ? nameErrorId : undefined}
                    className={
                      'mt-2 h-11 w-full rounded-md border bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke ' +
                      (touched.name && errors.name ? 'border-brand-gold' : 'border-stroke')
                    }
                    placeholder="Twoje imię"
                    autoComplete="given-name"
                    required
                  />
                  {touched.name && errors.name ? (
                    <p id={nameErrorId} role="alert" className="mt-1 text-xs text-brand-goldDark">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm text-text-secondary">Telefon *</label>
                  <input
                    name="phone"
                    value={values.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    onBlur={() => markTouched('phone')}
                    aria-invalid={Boolean(touched.phone && errors.phone)}
                    aria-describedby={touched.phone && errors.phone ? phoneErrorId : undefined}
                    className={
                      'mt-2 h-11 w-full rounded-md border bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke ' +
                      (touched.phone && errors.phone ? 'border-brand-gold' : 'border-stroke')
                    }
                    placeholder="+48 ..."
                    inputMode="tel"
                    autoComplete="tel"
                    required
                  />
                  {touched.phone && errors.phone ? (
                    <p id={phoneErrorId} role="alert" className="mt-1 text-xs text-brand-goldDark">
                      {errors.phone}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary">Email (opcjonalnie)</label>
                <input
                  name="email"
                  value={values.email}
                  onChange={(e) => setField('email', e.target.value)}
                  onBlur={() => markTouched('email')}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={touched.email && errors.email ? emailErrorId : undefined}
                  className={
                    'mt-2 h-11 w-full rounded-md border bg-bg-section px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke ' +
                    (touched.email && errors.email ? 'border-brand-gold' : 'border-stroke')
                  }
                  placeholder="email@..."
                  inputMode="email"
                  autoComplete="email"
                />
                {touched.email && errors.email ? (
                  <p id={emailErrorId} role="alert" className="mt-1 text-xs text-brand-goldDark">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm text-text-secondary">Wiadomość</label>
                <textarea
                  name="message"
                  value={values.message}
                  onChange={(e) => setField('message', e.target.value)}
                  onBlur={() => markTouched('message')}
                  className="mt-2 min-h-[92px] w-full rounded-md border border-stroke bg-bg-section px-3 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-stroke"
                  placeholder="Napisz krótko w czym możemy pomóc..."
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={values.consent}
                    onChange={(e) => setField('consent', e.target.checked)}
                    onBlur={() => markTouched('consent')}
                    className="mt-1 h-4 w-4 rounded border border-stroke"
                    aria-invalid={Boolean(touched.consent && errors.consent)}
                    aria-describedby={touched.consent && errors.consent ? consentErrorId : undefined}
                    required
                  />
                  <span className="text-sm text-text-secondary">
                    Wyrażam zgodę na kontakt w sprawie zapytania.
                  </span>
                </label>
                {touched.consent && errors.consent ? (
                  <p id={consentErrorId} role="alert" className="mt-1 text-xs text-brand-goldDark">
                    {errors.consent}
                  </p>
                ) : null}
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto">
                  {status === 'loading' ? 'Wysyłanie…' : 'Otrzymaj kontakt'}
                </Button>
                <Text variant="muted" className="mt-3 text-sm">
                  {status === 'success' ? statusMessage : 'Oddzwonimy w godzinach pracy.'}
                </Text>
                {status === 'error' ? (
                  <Text className="mt-2 text-sm text-brand-goldDark">{statusMessage}</Text>
                ) : null}
              </div>
            </form>
          </Card>
        </div>
      </Section>

      <footer className="border-t border-stroke bg-bg-primary py-8">
        <Container>
          <Text variant="muted" className="mx-auto max-w-4xl text-center text-xs">
            Właścicielem marki Velo Prime jest Przyjazna Natura Sp. z o.o. z siedzibą w Bielsku-Białej, ul.
            Warszawska 183, NIP 547 222 32 24.
          </Text>
        </Container>
      </footer>
    </>
  )
}
