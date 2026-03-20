'use client'

import * as React from 'react'
import {
  BarChart3,
  Car,
  Check,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Headphones,
  Megaphone,
  Presentation,
  Rocket,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PartnerSignupModal } from '@/components/modals/PartnerSignupModal'

type Feature = {
  title: string
  description: string
  badge?: string
}

type NavItem = {
  id: string
  label: string
}

const heroHighlights = [
  'sprzedaż samochodów premium',
  'szkolenie i wdrożenie',
  'kampania startowa w regionie',
  'wsparcie sprzedaży',
]

const forYou = [
  'masz doświadczenie w sprzedaży',
  'prowadzisz zespół handlowy',
  'chcesz sprzedawać produkt premium',
  'chcesz rozwijać sprzedaż w swoim regionie',
]

const notForYou = [
  'szukasz tylko dostępu do oferty',
  'nie chcesz pracować z klientem',
  'traktujesz sprzedaż okazjonalnie',
  "szukasz produktu 'na próbę' bez wdrożenia i procesu",
]

const features: Feature[] = [
  {
    title: 'Dostęp do marek i stocków samochodów',
    description: 'Pracujesz na aktualnej dostępności i konfiguracjach — klient widzi realną ofertę tu i teraz.',
    badge: 'Najczęściej doceniane',
  },
  {
    title: 'Materiały sprzedażowe i szkolenia produktowe',
    description: 'Masz gotowe argumenty, prezentacje i standard rozmowy — łatwiej utrzymać jakość premium.',
  },
  {
    title: 'Kampania startowa w regionie',
    description: 'Startujesz z planem działań — marketing rusza, a Ty wchodzisz w rozmowy przygotowany.',
    badge: 'Najczęściej doceniane',
  },
  {
    title: 'Proces sprzedaży produktów premium (5 punktów sprzedaży)',
    description: 'Spójny proces rozmowy i domknięcia — mniej improwizacji, więcej kontroli nad sprzedażą.',
  },
  {
    title: 'Dwutygodniowe szkolenie wdrożeniowe',
    description: 'Onboarding krok po kroku: produkt, finansowanie, leady, komunikacja i standard obsługi premium.',
  },
  {
    title: 'System finansowania klientów (14 instytucji finansowych)',
    description: 'Banki, leasing i instytucje pozabankowe — dopasowanie pod różne profile klienta.',
    badge: 'Najczęściej doceniane',
  },
  {
    title: 'Wsparcie zespołu Velo Prime',
    description: 'Masz wsparcie operacyjne i doradcze w kluczowych momentach — nie zostajesz sam z tematem.',
  },
  {
    title: 'Możliwość pracy solo lub zespołowo',
    description: 'Dopasowujesz sposób działania do siebie — solo, w duecie lub zespołowo, bez utraty standardu.',
  },
  {
    title: 'Rozwój i szkolenia cykliczne',
    description: 'Regularne aktualizacje i praca na case’ach — utrzymujesz tempo i jakość sprzedaży.',
  },
]

type TimelineStep = {
  step: number
  title: string
  body: string
  bullets?: string[]
}

const timeline: TimelineStep[] = [
  {
    step: 1,
    title: 'Wybierasz wariant partnerstwa',
    body: 'Solo / Duo / Team',
  },
  {
    step: 2,
    title: 'Wybierasz formę płatności',
    body: 'Jednorazowo lub raty',
  },
  {
    step: 3,
    title: 'Onboarding i konfiguracja współpracy',
    body: 'Ustalamy zasady i konfigurujemy proces działania w Twoim regionie.',
    bullets: ['konfiguracja regionu', 'narzędzia i materiały', 'przygotowanie kampanii startowej'],
  },
  {
    step: 4,
    title: 'Dwutygodniowe szkolenie',
    body: 'Przechodzisz przez program wdrożeniowy i narzędzia sprzedażowe.',
    bullets: [
      'szkolenie produktowe BYD',
      'system finansowania (14 instytucji)',
      'spotkanie online z przedstawicielem marki',
      'sprzedaż premium (5 punktów sprzedaży)',
    ],
  },
  {
    step: 5,
    title: 'Start działań sprzedażowych',
    body: 'Kampania marketingowa + wsparcie operacyjne.',
    bullets: ['kampania marketingowa', 'wsparcie operacyjne'],
  },
]

type StartStep = {
  step: number
  title: string
  description: string
}

const startSteps: StartStep[] = [
  { step: 1, title: 'Rejestracja partnerstwa', description: 'Wybierasz pakiet i rejestrujesz współpracę.' },
  { step: 2, title: 'Dwutygodniowe wdrożenie', description: 'Przechodzisz onboarding i uczysz się procesu premium.' },
  { step: 3, title: 'Konfiguracja działań w regionie', description: 'Ustalamy region i uruchamiamy przygotowane działania.' },
  { step: 4, title: 'Start sprzedaży', description: 'Kampania + wsparcie operacyjne — zaczynasz domykać rozmowy.' },
]

