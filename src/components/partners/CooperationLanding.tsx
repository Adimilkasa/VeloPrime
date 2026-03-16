'use client'

import * as React from 'react'
import {
  BarChart3,
  BriefcaseBusiness,
  Car,
  Check,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Headphones,
  MapPin,
  Megaphone,
  MessagesSquare,
  Rocket,
  Users,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'

type CooperationLeadState = {
  name: string
  email: string
  phone: string
  city: string
  message: string
}

const heroBullets = [
  'współpraca regionalna',
  'sprzedaż samochodów premium',
  'wsparcie operacyjne i marketingowe',
  'bezpośredni kontakt z zespołem Velo Prime',
]

const comparisonCards = [
  {
    title: 'Fotowoltaika w Polsce',
    topYear: '2018',
    topValue: 'około 4 000 instalacji',
    bottomYear: '2019',
    bottomValue: 'ponad 30 000 wniosków w programie Mój Prąd',
    summary: 'Początek jednego z największych boomów instalacyjnych w Polsce.',
  },
  {
    title: 'Nowe marki samochodowe',
    topYear: '2024',
    topValue: 'około 10 000 rejestracji',
    bottomYear: '2025',
    bottomValue: 'ponad 50 000 rejestracji',
    summary: 'Pierwsza fala wzrostu i budowy rynku nowych marek.',
  },
]

const marketSignals = [
  {
    title: 'Najpierw rynek wygląda niszowo',
    body: 'Na początku liczby są jeszcze relatywnie małe, dlatego wiele osób nie dostrzega skali przyszłego wzrostu.',
  },
  {
    title: 'Potem pojawia się gwałtowne przyspieszenie',
    body: 'W krótkim czasie rośnie popyt, rozpoznawalność segmentu i liczba klientów gotowych do zakupu.',
  },
  {
    title: 'Wtedy buduje się przewaga partnerów',
    body: 'Najwięcej zyskują ci, którzy mają już pozycję, proces i lokalną obecność zanim rynek stanie się zatłoczony.',
  },
]

const partnerBenefits = [
  {
    title: 'Dostęp do marek i stocków samochodów',
    body: 'Pracujesz na realnej dostępności i ofertach, które można od razu przekładać na rozmowy sprzedażowe.',
    icon: Car,
  },
  {
    title: 'Materiały sprzedażowe i szkolenia produktowe',
    body: 'Masz gotowe argumenty, prezentacje i uporządkowaną wiedzę produktową potrzebną do rozmowy premium.',
    icon: GraduationCap,
  },
  {
    title: 'Kampania startowa w regionie',
    body: 'Startujesz z przygotowanym kierunkiem działań marketingowych i wejściem na swój rynek lokalny.',
    icon: Megaphone,
  },
  {
    title: 'Proces sprzedaży produktów premium',
    body: 'Działasz na modelu rozmowy i obsługi klienta, który porządkuje sprzedaż i wzmacnia jakość pracy handlowej.',
    icon: BarChart3,
  },
  {
    title: 'Szkolenie wdrożeniowe',
    body: 'Przechodzisz etap wdrożenia, który porządkuje produkt, proces, komunikację i sposób wejścia w sprzedaż.',
    icon: Rocket,
  },
  {
    title: 'System finansowania klientów w 14 instytucjach',
    body: 'Masz dostęp do rozwiązań finansowych, które pozwalają dopasować ofertę do różnych profili klientów.',
    icon: CreditCard,
  },
  {
    title: 'Wsparcie zespołu Velo Prime',
    body: 'Nie działasz sam. Masz zaplecze operacyjne i wsparcie zespołu w kluczowych etapach współpracy.',
    icon: Headphones,
  },
  {
    title: 'Model współpracy dopasowany do sposobu działania',
    body: 'Partnerstwo z Velo Prime może być rozwijane zarówno indywidualnie, jak i w ramach zespołu sprzedażowego — w zależności od doświadczenia, struktury działalności i skali planowanych działań.',
    icon: Users,
  },
  {
    title: 'Rozwój i szkolenia cykliczne',
    body: 'Współpraca nie kończy się na starcie. Otrzymujesz przestrzeń do dalszego rozwoju i aktualizacji kompetencji.',
    icon: BriefcaseBusiness,
  },
]

function Field({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  type?: React.HTMLInputTypeAttribute
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-white/90">{label}</div>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-white/14 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20"
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function CooperationForm() {
  const [lead, setLead] = React.useState<CooperationLeadState>({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  })
  const [acceptPrivacy, setAcceptPrivacy] = React.useState(false)
  const [acceptContact, setAcceptContact] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = React.useState('')

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/cooperation-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lead,
          company: '',
          source: 'wspolpraca-landing',
          consents: {
            acceptPrivacy,
            acceptContact,
          },
        }),
      })

      const json = (await res.json().catch(() => null)) as null | { ok?: boolean; error?: string; message?: string }

      if (!res.ok || !json?.ok) {
        setStatus('error')
        setMessage(json?.error || 'Nie udało się wysłać formularza. Spróbuj ponownie.')
        return
      }

      setStatus('success')
      setMessage(json.message || 'Dziękujemy. Otrzymaliśmy formularz współpracy i wrócimy do Ciebie z kontaktem.')
    } catch {
      setStatus('error')
      setMessage('Nie udało się wysłać formularza. Spróbuj ponownie.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-[24px] border border-emerald-300/30 bg-emerald-500/10 px-6 py-8 text-center text-white shadow-[0_18px_40px_rgba(16,185,129,0.16)]">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90">Formularz wysłany</div>
        <div className="mt-3 text-2xl font-semibold text-white">Dziękujemy za zainteresowanie współpracą</div>
        <div className="mt-4 text-sm leading-relaxed text-white/85">{message}</div>
      </div>
    )
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Imię i nazwisko"
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
        <Field
          label="Miasto / region"
          value={lead.city}
          onChange={(city) => setLead((state) => ({ ...state, city }))}
          autoComplete="address-level2"
        />
      </div>

      <label className="block">
        <div className="text-xs font-semibold text-white/90">Wiadomość (opcjonalnie)</div>
        <textarea
          className="mt-2 min-h-[120px] w-full rounded-xl border border-white/14 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-brand-gold/70 focus:ring-2 focus:ring-brand-gold/20"
          value={lead.message}
          onChange={(event) => setLead((state) => ({ ...state, message: event.target.value }))}
          placeholder=""
        />
      </label>

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
            Akceptuję <a className="underline decoration-brand-gold/60 underline-offset-2" href="/polityka-prywatnosci">politykę prywatności</a>.
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
            Wyrażam zgodę na kontakt e-mail i telefoniczny w sprawie współpracy z Velo Prime.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex w-full items-center justify-center font-semibold text-white disabled:opacity-70"
        style={{
          background: 'linear-gradient(135deg,#ebc971,#b6841c)',
          borderRadius: 14,
          padding: '12px 18px',
          boxShadow: '0 16px 34px rgba(182,132,28,0.28)',
        }}
      >
        {status === 'loading' ? 'Wysyłanie…' : 'Wyślij formularz współpracy'}
      </button>

      <div className="text-xs leading-relaxed text-white/70">
        Formularz trafia bezpośrednio do naszego zespołu. Po analizie zgłoszenia wrócimy do Ciebie z informacją o możliwym kierunku współpracy.
      </div>

      {status === 'error' ? <div className="text-xs font-medium text-red-300">{message}</div> : null}
    </form>
  )
}

