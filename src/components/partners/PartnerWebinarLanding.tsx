'use client'

import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'

type LeadState = {
  name: string
  email: string
  phone: string
}

const heroBullets = [
  'sprzedaż samochodów premium',
  'model partnerski Velo Prime',
  'finansowanie klientów (14 instytucji)',
  'potencjał nowych marek samochodowych',
]

const forWhoYes = [
  'mają minimum 2 lata doświadczenia w sprzedaży',
  'pracowały w sprzedaży bezpośredniej',
  'budują lub planują budować zespół handlowy',
  'interesuje je sprzedaż produktów premium',
  'chcą działać w swoim regionie',
  'szukają nowego produktu sprzedażowego z dużym potencjałem',
]

const forWhoNo = [
  'nie mają doświadczenia w sprzedaży',
  'szukają jedynie dodatkowej pracy',
  'nie planują rozmawiać z klientami',
  'interesuje je wyłącznie dostęp do oferty bez budowania sprzedaży',
]

function Field({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
  labelTone = 'light',
}: {
  label: string
  value: string
  onChange: (next: string) => void
  type?: React.HTMLInputTypeAttribute
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  labelTone?: 'light' | 'dark'
}) {
  return (
    <label className="block">
      <div className={labelTone === 'dark' ? 'text-xs font-semibold text-white/90' : 'text-xs font-semibold text-neutral-800'}>
        {label}
      </div>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20"
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  )
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 grid gap-2">
      {items.map((label) => (
        <li key={label} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-800">
          <Check className="mt-0.5 h-4 w-4 text-brand-gold" aria-hidden />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative h-full rounded-2xl border border-black/5 overflow-hidden will-change-transform"
      style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand-gold/15 blur-2xl" />
        <div className="absolute inset-0 ring-1 ring-inset ring-brand-gold/10" />
      </div>
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-neutral-700">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" aria-hidden />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function WebinarSignupForm({
  variant,
  initialLead,
}: {
  variant: 'hero' | 'final'
  initialLead?: LeadState
}) {
  const [lead, setLead] = React.useState<LeadState>(initialLead ?? { name: '', email: '', phone: '' })
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState<string>('')
  const tone: 'dark' | 'light' = variant === 'hero' || variant === 'final' ? 'dark' : 'light'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/webinar-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: variant,
        }),
      })

      const json = (await res.json().catch(() => null)) as null | { ok?: boolean; error?: string }

      if (!res.ok || !json?.ok) {
        setStatus('error')
        setErrorMessage(json?.error || 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.')
        return
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage('Nie udało się wysłać zgłoszenia. Spróbuj ponownie.')
    }
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4">
        <Field
          label="Imię"
          value={lead.name}
          onChange={(name) => setLead((s) => ({ ...s, name }))}
          autoComplete="given-name"
          labelTone={tone}
        />
        <Field
          label="Email"
          type="email"
          value={lead.email}
          onChange={(email) => setLead((s) => ({ ...s, email }))}
          autoComplete="email"
          inputMode="email"
          labelTone={tone}
        />
        <Field
          label="Telefon"
          type="tel"
          value={lead.phone}
          onChange={(phone) => setLead((s) => ({ ...s, phone }))}
          autoComplete="tel"
          inputMode="tel"
          labelTone={tone}
        />
      </div>

      <div className="mt-1">
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="inline-flex w-full items-center justify-center font-semibold text-white disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg,#e0b95b,#c79c3c)',
            borderRadius: 10,
            padding: '10px 18px',
          }}
        >
          {status === 'loading' ? 'Wysyłanie…' : status === 'success' ? 'Zapisano' : 'Zarezerwuj miejsce na webinarze'}
        </button>

        <div className={tone === 'dark' ? 'mt-3 text-xs leading-relaxed text-white/70' : 'mt-3 text-xs leading-relaxed text-neutral-600'}>
          Liczba miejsc ograniczona.
          <br />
          Po zapisie otrzymasz szczegóły webinaru oraz link do spotkania.
        </div>

        {status === 'error' ? (
          <div className={tone === 'dark' ? 'mt-3 text-xs font-medium text-red-300' : 'mt-3 text-xs font-medium text-red-600'}>
            {errorMessage}
          </div>
        ) : null}

        {status === 'success' ? (
          <div className={tone === 'dark' ? 'mt-3 text-xs font-medium text-white/90' : 'mt-3 text-xs font-medium text-neutral-800'}>
            Dzięki! Zgłoszenie zapisane. Szczegóły webinaru wyślemy na podany email.
          </div>
        ) : null}
      </div>
    </form>
  )
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 2, rotateY: 2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative rounded-2xl p-6 border border-black/5 overflow-hidden will-change-transform"
      style={{
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-44 w-44 rounded-full bg-brand-gold/12 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
      </div>
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</div>
    </motion.div>
  )
}