type Plan = {
  name: 'SOLO' | 'DUO' | 'TEAM'
  amount: number
  includes: string[]
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: 'SOLO',
    amount: 2490,
    includes: ['szkolenie', 'materiały sprzedażowe', 'wsparcie wdrożeniowe', 'kampania startowa'],
  },
  {
    name: 'DUO',
    amount: 3990,
    includes: [
      'szkolenie dla dwóch osób',
      'materiały sprzedażowe',
      'wsparcie wdrożeniowe',
      'kampania marketingowa',
    ],
    featured: true,
  },
  {
    name: 'TEAM',
    amount: 4990,
    includes: [
      'szkolenie zespołu',
      'materiały sprzedażowe',
      'wsparcie wdrożeniowe',
      'kampania ustalana indywidualnie (większy zakres)',
    ],
  },
]

function formatPlanPrice(amount: number, paymentMode: 'one' | 'installments', installmentMonths: number) {
  if (paymentMode === 'one') return `${amount} zł`

  const installmentValue = Math.round(amount / installmentMonths)
  return `${installmentMonths} x ${installmentValue} zł`
}

type FaqItem = {
  q: string
  a: string
}

const faq: FaqItem[] = [
  {
    q: 'Czy to franczyza?',
    a: 'Nie. To program partnerski z procesem sprzedaży i wdrożeniem — bez modelu franczyzowego.',
  },
  {
    q: 'Czy można płacić w ratach?',
    a: 'Tak. Wariant płatności (jednorazowo lub raty) wybierasz na etapie rozpoczęcia współpracy.',
  },
  {
    q: 'Czy trzeba mieć działalność?',
    a: 'Docelowy model współpracy dopasowujemy do Twojej sytuacji. Omówimy to w trakcie onboardingu.',
  },
  {
    q: 'Czy to jest na wyłączność terytorialną?',
    a: 'Nie zakładamy wyłączności na start. Przy rozwoju regionu — warunki ustalane indywidualnie.',
  },
  {
    q: 'Czy muszę mieć B2B?',
    a: 'Preferowane B2B, ale mamy rozwiązania także dla osób fizycznych.',
  },
  {
    q: 'Jak wygląda szkolenie?',
    a: 'Szkolenie trwa 2 tygodnie i obejmuje produkt, finansowanie, proces rozmowy oraz standard obsługi klienta premium.',
  },
  {
    q: 'Co obejmuje opłata?',
    a: 'Opłata obejmuje wdrożenie, szkolenie, narzędzia sprzedażowe i start działań w regionie.',
  },
  {
    q: 'Czy są regiony sprzedaży?',
    a: 'Tak — działamy w modelu regionalnym. Zakres ustalamy indywidualnie w trakcie konfiguracji współpracy.',
  },
]

const navItems: NavItem[] = [
  { id: 'hero', label: 'Start' },
  { id: 'dla-kogo', label: 'Dla kogo' },
  { id: 'co-otrzymujesz', label: 'Co otrzymujesz' },
  { id: 'wspolpraca', label: 'Współpraca' },
  { id: 'dlaczego-platne', label: 'Dlaczego płatne' },
  { id: 'start-partnera', label: 'Start partnera' },
  { id: 'pakiety', label: 'Pakiety' },
  { id: 'podsumowanie', label: 'Podsumowanie' },
  { id: 'faq', label: 'FAQ' },
  { id: 'cta', label: 'CTA' },
]

function PartnerSectionNav({ items }: { items: NavItem[] }) {
  return (
    <div className="sticky top-16 z-40 border-b border-stroke bg-bg-section/85 backdrop-blur">
      <Container>
        <nav aria-label="Sekcje" className="flex gap-2 overflow-x-auto py-2.5 no-scrollbar sm:py-3">
          {items.map((it) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="shrink-0 rounded-full border border-stroke bg-bg-section px-3 py-2 text-[11px] font-medium text-text-secondary transition hover:text-text-primary hover:bg-bg-primary sm:px-4 sm:text-xs"
            >
              {it.label}
            </a>
          ))}
        </nav>
      </Container>
    </div>
  )
}

function StickyPartnerCTA() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const heroEl = document.getElementById('hero')

    const computeThreshold = () => {
      const heroHeight = heroEl?.offsetHeight ?? window.innerHeight
      return Math.max(0, heroHeight - 20)
    }

    let threshold = computeThreshold()

    const onScroll = () => setVisible(window.scrollY > threshold)
    const onResize = () => {
      threshold = computeThreshold()
      onScroll()
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden sm:block" style={{ width: 280 }}>
      <div
        className={`transition-all duration-300 ease-out will-change-transform ${
          visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-5'
        }`}
        style={{
          background: '#ffffff',
          borderRadius: 14,
          boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
          padding: '12px 16px',
        }}
      >
        <div className="text-xs font-semibold text-neutral-900">Partnerstwo Velo Prime</div>
        <div className="text-xs text-neutral-600">Program po webinarze</div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <a
            href="#pakiety"
            className="text-xs font-medium text-neutral-700 hover:text-neutral-900 underline-offset-4 hover:underline transition"
          >
            Zobacz pakiety
          </a>

          <a
            href="#pakiety"
            className="shrink-0 text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg,#e0b95b,#c79c3c)',
              borderRadius: 10,
              padding: '10px 18px',
            }}
          >
            Rozpocznij partnerstwo
          </a>
        </div>
      </div>
    </div>
  )
}

