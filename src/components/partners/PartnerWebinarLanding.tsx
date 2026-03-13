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

const heroStats = [
  { label: 'Format', value: 'Bezpłatny webinar online' },
  { label: 'Dla kogo', value: 'Sprzedaż premium i liderzy zespołów' },
  { label: 'Cel', value: 'Ocena dopasowania do modelu partnerstwa' },
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
  const inputClassName =
    labelTone === 'dark'
      ? 'mt-2 h-11 w-full rounded-xl border border-white/14 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20'
      : 'mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20'

  return (
    <label className="block">
      <div className={labelTone === 'dark' ? 'text-xs font-semibold text-white/90' : 'text-xs font-semibold text-neutral-800'}>
        {label}
      </div>
      <input
        className={inputClassName}
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
      className="relative h-full overflow-hidden rounded-[24px] border border-[#d8c7a6]/40 will-change-transform"
      style={{
        background: 'linear-gradient(180deg,#fffdfa,#f6efe3)',
        borderRadius: 24,
        padding: 30,
        boxShadow: '0 18px 40px rgba(25,24,21,0.08)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand-gold/18 blur-2xl" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
      </div>
      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8b6a21]">{title}</div>
      <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-neutral-700">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold shadow-[0_0_12px_rgba(201,161,59,0.55)]" aria-hidden />
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
            background: 'linear-gradient(135deg,#ebc971,#b6841c)',
            borderRadius: 14,
            padding: '12px 18px',
            boxShadow: '0 16px 34px rgba(182,132,28,0.28)',
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
      className="relative overflow-hidden rounded-[24px] border border-[#d8c7a6]/35 p-6 will-change-transform"
      style={{
        background: 'linear-gradient(180deg,#fffdf9,#f7efe4)',
        borderRadius: 24,
        boxShadow: '0 16px 34px rgba(25,24,21,0.06)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-44 w-44 rounded-full bg-brand-gold/14 blur-2xl" />
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
        className="scroll-mt-32 relative overflow-hidden min-h-[62svh] flex items-center"
      >
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/grafiki/Seal%207/premium%202.jpg')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.88)_0%,rgba(5,5,5,0.72)_48%,rgba(5,5,5,0.42)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,161,59,0.24),transparent_35%)]" />
        </div>

        <div className="relative w-full py-6 md:py-10">
          <Container>
            <div className="mx-auto max-w-[1180px]">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-end">
                <motion.div
                  {...enter}
                  viewport={{ once: true, amount: 0.6 }}
                  className="relative overflow-hidden rounded-[30px] border border-brand-gold/45 bg-black/30 px-6 py-6 backdrop-blur-md sm:px-8 lg:px-10"
                  style={{ boxShadow: '0 28px 80px rgba(0,0,0,0.22)' }}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 -right-28 h-72 w-72 rounded-full bg-brand-gold/22 blur-3xl" />
                    <div className="absolute left-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-brand-gold/50 to-transparent" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                  </div>

                  <div className="inline-flex items-center rounded-full border border-brand-gold/35 bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-goldSoft">
                    Webinar Velo Prime
                  </div>

                  <Heading
                    level={1}
                    className="mt-5 max-w-[18ch] text-balance text-3xl leading-tight text-white sm:text-4xl md:text-5xl lg:text-[42px]"
                  >
                    Wejdź do sprzedaży premium z modelem partnerstwa Velo Prime
                  </Heading>

                  <div className="mt-5 max-w-[72ch] border-l-2 border-brand-gold/60 pl-4">
                    <Text className="text-[15px] sm:text-base font-medium leading-relaxed text-white/95">
                      Bezpłatny webinar dla osób z doświadczeniem sprzedażowym, które chcą wejść w nowy segment rynku z gotowym produktem, procesem współpracy i wsparciem marketingowym.
                    </Text>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {heroStats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur"
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-goldSoft/90">
                          {item.label}
                        </div>
                        <div className="mt-2 text-sm font-medium leading-relaxed text-white/92">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/78">
                    <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2">samochody premium</span>
                    <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2">partnerstwo regionalne</span>
                    <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2">sprzedaż i finansowanie</span>
                  </div>
                </motion.div>

                <motion.div
                  {...enter}
                  viewport={{ once: true, amount: 0.45 }}
                  className="relative overflow-hidden rounded-[30px] border border-brand-gold/45 bg-[linear-gradient(180deg,rgba(10,10,10,0.86),rgba(20,16,10,0.88))] p-5 backdrop-blur md:p-6"
                  style={{ boxShadow: '0 28px 90px rgba(0,0,0,0.26)' }}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-gold/20 blur-3xl" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                  </div>

                  <div className="relative">
                    <div className="inline-flex items-center rounded-full border border-brand-gold/25 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-goldSoft">
                      Rezerwacja miejsca
                    </div>
                    <Heading level={2} className="mt-4 text-[28px] leading-tight text-white sm:text-[32px]">
                      Zarezerwuj miejsce na najbliższy webinar
                    </Heading>
                    <Text className="mt-3 text-sm leading-relaxed text-white/78">
                      Otrzymasz szczegóły spotkania, link do webinaru i informację, jak wygląda kolejny etap wejścia do programu partnerskiego.
                    </Text>

                    <div className="mt-5 rounded-[22px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                      <WebinarSignupForm variant="hero" />
                    </div>
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
        className="py-3"
        style={{ background: 'linear-gradient(180deg,#060606,#120f0a)' }}
      >
        <Container>
          <div className="mx-auto max-w-[1100px]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {heroBullets.map((label) => (
                <motion.div
                  key={label}
                  className="flex items-start gap-3 rounded-[22px] border border-brand-gold/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-5 py-3 text-[15px] font-semibold text-white/90"
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
          background: 'radial-gradient(circle at top, #fbf7f0, #f2e9db)',
        }}
      >
        <Container>
          <motion.div
            {...enter}
            viewport={{ once: true, amount: 0.4 }}
            className="relative max-w-[88ch] overflow-hidden rounded-[28px] border border-[#d9c8a7]/35 bg-[linear-gradient(180deg,#fffdfa,#f6efe3)] p-7 sm:p-8"
            style={{ boxShadow: '0 18px 42px rgba(20,20,20,0.07)' }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-28 -right-28 h-64 w-64 rounded-full bg-brand-gold/12 blur-3xl" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/55" />
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Rynek i model</div>
            <Heading level={2} className="mt-3 text-balance">
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
      <Section id="dla-kogo" variant="white" aria-label="Dla kogo jest webinar" className="scroll-mt-32" style={{ background: 'linear-gradient(180deg,#0b0b0b,#14110c)' }}>
        <Container>
          <div className="max-w-[80ch]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-goldSoft">Dopasowanie</div>
            <Heading level={2} className="mt-3 text-white">Dla kogo jest ten webinar</Heading>
            <Text className="mt-3 text-white/76">
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
      <Section id="co-pokaze" variant="white" aria-label="Co pokażę na webinarze" className="scroll-mt-32" style={{ background: 'radial-gradient(circle at top, #fbf7f0, #f3eadc)' }}>
        <Container>
          <div className="max-w-[80ch]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Agenda</div>
            <Heading level={2} className="mt-3">Co pokażę podczas webinaru</Heading>
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
      <Section id="wiarygodnosc" variant="white" aria-label="Wiarygodność" className="scroll-mt-32" style={{ background: '#f8f2e8' }}>
        <Container>
          <div className="max-w-[80ch]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Wiarygodność</div>
            <Heading level={2} className="mt-3">Projekt oparty na realnym ekosystemie sprzedaży</Heading>
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