function FeatureCard({
  title,
  body,
  icon: Icon,
}: {
  title: string
  body: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative overflow-hidden rounded-[24px] border border-[#d8c7a6]/35 p-6 will-change-transform"
      style={{
        background: 'linear-gradient(180deg,#fffdf9,#f7efe4)',
        boxShadow: '0 16px 34px rgba(25,24,21,0.06)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-44 w-44 rounded-full bg-brand-gold/14 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
      </div>
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/25 bg-brand-gold/10 text-brand-gold">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-4 text-lg font-semibold text-neutral-900">{title}</div>
        <div className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</div>
      </div>
    </motion.div>
  )
}

export function CooperationLanding() {
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
      <Section id="hero" variant="white" aria-label="Współpraca — start" className="scroll-mt-32 relative overflow-hidden min-h-[68svh] flex items-center">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/grafiki/seal-6-dmi/premium%20przod%202.jpg')" }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,161,59,0.22),transparent_35%)]" />
        </div>

        <div className="relative w-full py-8 md:py-12">
          <Container>
            <div className="mx-auto max-w-[1180px]">
              <div className="max-w-[820px]">
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
                    Współpraca Velo Prime
                  </div>

                  <Heading level={1} className="mt-5 max-w-[20ch] text-balance text-3xl leading-tight text-white sm:text-4xl md:text-5xl lg:text-[42px]">
                    Rozwijaj sprzedaż samochodów premium w swoim regionie we współpracy z Velo Prime
                  </Heading>

                  <div className="mt-5 max-w-[72ch] border-l-2 border-brand-gold/60 pl-4">
                    <Text className="text-[15px] sm:text-base font-medium leading-relaxed text-white/95">
                      Budujemy sieć partnerów, którzy chcą rozwijać sprzedaż nowych marek samochodowych w oparciu o realny model działania, wsparcie operacyjne i marketingowe.
                    </Text>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {heroBullets.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur">
                        <Check className="mt-0.5 h-5 w-5 text-brand-gold" aria-hidden />
                        <div className="text-sm font-medium leading-relaxed text-brand-goldSoft">{item}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </Container>
        </div>

        <a href="#dlaczego" aria-label="Przewiń niżej" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition">
          <ChevronDown className="h-6 w-6 animate-bounce" aria-hidden />
        </a>
      </Section>

      <Section variant="white" aria-label="Współpraca — wyróżniki" className="py-3" style={{ background: 'linear-gradient(180deg,#060606,#120f0a)' }}>
        <Container>
          <div className="mx-auto max-w-[1100px]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {heroBullets.map((label) => (
                <motion.div
                  key={label}
                  className="flex items-start gap-3 rounded-[22px] border border-brand-gold/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-5 py-3 text-[15px] font-semibold text-brand-goldSoft"
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

      <Section
        id="moment-wzrostu"
        variant="white"
        aria-label="Moment wzrostu rynku"
        className="scroll-mt-32"
        style={{ background: 'radial-gradient(circle at top, #fbf7f0, #f2e9db)' }}
      >
        <Container>
          <div className="mx-auto max-w-[1080px]">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start">
              <div className="max-w-[86ch]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Moment rynku</div>
                <Heading level={2} className="mt-3 max-w-[18ch]">Każdy rynek ma swój moment wzrostu</Heading>
                <div className="mt-5 max-w-[78ch] space-y-4 border-l-2 border-brand-gold/50 pl-4">
                  <Text className="text-neutral-700 leading-relaxed">
                    Wiele rynków wygląda podobnie na początku: najpierw wydają się niszowe, później gwałtownie przyspieszają i dopiero wtedy staje się jasne, kto zajął właściwą pozycję odpowiednio wcześnie.
                  </Text>
                  <Text className="text-neutral-700 leading-relaxed">
                    Dokładnie taki schemat widzieliśmy wcześniej w fotowoltaice. Dziś bardzo podobny moment widać w rynku nowych marek samochodowych, który przechodzi z etapu wczesnego wejścia w etap wyraźnego wzrostu.
                  </Text>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-[#d8c7a6]/35 bg-[linear-gradient(180deg,#fffdfa,#f6efe3)] p-6 sm:p-7 shadow-[0_18px_42px_rgba(20,20,20,0.07)]">
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-brand-gold/12 blur-3xl" />
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
                </div>

                <div className="relative">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a21]">Jak wygląda taki moment</div>
                  <div className="mt-5 space-y-4">
                    {marketSignals.map((signal, index) => (
                      <div key={signal.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 rounded-[20px] border border-[#e4d7c2] bg-white/70 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/25 bg-brand-gold/10 text-sm font-semibold text-[#8b6a21]">
                          0{index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold leading-snug text-neutral-900">{signal.title}</div>
                          <div className="mt-2 text-sm leading-relaxed text-neutral-600">{signal.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {comparisonCards.map((card) => (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="relative overflow-hidden rounded-[24px] border border-[#d8c7a6]/35 p-6 will-change-transform"
                  style={{
                    background: 'linear-gradient(180deg,#fffdfa,#f6efe3)',
                    boxShadow: '0 18px 40px rgba(25,24,21,0.08)',
                  }}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand-gold/14 blur-2xl" />
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
                  </div>

                  <div className="relative">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8b6a21]">{card.title}</div>
                    <div className="mt-3 text-sm leading-relaxed text-neutral-600">{card.summary}</div>

                    <div className="mt-6 grid gap-3 rounded-[20px] border border-[#e6dccd] bg-white/70 p-4 sm:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] sm:items-center sm:p-5">
                      <div className="rounded-[18px] border border-[#ece2d1] bg-white/80 px-4 py-4">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{card.topYear}</div>
                        <div className="mt-2 text-xl font-semibold leading-tight text-neutral-900">{card.topValue}</div>
                      </div>

                      <div className="text-center text-2xl font-light text-brand-gold">→</div>

                      <div className="rounded-[18px] border border-[#ece2d1] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(20,20,20,0.04)]">
                        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-500">{card.bottomYear}</div>
                        <div className="mt-2 text-xl font-semibold leading-tight text-neutral-900">{card.bottomValue}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-[28px] border border-[#d8c7a6]/35 bg-[#1a1510] p-7 text-white shadow-[0_18px_42px_rgba(20,20,20,0.12)] sm:p-8">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-goldSoft">Moment przewagi</div>
                <Heading level={3} className="mt-3 text-white">Rynek przestał być niszą i rośnie dziś w wyraźnej skali. To właśnie ten moment. Nie przegap go.</Heading>
              </div>

              <div className="rounded-[28px] border border-[#d8c7a6]/35 bg-[linear-gradient(180deg,#fffdfa,#f6efe3)] p-7 sm:p-8 shadow-[0_18px_42px_rgba(20,20,20,0.07)]">
                <Text className="max-w-[82ch] text-neutral-700 leading-relaxed">
                  Największe możliwości pojawiają się zwykle wtedy, gdy rynek nie jest jeszcze nasycony, ale jego kierunek wzrostu jest już wyraźny. To etap wczesnego, ale już dynamicznego wzrostu — moment, w którym tworzy się popyt, rozpoznawalność i przewaga dla tych, którzy wchodzą odpowiednio wcześnie.
                </Text>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section
        id="co-otrzymuje-partner"
        variant="white"
        aria-label="Co otrzymuje partner"
        className="scroll-mt-32 relative overflow-hidden"
      >
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/grafiki/Seal%207/premium%202.jpg')" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,161,59,0.18),transparent_26%)]" />
        </div>

        <Container>
          <div className="relative mx-auto max-w-[980px]">
            <div className="inline-flex">
              <Badge variant="gold">Zaplecze współpracy</Badge>
            </div>

            <Card className="mt-5 rounded-2xl border-brand-gold/55 bg-black/35 p-6 backdrop-blur sm:p-7 lg:p-8">
              <Heading level={2} className="max-w-[26ch] text-white">
                Co otrzymuje partner
              </Heading>
              <Text className="mt-4 max-w-[78ch] text-white/90">
                Współpraca nie opiera się wyłącznie na samym produkcie. Partner otrzymuje konkretne narzędzia, proces i zaplecze operacyjne, które pozwalają wejść w sprzedaż w sposób uporządkowany i jakościowy.
              </Text>
              <Text className="mt-3 max-w-[78ch] text-sm text-white lg:text-base">
                To model zbudowany tak, aby można było wejść w działania sprzedażowe z odpowiednim wsparciem, materiałami i strukturą pracy.
              </Text>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {partnerBenefits.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      viewport={{ once: true, amount: 0.22 }}
                      transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.03 }}
                      className="relative overflow-hidden rounded-2xl border border-white/14 bg-white/[0.06] p-5"
                    >
                      <div aria-hidden className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/55 to-transparent" />
                        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-gold/12 blur-3xl" />
                      </div>

                      <div className="relative flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-gold/25 bg-brand-gold/10 text-brand-goldSoft">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-goldSoft/90">
                            {(index + 1).toString().padStart(2, '0')}
                          </div>
                          <div className="mt-2 text-base font-semibold leading-snug text-brand-goldSoft">
                            {item.title}
                          </div>
                          <div className="mt-2 text-sm leading-relaxed text-white">
                            {item.body}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-8 border-t border-white/10 pt-5 text-sm leading-relaxed text-white">
                Każdy z tych elementów ma wspierać partnera nie tylko na starcie, ale też w dalszym rozwoju działań sprzedażowych w regionie.
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <Section id="kontakt" variant="white" aria-label="CTA współpracy" className="scroll-mt-32 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/grafiki/byd-atto-2/premium1.jpg')" }} />
        </div>

        <Container>
          <div className="relative mx-auto max-w-[1100px] py-14">
            <div className="relative overflow-hidden rounded-2xl border border-brand-gold/55 bg-black/35 p-7 backdrop-blur sm:p-10" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-gold/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>

              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-start">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-goldSoft">
                    <MessagesSquare className="h-4 w-4" />
                    Formularz kontaktu
                  </div>
                  <Heading level={2} className="mt-4 max-w-[18ch] text-balance text-white">
                    Zostań partnerem Velo Prime
                  </Heading>
                  <Text className="mt-4 text-white">
                    Jeśli widzisz potencjał do współpracy w swoim regionie, zostaw kontakt.
                  </Text>
                  <Text className="mt-3 text-white">
                    Formularz trafia bezpośrednio do naszego zespołu, na Discord oraz do arkusza operacyjnego, dzięki czemu możemy bardzo szybko się z Tobą skontaktować i omówić możliwe kierunki współpracy w ramach Velo Prime.
                  </Text>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm sm:p-5">
                  <CooperationForm />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}