function BulletList({ items, variant = 'light' }: { items: string[]; variant?: 'light' | 'dark' }) {
  const itemClassName =
    variant === 'dark'
      ? 'flex items-start gap-3 rounded-2xl border border-brand-gold/45 bg-black/30 backdrop-blur px-4 py-4'
      : 'flex items-start gap-3 rounded-2xl border border-stroke bg-bg-section p-4'

  const textClassName = variant === 'dark' ? 'text-sm leading-relaxed text-white/90' : 'text-sm leading-relaxed text-text-secondary'

  return (
    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((label) => (
        <li key={label} className={itemClassName}>
          <Check className="mt-0.5 h-4 w-4 text-brand-goldSoft" aria-hidden />
          <span className={textClassName}>{label}</span>
        </li>
      ))}
    </ul>
  )
}

function IconPlaceholder() {
  return (
    <div
      aria-hidden
      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stroke bg-bg-soft"
    />
  )
}

function FeatureIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stroke bg-bg-soft">
      <span className="text-brand-goldDark">{icon}</span>
    </div>
  )
}

function getFeatureIcon(title: string) {
  switch (title) {
    case 'Dostęp do marek i stocków samochodów':
      return <Car className="h-5 w-5" aria-hidden />
    case 'Materiały sprzedażowe i szkolenia produktowe':
      return <Presentation className="h-5 w-5" aria-hidden />
    case 'Kampania startowa w regionie':
      return <Megaphone className="h-5 w-5" aria-hidden />
    case 'Proces sprzedaży produktów premium (5 punktów sprzedaży)':
      return <BarChart3 className="h-5 w-5" aria-hidden />
    case 'Dwutygodniowe szkolenie wdrożeniowe':
      return <GraduationCap className="h-5 w-5" aria-hidden />
    case 'System finansowania klientów (14 instytucji finansowych)':
      return <CreditCard className="h-5 w-5" aria-hidden />
    case 'Wsparcie zespołu Velo Prime':
      return <Headphones className="h-5 w-5" aria-hidden />
    case 'Możliwość pracy solo lub zespołowo':
      return <Users className="h-5 w-5" aria-hidden />
    case 'Rozwój i szkolenia cykliczne':
      return <Rocket className="h-5 w-5" aria-hidden />
    default:
      return null
  }
}
        <div className="text-xs font-semibold text-neutral-900">Partnerstwo Velo Prime</div>
