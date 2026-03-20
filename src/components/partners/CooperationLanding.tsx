'use client'

import * as React from 'react'
import { ArrowRight, Check, Handshake, LineChart, Map, Users } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'

type CooperationLeadState = {
  name: string
  email: string
  phone: string
}

const heroBenefits = [
  'Rozwijasz własny region, a nie cudzy etat.',
  'Wchodzisz w gotowy model sprzedaży samochodów nowych marek.',
  'Dostajesz wsparcie operacyjne, marketingowe i wdrożeniowe.',
]

const idealPartnerPoints = [
  'Masz doświadczenie w sprzedaży lub zarządzaniu.',
  'Chcesz rozwijać własny region.',
  'Myślisz biznesowo, nie etatowo.',
  'Masz ambicję budować coś większego.',
  'Działasz lub działałeś w OZE, ubezpieczeniach, finansach albo sprzedaży bezpośredniej.',
]

const cooperationSteps = [
  {
    number: '01',
    title: 'Rozwijasz sprzedaż w swoim regionie',
    body: 'Budujesz lokalną obecność i odpowiadasz za rozwój działań tam, gdzie widzisz potencjał.',
  },
  {
    number: '02',
    title: 'Pracujesz z klientem i lub zespołem',
    body: 'Możesz prowadzić sprzedaż samodzielnie albo rozwijać ją razem z ludźmi, których wprowadzasz do działania.',
  },
  {
    number: '03',
    title: 'Budujesz strukturę i skalujesz działania',
    body: 'To nie jest model na pojedyncze transakcje. Chodzi o rozwój regionu, procesu i wyniku.',
  },
]

const cooperationBenefits = [
  { title: 'Gotowy model biznesowy', icon: Handshake },
  { title: 'Dostęp do oferty i produktów', icon: Map },
  { title: 'Wsparcie operacyjne i marketingowe', icon: Users },
  { title: 'Szkolenie i wdrożenie', icon: LineChart },
]

function Field({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  inputMode,
}: {
  label: string
  type?: React.HTMLInputTypeAttribute
  value: string
  onChange: (next: string) => void
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/74">{label}</div>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-brand-gold/60 focus:ring-2 focus:ring-brand-gold/20"
      />
    </label>
  )
}

function CooperationForm() {
  const [lead, setLead] = React.useState<CooperationLeadState>({
    name: '',
    email: '',
    phone: '',
  })
  const [acceptPrivacy, setAcceptPrivacy] = React.useState(false)
  const [acceptContact, setAcceptContact] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = React.useState('')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/cooperation-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lead,
          company: '',
          city: '',
          message: '',
          source: 'wspolpraca-landing-simple',
          consents: {
            acceptPrivacy,
            acceptContact,
          },
        }),
      })

      const json = (await response.json().catch(() => null)) as null | { ok?: boolean; error?: string; message?: string }

      if (!response.ok || !json?.ok) {
        setStatus('error')
        setMessage(json?.error || 'Nie udało się wysłać formularza. Spróbuj ponownie.')
        return
      }

      setStatus('success')
      setMessage(json.message || 'Dziękujemy. Wrócimy do Ciebie z informacją o współpracy.')
    } catch {
      setStatus('error')
      setMessage('Nie udało się wysłać formularza. Spróbuj ponownie.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-[26px] border border-emerald-300/25 bg-emerald-500/10 px-6 py-8 text-center text-white">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90">Formularz wysłany</div>
        <div className="mt-3 text-2xl font-semibold">Dziękujemy za kontakt</div>
        <div className="mt-3 text-sm leading-relaxed text-white/82">{message}</div>
      </div>
    )
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4">
        <Field
          label="Imię"
          value={lead.name}
          onChange={(name) => setLead((state) => ({ ...state, name }))}
          autoComplete="name"
        />
        <Field
          label="Telefon"
          type="tel"
          value={lead.phone}
          onChange={(phone) => setLead((state) => ({ ...state, phone }))}
          autoComplete="tel"
          inputMode="tel"
        />
        <Field
          label="Email"
          type="email"
          value={lead.email}
          onChange={(email) => setLead((state) => ({ ...state, email }))}
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <div className="grid gap-3">
        <label className="flex items-start gap-3">
          <input
            className="mt-0.5 h-4 w-4 rounded border border-white/25 bg-white/10 accent-[#c9a13b]"
            type="checkbox"
            checked={acceptPrivacy}
            onChange={(event) => setAcceptPrivacy(event.target.checked)}
            required
          />
          <span className="text-xs leading-relaxed text-white/80">
            Akceptuję politykę prywatności.
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            className="mt-0.5 h-4 w-4 rounded border border-white/25 bg-white/10 accent-[#c9a13b]"
            type="checkbox"
            checked={acceptContact}
            onChange={(event) => setAcceptContact(event.target.checked)}
            required
          />
          <span className="text-xs leading-relaxed text-white/80">
            Wyrażam zgodę na kontakt telefoniczny i e-mailowy w sprawie współpracy.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(182,132,28,0.28)] transition hover:shadow-[0_22px_40px_rgba(182,132,28,0.34)] disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg,#ebc971,#b6841c)' }}
      >
        {status === 'loading' ? 'Wysyłanie…' : 'Zostaw kontakt'}
      </button>

      {status === 'error' ? <div className="text-sm font-medium text-red-300">{message}</div> : null}
    </form>
  )
}