export function PartnerWebinarLanding() {
  const reduceMotion = useReducedMotion()
  const enter = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
      }

  return (
    <>
      {/* SECTION 1 — HERO */}
      <Section
        id="hero"
        variant="white"
        aria-label="Webinar — zapis"
        className="scroll-mt-32 relative overflow-hidden min-h-[100svh] flex items-center"
      >
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/grafiki/webinar-hero.png')" }}
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        <div className="relative w-full py-12 md:py-20">
          <Container>
            <div className="mx-auto max-w-[920px]">
              <div className="max-w-[920px]">
                <motion.div
                  {...enter}
                  viewport={{ once: true, amount: 0.6 }}
                  className="relative rounded-2xl border border-brand-gold/55 bg-black/35 backdrop-blur px-6 py-10 sm:px-8 overflow-hidden"
                  style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-brand-gold/18 blur-3xl" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                  </div>

                  <Heading
                    level={1}
                    className="max-w-[34ch] text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-balance"
                  >
                    Zostań partnerem Velo Prime
                    <br />i sprzedawaj samochody premium w swoim regionie
                  </Heading>

                  <div className="mt-6 max-w-[78ch] border-l-2 border-brand-gold/60 pl-4">
                    <Text className="text-[15px] sm:text-base font-medium leading-relaxed text-white/95">
                      Bezpłatny webinar dla osób z doświadczeniem sprzedażowym, które chcą wejść w sprzedaż samochodów
                      elektrycznych i hybrydowych z gotowym produktem, procesem i wsparciem marketingowym.
                    </Text>
                  </div>
                </motion.div>
              </div>
            </div>
          </Container>
        </div>

        <a
          href="#dlaczego"
          aria-label="Przewiń niżej"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition"
        >
          <ChevronDown className="h-6 w-6 animate-bounce" aria-hidden />
        </a>
      </Section>

      {/* HERO — PUNKTY (osobna sekcja, żeby nie nachodziło na mobile) */}
      <Section
        variant="white"
        aria-label="Webinar — punkty"
        className="py-5"
        style={{ background: '#0b0b0b' }}
      >
        <Container>
          <div className="mx-auto max-w-[1100px]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {heroBullets.map((label) => (
                <motion.div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-[15px] font-semibold text-white/90"
                  whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <Check className="mt-0.5 h-5 w-5 text-brand-gold" aria-hidden />
                  <span className="text-balance">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 2 — DLACZEGO */}
      <Section
        id="dlaczego"
        variant="white"
        aria-label="Dlaczego powstał ten webinar"
        className="scroll-mt-32"
        style={{
          background: 'radial-gradient(circle at top, #ffffff, #fafafa)',
        }}
      >
        <Container>
          <motion.div
            {...enter}
            viewport={{ once: true, amount: 0.4 }}
            className="relative max-w-[80ch] rounded-2xl border border-black/5 bg-white p-7 sm:p-8 overflow-hidden"
            style={{ boxShadow: '0 12px 30px rgba(0,0,0,0.05)' }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-28 -right-28 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
              <div className="absolute inset-0 ring-1 ring-inset ring-brand-gold/10" />
            </div>

            <Heading level={2} className="text-balance">
              Dlaczego powstał ten webinar
            </Heading>
            <div className="mt-5 border-l-2 border-brand-gold/50 pl-4">
              <Text className="text-neutral-700 leading-relaxed">
                Rynek nowych marek samochodowych rozwija się w Polsce bardzo dynamicznie.
                <br />
                <br />
                Na rynku pojawiają się producenci tacy jak BYD, Omoda czy Jaecoo, którzy w krótkim czasie zdobywają coraz
                większą rozpoznawalność.
                <br />
                <br />
                Te marki wymagają edukacji klientów i profesjonalnej sprzedaży.
                <br />
                <br />
                Dlatego powstał model partnerstwa Velo Prime — łączący sprzedaż samochodów premium z doświadczeniem
                sprzedażowym partnerów działających w swoich regionach.
                <br />
                <br />
                Podczas webinaru pokażemy jak ten model działa w praktyce.
              </Text>
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* SECTION 3 — DLA KOGO */}
      <Section id="dla-kogo" variant="white" aria-label="Dla kogo jest webinar" className="scroll-mt-32">
        <Container>
          <div className="max-w-[80ch]">
            <Heading level={2}>Dla kogo jest ten webinar</Heading>
            <Text className="mt-3 text-neutral-700">
              Ten webinar jest skierowany do osób, które mają doświadczenie w sprzedaży i szukają nowego produktu lub
              nowego kierunku rozwoju.
              <br />
              <br />
              Jeżeli choć jeden z poniższych punktów brzmi znajomo — ten webinar jest dla Ciebie.
            </Text>
          </div>

          <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-2">
            <motion.div {...enter} viewport={{ once: true, amount: 0.35 }} style={{ perspective: 900 }}>
              <ListCard title="Ten webinar będzie szczególnie wartościowy dla osób, które:" items={forWhoYes} />
            </motion.div>
            <motion.div {...enter} viewport={{ once: true, amount: 0.35 }} style={{ perspective: 900 }}>
              <ListCard title="Ten webinar prawdopodobnie nie będzie odpowiedni dla osób, które:" items={forWhoNo} />
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* SECTION 4 — CTA */}
      <Section
        id="cta"
        variant="white"
        aria-label="CTA przejściowe"
        className="scroll-mt-32 relative overflow-hidden"
      >
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/grafiki/byd-atto-2/premium1.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <Container>
          <motion.div
            {...enter}
            viewport={{ once: true, amount: 0.5 }}
            className="relative mx-auto max-w-[820px] rounded-2xl border border-brand-gold/55 bg-black/35 backdrop-blur p-7 text-center sm:p-10 overflow-hidden"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
            whileHover={reduceMotion ? undefined : { y: -6, rotateX: 2 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-gold/10 blur-3xl" />
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>

            <Heading level={2} className="text-balance text-white">
              Chcesz sprawdzić czy to kierunek dla Ciebie?
            </Heading>
            <div className="mt-6">
              <a
                href="#zapis"
                className="inline-flex items-center justify-center font-semibold text-white shadow-[0_16px_36px_rgba(199,156,60,0.22)] hover:shadow-[0_20px_48px_rgba(199,156,60,0.28)] transition"
                style={{
                  background: 'linear-gradient(135deg,#e0b95b,#c79c3c)',
                  borderRadius: 10,
                  padding: '10px 18px',
                }}
              >
                Zarezerwuj miejsce na webinarze
              </a>
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* SECTION 5 — CO POKAŻĘ */}
      <Section id="co-pokaze" variant="white" aria-label="Co pokażę na webinarze" className="scroll-mt-32">
        <Container>
          <div className="max-w-[80ch]">
            <Heading level={2}>Co pokażę podczas webinaru</Heading>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <InfoCard
              title="Model sprzedaży samochodów premium"
              body="Pokażemy jak działa sprzedaż samochodów w modelu partnerskim."
            />
            <InfoCard
              title="Nowe marki samochodowe w Polsce"
              body="Omówimy rozwój marek takich jak BYD, Omoda czy Jaecoo."
            />
            <InfoCard
              title="Finansowanie klientów"
              body="Wyjaśnimy jak działa finansowanie samochodów przez 14 instytucji finansowych."
            />
            <InfoCard title="Start partnera Velo Prime" body="Pokażemy jak wygląda wdrożenie partnera krok po kroku." />
          </div>
        </Container>
      </Section>

      {/* SECTION 6 — WIARYGODNOŚĆ */}
      <Section id="wiarygodnosc" variant="white" aria-label="Wiarygodność" className="scroll-mt-32" style={{ background: '#fafafa' }}>
        <Container>
          <div className="max-w-[80ch]">
            <Heading level={2}>Projekt oparty na realnym ekosystemie sprzedaży</Heading>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <InfoCard
              title="Współpraca z marką BYD"
              body="Jednym z najszybciej rosnących producentów samochodów elektrycznych."
            />
            <InfoCard title="14 instytucji finansowych" body="Banki i leasingi finansujące zakup samochodów." />
            <InfoCard
              title="Sieć partnerów Velo Prime"
              body="Budujemy ogólnopolską sieć sprzedaży samochodów premium."
            />
          </div>
        </Container>
      </Section>

      {/* SECTION 7 — FINAL CTA */}
      <Section
        id="final"
        variant="white"
        aria-label="Final CTA"
        className="scroll-mt-32 relative overflow-hidden"
      >
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/grafiki/Seal%207/premium%201.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <Container>
          <div className="relative mx-auto py-14" style={{ maxWidth: 900 }}>
            <div
              className="relative rounded-2xl border border-brand-gold/55 bg-black/35 backdrop-blur p-7 sm:p-10 overflow-hidden"
              style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-brand-gold/18 blur-3xl" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>

              <Heading level={2} className="text-white">
                Zarezerwuj miejsce na webinarze Velo Prime
              </Heading>
              <div className="mt-8 max-w-[520px]">
                <WebinarSignupForm variant="final" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