function AudienceCard({ title, items, goldBorder = false }: { title: string; items: string[]; goldBorder?: boolean }) {
  return (
    <Card
      className={
        'relative overflow-hidden rounded-2xl p-6 bg-bg-section/80 backdrop-blur border shadow-card ' +
        (goldBorder ? 'border-brand-gold/25' : 'border-stroke')
      }
    >
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-gold/45 to-transparent" />
      </div>

      <Heading level={3} className="relative text-xl">
        {title}
      </Heading>
      <ul className="relative mt-5 space-y-3">
        {items.map((label) => (
          <li key={label} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
            <div aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-gold" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function FeatureCard({ title, description }: Feature) {
  const icon = getFeatureIcon(title)

  return (
    <Card
      className="relative overflow-hidden rounded-2xl p-6 flex h-full flex-col bg-bg-section/80 backdrop-blur border border-stroke shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-[250ms] ease-out hover:-translate-y-[5px] hover:shadow-[0_22px_60px_rgba(0,0,0,0.10)] hover:border-brand-gold/45"
    >
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl opacity-70" />
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-gold/35 to-transparent opacity-70" />
      </div>
      <div className="relative flex items-start gap-4">
        {icon ? <FeatureIcon icon={icon} /> : <IconPlaceholder />}
        <div className="min-w-0">
          <Heading level={3} className="text-base sm:text-lg font-semibold leading-snug line-clamp-2 min-h-[44px]">
            {title}
          </Heading>
          <Text variant="muted" className="mt-2">
            {description}
          </Text>
        </div>
      </div>
    </Card>
  )
}

function TimelineCard({ step, title, body, bullets }: TimelineStep) {
  return (
    <Card className="rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stroke bg-bg-soft text-sm font-semibold text-text-primary">
          {step}
        </div>
        <div className="min-w-0">
          <Heading level={3} className="text-xl">
            {title}
          </Heading>
          <Text variant="muted" className="mt-2">
            {body}
          </Text>
          {bullets?.length ? (
            <ul className="mt-4 space-y-2">
              {bullets.map((label) => (
                <li key={label} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 text-brand-goldDark" aria-hidden />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

function ProcessStepCard({ index, step, title, body, bullets }: { index: number } & TimelineStep) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.08 }}
      className="relative mx-auto w-full max-w-[300px] min-w-0 pt-6"
    >
      {/* Dot (mobile: left; desktop: centered) */}
      <div
        aria-hidden
        className="absolute top-0 left-4 flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/65 bg-bg-section/80 backdrop-blur text-sm font-semibold text-text-primary shadow-card xl:left-1/2 xl:-translate-x-1/2"
      >
        {step}
      </div>

      <Card className="min-w-0 rounded-2xl p-6 pt-8 sm:p-7 sm:pt-9 bg-bg-section/70 backdrop-blur-lg overflow-hidden">
        <Heading level={3} className="text-[15px] sm:text-base break-normal text-balance">
          {title}
        </Heading>
        <Text variant="muted" className="mt-2 break-words">
          {body}
        </Text>

        {bullets?.length ? (
          <ul className="mt-4 space-y-2">
            {bullets.map((label) => (
              <li key={label} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                <Check className="mt-0.5 h-4 w-4 text-brand-goldDark" aria-hidden />
                <span className="break-words">{label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </motion.div>
  )
}

function WhyPaidCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden rounded-2xl p-7 bg-bg-section/80 backdrop-blur border border-brand-gold/20 shadow-card">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-gold/55 to-transparent" />
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
      </div>

      <Heading level={3} className="relative text-xl">
        {title}
      </Heading>
      <Text variant="muted" className="relative mt-3">
        {description}
      </Text>
    </Card>
  )
}

function PlanCard({
  plan,
  paymentMode,
  installmentMonths,
  onChoose,
}: {
  plan: Plan
  paymentMode: 'one' | 'installments'
  installmentMonths: number
  onChoose: (plan: Plan) => void
}) {
  const featured = Boolean(plan.featured)
  const priceLabel = formatPlanPrice(plan.amount, paymentMode, installmentMonths)

  return (
    <Card
      className={
        'relative overflow-hidden rounded-2xl p-6 sm:p-7 flex h-full flex-col bg-white/72 backdrop-blur-xl border-2 border-brand-gold/75 shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition duration-200 ease-out hover:-translate-y-1 hover:bg-white/68 hover:shadow-[0_28px_70px_rgba(0,0,0,0.10)] ' +
        (featured ? 'shadow-[0_30px_80px_rgba(201,161,59,0.15)] lg:scale-[1.03]' : '')
      }
    >
      {featured ? (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-gold/22 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-gold/16 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/22 to-transparent" />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div className={featured ? 'relative' : undefined}>
          <Heading level={3} className={'text-2xl' + (featured ? ' text-text-primary' : '')}>
            {plan.name}
          </Heading>
          <div className="mt-2 text-sm font-semibold text-black sm:text-base">
            {priceLabel}
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.includes.map((label) => (
          <li key={label} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
            <Check className="mt-0.5 h-4 w-4 text-brand-goldDark" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full bg-gradient-to-br from-brand-gold to-brand-goldDark text-white hover:shadow-[0_10px_20px_rgba(201,161,59,0.30)] hover:-translate-y-0.5"
          onClick={() => onChoose(plan)}
        >
          Wybieram {plan.name}
        </Button>
      </div>
    </Card>
  )
}

function FaqAccordionItem({ q, a }: FaqItem) {
  return (
    <Card className="relative overflow-hidden rounded-2xl p-0 bg-bg-section/80 backdrop-blur border border-brand-gold/20 shadow-card">
      <details className="group">
        <summary className="list-none cursor-pointer select-none px-6 py-5 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-text-primary">{q}</span>
          <ChevronDown
            className="h-5 w-5 text-text-muted transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="px-6 pb-6">
          <Text variant="muted">{a}</Text>
        </div>
      </details>
    </Card>
  )
}

function SummaryFeature({ label }: { label: string }) {
  return (
    <Card className="relative overflow-hidden rounded-2xl p-6 bg-bg-section/80 backdrop-blur border border-brand-gold/20 shadow-card">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-gold/40 to-transparent" />
      </div>

      <div className="relative flex items-start gap-4">
        <IconPlaceholder />
        <div>
          <Heading level={3} className="text-lg">
            {label}
          </Heading>
        </div>
      </div>
    </Card>
  )
}

function PaymentModeToggle({ value, onChange }: { value: 'one' | 'installments'; onChange: (v: 'one' | 'installments') => void }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 rounded-[20px] border border-white/40 bg-white/85 p-[3px] text-sm shadow-[0_14px_34px_rgba(0,0,0,0.07)] backdrop-blur sm:inline-flex sm:min-w-[320px] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full">
      <button
        type="button"
        onClick={() => onChange('one')}
        className={
          'flex-1 rounded-full border border-transparent px-4 py-2 transition sm:px-6 sm:py-1.5 ' +
          (value === 'one'
            ? 'border-brand-gold bg-brand-gold text-white font-semibold shadow-[0_10px_22px_rgba(201,161,59,0.18)]'
            : 'text-text-secondary hover:text-text-primary hover:bg-white/70')
        }
        aria-pressed={value === 'one'}
      >
        Jednorazowo
      </button>
      <button
        type="button"
        onClick={() => onChange('installments')}
        className={
          'flex-1 rounded-full border border-transparent px-4 py-2 transition sm:px-6 sm:py-1.5 ' +
          (value === 'installments'
            ? 'border-brand-gold bg-brand-gold text-white font-semibold shadow-[0_10px_22px_rgba(201,161,59,0.18)]'
            : 'text-text-secondary hover:text-text-primary hover:bg-white/70')
        }
        aria-pressed={value === 'installments'}
      >
        Raty
      </button>
    </div>
  )
}

function InstallmentMonthsToggle({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="inline-flex flex-wrap items-center justify-end gap-2">
      {[2, 3].map((month) => (
        <button
          key={month}
          type="button"
          onClick={() => onChange(month)}
          className={
            'inline-flex min-w-12 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition ' +
            (value === month
              ? 'border-brand-gold bg-brand-gold text-white shadow-[0_10px_22px_rgba(201,161,59,0.18)]'
              : 'border-stroke bg-bg-section text-text-secondary hover:border-brand-gold/30 hover:text-text-primary')
          }
          aria-pressed={value === month}
        >
          {month} msc
        </button>
      ))}
    </div>
  )
}

function MiniComparisonRow({
  paymentMode,
  installmentMonths,
}: {
  paymentMode: 'one' | 'installments'
  installmentMonths: number
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl p-6 bg-bg-section/70 backdrop-blur border border-stroke shadow-card">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-brand-gold/45 to-transparent" />
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2">
        {[
          { k: 'Liczba osób', v: '1 / 2 / zespół' },
          { k: 'Wdrożenie', v: '2 tygodnie' },
          { k: 'Kampania', v: 'startowa w regionie' },
          { k: 'Wsparcie', v: 'operacyjne + sprzedażowe' },
        ].map((x) => (
          <div key={x.k} className="relative overflow-hidden rounded-xl border border-stroke bg-bg-section/70 p-4">
            <div aria-hidden className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="relative">
              <div className="text-xs font-medium text-text-secondary">{x.k}</div>
              <div className="mt-1 text-sm text-text-primary">{x.v}</div>
            </div>
          </div>
        ))}
      </div>

      {paymentMode === 'installments' ? (
        <Text variant="muted" className="relative mt-4">
          Wybrany wariant ratalny: {installmentMonths} miesiące.
        </Text>
      ) : null}
    </Card>
  )
}

function StartStepCard({ step, title, description }: StartStep) {
  return (
    <Card className="rounded-2xl p-6 border border-brand-gold/25 bg-black/30 backdrop-blur shadow-card">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-gold/35 bg-black/35 text-sm font-semibold text-white">
          {step}
        </div>
        <div className="min-w-0">
          <Heading level={3} className="text-xl text-white">
            {title}
          </Heading>
          <Text className="mt-2 text-white/80">
            {description}
          </Text>
        </div>
      </div>
    </Card>
  )
}

function FundingMiniBar() {
  const items = [
    { title: 'budżet startowej kampanii' },
    { title: 'dwutygodniowe wdrożenie' },
    { title: 'proces + wsparcie operacyjne' },
  ]

  return (
    <Card className="rounded-2xl p-5">
      <div className="text-xs font-medium text-text-secondary">Co realnie finansuje opłata</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {items.map((x) => (
          <div key={x.title} className="flex items-start gap-3">
            <IconPlaceholder />
            <div className="text-sm text-text-secondary leading-relaxed">{x.title}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function PartnerProgramLanding() {
  const [paymentMode, setPaymentMode] = React.useState<'one' | 'installments'>('one')
  const [installmentMonths, setInstallmentMonths] = React.useState(3)
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null)
  const [signupOpen, setSignupOpen] = React.useState(false)

  function openSignup(plan: Plan) {
    setSelectedPlan(plan)
    setSignupOpen(true)
  }

  return (
    <>
      {selectedPlan ? (
        <PartnerSignupModal
          open={signupOpen}
          onOpenChange={setSignupOpen}
          planName={selectedPlan.name}
          planAmount={selectedPlan.amount}
          priceLabel={formatPlanPrice(selectedPlan.amount, paymentMode, installmentMonths)}
          paymentMode={paymentMode}
          installmentMonths={installmentMonths}
        />
      ) : null}

      <StickyPartnerCTA />

      {/* SECTION 1 — HERO */}
      <Section
        id="hero"
        variant="white"
        aria-label="Partnerstwo — hero"
        className="scroll-mt-32 relative overflow-hidden py-10 md:py-20 lg:py-28"
      >
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/grafiki/Seal 7/premium 2.jpg')" }}
          />
        </div>

        <div className="relative">
          <div className="max-w-[920px]">
            <div className="inline-flex">
              <Badge variant="gold">Program partnerski</Badge>
            </div>

            <Card className="mt-5 rounded-2xl border-brand-gold/55 bg-black/40 backdrop-blur px-4 py-6 sm:px-8 sm:py-10">
              <Heading
                level={1}
                className="max-w-[28ch] text-balance text-[clamp(2rem,8vw,4.5rem)] leading-tight text-white"
              >
                Dołącz do sieci partnerów Velo Prime
              </Heading>
              <Text className="mt-4 max-w-[78ch] text-sm leading-6 text-white/92 sm:mt-6 sm:text-base sm:leading-7">
                Sprzedaż bezpośrednia samochodów premium.
                <br />
                Dostajesz produkt, proces, szkolenie i start marketingowy w regionie.
              </Text>

              <BulletList items={heroHighlights} variant="dark" />

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Button href="#pakiety" variant="primary" size="lg" className="w-full sm:w-auto">
                  Rozpocznij partnerstwo
                </Button>
                <a
                  href="#start-partnera"
                  className="text-center text-sm font-medium text-white/80 transition hover:text-white sm:text-left"
                >
                  Zobacz jak wygląda start
                </a>
              </div>

              <div className="mt-5">
                <a
                  href="/regulamin-partnerstwa"
                  className="text-sm font-medium text-white/78 underline decoration-brand-gold/60 underline-offset-4 transition hover:text-white"
                >
                  Regulamin zakupu szkolenia i uczestnictwa w programie partnerskim Velo Prime
                </a>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <PartnerSectionNav items={navItems} />

      {/* SECTION 2 — DLA KOGO */}
      <Section
        id="dla-kogo"
        variant="white"
        aria-label="Dla kogo jest partnerstwo"
        className="scroll-mt-32"
        style={{
          background: 'radial-gradient(circle at top, #fafafa, #ffffff)',
        }}
      >
        <div className="max-w-[80ch]">
          <Heading level={2}>Dla kogo jest partnerstwo</Heading>
          <Text className="mt-3">
            To program dla osób, które chcą działać profesjonalnie — w standardzie premium i z jasnym procesem.
          </Text>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <AudienceCard goldBorder title="To partnerstwo jest dla Ciebie jeśli" items={forYou} />
          <AudienceCard goldBorder title="To partnerstwo nie jest dla Ciebie jeśli" items={notForYou} />
        </div>
      </Section>

      {/* SECTION 3 — CO OTRZYMUJE PARTNER */}
      <Section
        id="co-otrzymujesz"
        variant="white"
        aria-label="Co otrzymuje partner"
        className="scroll-mt-32"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage:
            'linear-gradient(180deg,#ffffff 0%,#fafafa 100%), radial-gradient(circle at 20% 40%, rgba(212,175,55,0.08), transparent 60%)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-[80ch]">
          <Heading level={2}>Co otrzymuje partner</Heading>
          <Text className="mt-3">
            Dostajesz komplet: produkt, proces, wdrożenie i wsparcie — w jednym spójnym modelu działania.
          </Text>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="relative">
              {f.badge ? (
                <div className="absolute -top-3 left-4 z-10">
                  <Badge variant="gold">{f.badge}</Badge>
                </div>
              ) : null}
              <FeatureCard title={f.title} description={f.description} />
            </div>
          ))}
        </div>
      </Section>

      <Section
        variant="white"
        aria-label="Sekcja zaufania"
        className="scroll-mt-32 py-[50px]"
        style={{ background: '#fafafa' }}
      >
        <div className="max-w-[80ch]">
          <Heading level={2}>Partnerstwo oparte na realnym ekosystemie sprzedaży</Heading>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div
            className="rounded-2xl p-6"
            style={{ background: '#ffffff', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
          >
            <Car className="h-6 w-6" style={{ color: '#c79c3c' }} aria-hidden />
            <div className="mt-4 text-sm font-semibold text-neutral-900">Współpraca z marką BYD</div>
            <div className="mt-2 text-sm leading-relaxed text-neutral-600">
              Sprzedajesz samochody jednego z najszybciej rosnących producentów aut elektrycznych na świecie.
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: '#ffffff', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
          >
            <CreditCard className="h-6 w-6" style={{ color: '#c79c3c' }} aria-hidden />
            <div className="mt-4 text-sm font-semibold text-neutral-900">14 instytucji finansowych</div>
            <div className="mt-2 text-sm leading-relaxed text-neutral-600">
              Banki, leasingi i instytucje finansujące zakup samochodów — dopasowanie finansowania do klienta.
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: '#ffffff', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
          >
            <Users className="h-6 w-6" style={{ color: '#c79c3c' }} aria-hidden />
            <div className="mt-4 text-sm font-semibold text-neutral-900">Sieć partnerów Velo Prime</div>
            <div className="mt-2 text-sm leading-relaxed text-neutral-600">
              Budujemy ogólnopolską sieć sprzedaży bezpośredniej samochodów premium.
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 4 — JAK WYGLĄDA WSPÓŁPRACA */}
      <Section
        id="wspolpraca"
        variant="soft"
        aria-label="Jak wygląda współpraca"
        className="scroll-mt-32"
        style={{
          backgroundImage: "url('/grafiki/seal-6-dmi/premium przod 2.jpg')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-[80ch]">
          <Heading level={2} className="text-white">
            Jak wygląda współpraca
          </Heading>
          <Text className="mt-3 text-white/85">
            5 kroków od wyboru wariantu do startu działań sprzedażowych.
          </Text>
        </div>

        <div className="relative mt-12">
          {/* Vertical rail (until xl) */}
          <div aria-hidden className="absolute left-9 top-0 h-full w-px bg-brand-gold/60 2xl:hidden" />

          {/* Horizontal rail (xl+) */}
          <div aria-hidden className="absolute left-0 right-0 top-1 hidden h-px bg-brand-gold/70 2xl:block" />

          <div className="grid gap-[30px] xl:grid-cols-3 2xl:grid-cols-5">
            {timeline.map((s, idx) => (
              <ProcessStepCard key={s.step} index={idx} {...s} />
            ))}
          </div>
        </div>
      </Section>

      {/* SECTION 5 — DLACZEGO TO JEST PŁATNE */}
      <Section
        id="dlaczego-platne"
        variant="white"
        aria-label="Dlaczego to jest płatne"
        className="scroll-mt-32 relative overflow-hidden"
        style={{
          backgroundColor: '#f6f6f6',
          backgroundImage:
            "linear-gradient(180deg, #f6f6f6 0%, #fafafa 100%), radial-gradient(circle at 18% 22%, rgba(201,161,59,0.16), transparent 58%), radial-gradient(circle at 82% 60%, rgba(201,161,59,0.12), transparent 62%), url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='160'%20height='160'%20viewBox='0%200%20160%20160'%3E%3Cg%20fill='none'%20stroke='%231A1A1A'%20stroke-width='1'%3E%3Cpath%20d='M0%2040H160%20M0%2080H160%20M0%20120H160%20M40%200V160%20M80%200V160%20M120%200V160'%20stroke-opacity='0.04'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 right-0 top-0 h-px bg-brand-gold/25" />
          <div className="absolute left-0 right-0 bottom-0 h-px bg-brand-gold/15" />

          <div className="absolute left-6 top-10 h-24 w-24 rounded-tl-2xl border-l border-t border-brand-gold/35" />
          <div className="absolute right-6 top-10 h-24 w-24 rounded-tr-2xl border-r border-t border-brand-gold/25" />
          <div className="absolute left-6 bottom-10 h-24 w-24 rounded-bl-2xl border-l border-b border-brand-gold/25" />
          <div className="absolute right-6 bottom-10 h-24 w-24 rounded-br-2xl border-r border-b border-brand-gold/35" />
        </div>

        <div className="max-w-[80ch]">
          <Heading level={2}>Dlaczego to jest płatne</Heading>
          <Text className="mt-3">
            To nie jest "dostęp" — to wdrożenie w standard sprzedaży premium.
          </Text>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <Card className="relative overflow-hidden rounded-2xl p-6 bg-bg-section/75 backdrop-blur border border-brand-gold/20">
              <div aria-hidden className="absolute inset-0">
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-brand-gold/35 to-transparent" />
              </div>

              <div className="relative">
                <Heading level={3} className="text-xl">
                  Co realnie finansujesz
                </Heading>
                <Text variant="muted" className="mt-2">
                  Chcemy, żeby wejście w program oznaczało konkretną zmianę w Twoim sposobie domykania — nie przypadkowy start.
                </Text>

                <ul className="mt-5 space-y-3">
                  {[
                    'dwutygodniowe wdrożenie krok po kroku',
                    'narzędzia i materiały sprzedażowe gotowe do użycia',
                    'start działań w regionie (plan + kampania)',
                    'standard premium: spójna komunikacja i obsługa',
                  ].map((label) => (
                    <li key={label} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                      <Check className="mt-0.5 h-4 w-4 text-brand-goldDark" aria-hidden />
                      <span className="break-words">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { k: '14 dni', v: 'wdrożenia', d: 'żeby start był powtarzalny' },
                { k: '5 punktów', v: 'sprzedaży', d: 'standard rozmowy premium' },
                { k: '14', v: 'instytucji', d: 'finansowanie dopasowane do klienta' },
              ].map((it) => (
                <Card key={it.k} className="relative overflow-hidden rounded-2xl p-5 bg-bg-section/70 backdrop-blur border border-stroke">
                  <div aria-hidden className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-text-primary">{it.k}</span>
                      <span className="text-sm font-medium text-text-secondary">{it.v}</span>
                    </div>
                    <Text variant="muted" className="mt-2">
                      {it.d}
                    </Text>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-7">
            <div aria-hidden className="absolute -left-3 top-2 hidden h-[calc(100%-16px)] w-px bg-gradient-to-b from-transparent via-brand-gold/55 to-transparent lg:block" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <WhyPaidCard
                title="Realna inwestycja w start"
                description="Opłata porządkuje współpracę i pozwala wejść w proces bez przypadkowych zgłoszeń i niejasnych intencji."
              />
              <WhyPaidCard
                title="Wdrożenie i narzędzia"
                description="Dostajesz szkolenie, materiały i model pracy — tak, żeby od razu działać sprawnie i konsekwentnie."
              />
              <WhyPaidCard
                title="Standard sprzedaży premium"
                description="Utrzymujemy jakość obsługi i komunikacji. To klucz do domykania sprzedaży w segmencie premium."
              />
            </div>
          </div>
        </div>

        <div aria-hidden className="mt-12 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(201,161,59,0.9),transparent)]" />

        <div className="mt-10">
          <Card className="relative overflow-hidden rounded-2xl p-6 bg-bg-section/90 backdrop-blur border-brand-gold/80 shadow-[0_22px_70px_rgba(201,161,59,0.20)]">
            <div aria-hidden className="absolute inset-0">
              <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-gold/20 blur-3xl" />
              <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-brand-gold/15 blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>

            <div className="relative max-w-[72ch]">
              <Text className="text-text-primary font-semibold">
                „Nie sprzedajemy dostępu. Budujemy sieć sprzedaży premium.”
              </Text>
              <Text variant="muted" className="mt-2">
                Opłata ma jeden cel: zapewnić wdrożenie, standard i realny start działań.
              </Text>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <FundingMiniBar />
        </div>
      </Section>

      {/* SECTION 6 — JAK WYGLĄDA START PARTNERA */}
      <Section
        id="start-partnera"
        variant="white"
        aria-label="Jak wygląda start partnera"
        className="scroll-mt-32 relative overflow-hidden"
      >
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/grafiki/Seal 7/premium 2.jpg')" }}
          />
        </div>

        <div className="relative">
          <Card className="rounded-2xl border-brand-gold/45 bg-black/35 backdrop-blur p-6 sm:p-7">
            <div className="max-w-[80ch]">
              <Heading level={2} className="text-white">
                Jak wygląda start partnera
              </Heading>
              <Text className="mt-3 text-white/85">
                Zaczynasz od rejestracji, przechodzisz wdrożenie i w 14 dni masz gotowy start działań w regionie.
              </Text>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-start">
              <div className="grid gap-6 lg:col-span-7">
                {startSteps.map((s) => (
                  <StartStepCard key={s.step} {...s} />
                ))}
              </div>

              <div className="lg:col-span-5">
                <Card className="rounded-2xl p-6 border border-brand-gold/25 bg-black/30 backdrop-blur shadow-card">
                  <Heading level={3} className="text-xl text-white">
                    Po 14 dniach masz:
                  </Heading>
                  <ul className="mt-5 space-y-3">
                    {[
                      'gotowy proces rozmowy i domknięcia',
                      'narzędzia i materiały sprzedażowe',
                      'uruchomione działania marketingowe',
                    ].map((label) => (
                      <li key={label} className="flex gap-3 text-sm leading-relaxed text-white/80">
                        <Check className="mt-0.5 h-4 w-4 text-brand-goldSoft" aria-hidden />
                        <span className="break-words">{label}</span>
                      </li>
                    ))}
                  </ul>

                  <div aria-hidden className="mt-6 h-px w-full bg-brand-gold/25" />
                  <Text className="mt-5 text-white/70 text-sm">
                    Wszystko przygotowane tak, żebyś mógł wejść w rozmowy od razu — bez improwizacji.
                  </Text>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* SECTION 7 — PAKIETY PARTNERSTWA */}
      <Section
        id="pakiety"
        variant="white"
        aria-label="Pakiety partnerstwa"
        className="scroll-mt-32 relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.72)), url('/grafiki/seal-6-dmi/premium przod 2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-[80ch]">
          <Heading level={2}>Pakiety partnerstwa</Heading>
          <Text className="mt-3">
            Wybierz wariant dopasowany do sposobu pracy. Możesz działać solo, w duecie albo zespołowo.
          </Text>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-stroke bg-bg-section/80 px-4 py-3 shadow-card sm:px-5 sm:flex-row sm:items-center sm:justify-between">
          <Text variant="secondary" className="text-text-primary">
            Forma płatności
          </Text>
          <PaymentModeToggle value={paymentMode} onChange={setPaymentMode} />
        </div>

        {paymentMode === 'installments' ? (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-stroke bg-bg-section/75 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Text variant="muted">Liczba miesięcy</Text>
            <InstallmentMonthsToggle value={installmentMonths} onChange={setInstallmentMonths} />
          </div>
        ) : null}

        <div className="mt-4">
          <a
            href="/regulamin-partnerstwa"
            className="inline-flex text-sm text-text-secondary underline decoration-brand-gold/60 underline-offset-4 transition hover:text-text-primary"
          >
            Zobacz regulamin zakupu szkolenia i uczestnictwa w programie partnerskim Velo Prime
          </a>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3 lg:items-stretch lg:gap-6">
            {plans.map((p) => (
              <PlanCard
                key={p.name}
                plan={p}
                paymentMode={paymentMode}
                installmentMonths={installmentMonths}
                onChoose={openSignup}
              />
            ))}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-[100px]">
            <MiniComparisonRow paymentMode={paymentMode} installmentMonths={installmentMonths} />
          </div>
        </div>
      </Section>

      {/* SECTION 8 — PODSUMOWANIE */}
      <Section id="podsumowanie" variant="soft" aria-label="Podsumowanie" className="scroll-mt-32">
        <div className="max-w-[80ch]">
          <Heading level={2}>Podsumowanie</Heading>
          <Text className="mt-3">Partnerstwo Velo Prime to:</Text>
          <Text variant="muted" className="mt-2">
            To nie jest oferta do przeglądania. To start współpracy z wdrożeniem i realnym marketingiem.
          </Text>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {heroHighlights.map((label) => (
            <SummaryFeature key={label} label={label} />
          ))}
        </div>
      </Section>

      {/* SECTION 9 — FAQ */}
      <Section id="faq" variant="white" aria-label="FAQ" className="scroll-mt-32">
        <div className="max-w-[80ch]">
          <Heading level={2}>FAQ</Heading>
          <Text className="mt-3">
            Najczęstsze pytania dotyczące współpracy.
          </Text>
        </div>

        <div className="mt-10 grid gap-4">
          {faq.map((item) => (
            <FaqAccordionItem key={item.q} {...item} />
          ))}
        </div>
      </Section>

      {/* SECTION 10 — FINAL CTA */}
      <Section
        id="cta"
        variant="white"
        aria-label="Rozpocznij partnerstwo"
        className="scroll-mt-32 relative overflow-hidden"
      >
        <div aria-hidden className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/grafiki/Seal 7/premium 2.jpg')" }}
          />
        </div>

        <div id="final-cta" className="relative">
          <div className="max-w-[920px]">
            <div className="inline-flex">
              <Badge variant="gold">Rozpocznij partnerstwo</Badge>
            </div>

            <Card className="mt-5 rounded-2xl border-brand-gold/55 bg-black/35 backdrop-blur p-6 sm:p-7">
              <Heading level={2} className="max-w-[32ch] text-white">
                Rozpocznij partnerstwo z Velo Prime
              </Heading>
              <Text className="mt-4 max-w-[78ch] text-white/90">
                Wybierz wariant i przejdź do rejestracji. Jeśli jesteś po webinarze — to jest najprostszy sposób, żeby wystartować.
              </Text>
              <Text className="mt-3 max-w-[78ch] text-white/70 text-sm lg:text-base">
                Płatność bezpieczna. Start wdrożenia od razu po rejestracji.
              </Text>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href="#pakiety" variant="primary" size="lg">
                  Rozpocznij partnerstwo
                </Button>
                <a href="#faq" className="text-sm font-medium text-white/80 hover:text-white transition">
                  Zobacz FAQ
                </a>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  )
}