export function CooperationLanding() {
  return (
    <>
      <Section id="hero" variant="white" aria-label="Współpraca — hero" className="relative overflow-hidden py-14 sm:py-24 lg:py-28">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/grafiki/seal-6-dmi/premium%20przod%202.jpg')" }} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,7,0.82),rgba(7,7,7,0.58)_48%,rgba(7,7,7,0.32))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,161,59,0.22),transparent_36%)]" />
        </div>

        <Container className="relative">
          <div className="max-w-[760px] rounded-[32px] border border-white/12 bg-black/32 px-4 py-5 backdrop-blur-md sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <Badge variant="gold" className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]">
              Partnerstwo regionalne
            </Badge>

            <Heading level={1} className="mt-5 max-w-[18ch] text-[clamp(2rem,8vw,2.75rem)] leading-tight text-white sm:text-4xl lg:text-[44px]">
              Szukamy partnerów do rozwoju sprzedaży.
            </Heading>

            <Text className="mt-4 max-w-[58ch] text-sm font-medium leading-6 text-white/92 sm:text-base sm:leading-relaxed">
              To propozycja dla partnerów biznesowych, nie dla pracowników etatowych. Jeśli masz doświadczenie w sprzedaży, zarządzaniu albo budowie zespołu, możesz wejść w model, który da się rozwijać i skalować.
            </Text>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {heroBenefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-brand-gold/35 bg-white/8 px-4 py-4 text-sm font-semibold leading-relaxed text-white">
                  {benefit}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-brand-gold/25 bg-brand-gold/10 px-4 py-4 text-sm font-semibold leading-relaxed text-brand-goldSoft">
              To współpraca dla osób z doświadczeniem w sprzedaży. Jeśli go nie masz, ta oferta nie jest dla Ciebie.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#kontakt"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(182,132,28,0.28)] transition hover:shadow-[0_22px_40px_rgba(182,132,28,0.34)] sm:w-auto"
                style={{ background: 'linear-gradient(135deg,#ebc971,#b6841c)' }}
              >
                Zostaw kontakt
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="white" aria-label="Współpraca — dla kogo" className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
              <Badge variant="gold">Dla kogo</Badge>
              <Heading level={2} className="mt-4 max-w-[14ch]">Ta współpraca jest dla Ciebie, jeśli:</Heading>
              <Text className="mt-4 max-w-[56ch]">
                Szukamy partnerów, liderów sprzedaży, managerów i właścicieli małych firm, którzy chcą rozwijać własny obszar działania, a nie tylko realizować pojedyncze transakcje.
              </Text>
            </div>

            <div className="grid gap-3">
              {idealPartnerPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-[24px] border border-stroke bg-bg-section px-5 py-4 shadow-card">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />
                  <div className="text-sm font-medium leading-relaxed text-text-primary">{point}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section variant="white" aria-label="Współpraca — model" className="py-16 sm:py-20" style={{ background: 'linear-gradient(180deg,#080808,#14110d)' }}>
        <Container>
          <div className="max-w-[780px]">
            <Badge variant="gold" className="border-brand-gold/20 bg-brand-gold/10 text-brand-goldSoft">Model współpracy</Badge>
            <Heading level={2} className="mt-4 max-w-[14ch] text-white">Prosty model. Jasny kierunek.</Heading>
            <Text className="mt-4 max-w-[60ch] text-white/80">
              To model dla osób, które chcą rozwijać własny region, pracować z klientem i budować większą strukturę sprzedażową.
            </Text>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {cooperationSteps.map((step) => (
              <div key={step.number} className="rounded-[28px] border border-white/10 bg-white/6 px-5 py-6 backdrop-blur-md">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-goldSoft">Krok {step.number}</div>
                <div className="mt-3 text-xl font-semibold text-white">{step.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-white/76">{step.body}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section variant="white" aria-label="Współpraca — korzyści" className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
              <Badge variant="gold">Co otrzymujesz</Badge>
              <Heading level={2} className="mt-4 max-w-[14ch]">Dostajesz fundament do rozwoju.</Heading>
              <Text className="mt-4 max-w-[56ch]">
                Ty koncentrujesz się na sprzedaży, regionie i wyniku. My dajemy zaplecze, model i wsparcie potrzebne do startu.
              </Text>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {cooperationBenefits.map(({ title, icon: Icon }) => (
                <div key={title} className="rounded-[24px] border border-[#d8c7a6]/35 bg-[linear-gradient(180deg,#fffdf9,#f7efe4)] px-5 py-5 shadow-[0_16px_34px_rgba(25,24,21,0.06)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/25 bg-brand-gold/10 text-brand-goldDark">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-text-primary">{title}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section id="kontakt" variant="white" aria-label="Współpraca — kontakt" className="py-16 sm:py-20" style={{ background: 'linear-gradient(180deg,#080808,#14110d)' }}>
        <Container>
          <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-4 backdrop-blur-md sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
              <div>
                <Badge variant="gold" className="border-brand-gold/20 bg-brand-gold/10 text-brand-goldSoft">Zostaw kontakt</Badge>
                <Heading level={2} className="mt-4 max-w-[15ch] text-white">Chcesz rozwijać własny region lub strukturę sprzedażową?</Heading>
                <Text className="mt-4 max-w-[58ch] text-white/82">
                  Jeśli masz doświadczenie w sprzedaży albo zarządzaniu i szukasz modelu, który można realnie rozwijać, zostaw kontakt. Porozmawiajmy, czy to kierunek dla Ciebie.
                </Text>
                <div className="mt-5 rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-4 text-sm font-semibold leading-relaxed text-brand-goldSoft">
                  To oferta dla partnerów, którzy chcą budować biznes, a nie szukają etatu.
                </div>
              </div>

              <CooperationForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}