import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

function GoldMark() {
  return (
    <span
      aria-hidden
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stroke bg-bg-primary text-brand-gold"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3l2.2 6.8H21l-5.5 4 2.1 7-5.6-4.1-5.6 4.1 2.1-7L3 9.8h6.8L12 3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function StepNumber({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-bg-primary text-brand-gold font-semibold">
      {n}
    </span>
  )
}

type FinancingTile = {
  title: string
  sub: string
  desc: string
}

const tiles: FinancingTile[] = [
  {
    title: 'Leasing dla firm',
    sub: 'Optymalizacja podatkowa',
    desc: 'Warunki dopasowane do Twojej działalności — elastyczny okres i wpłata.',
  },
  {
    title: 'Leasing konsumencki',
    sub: 'Samochód na Ciebie',
    desc: 'Prosta ścieżka dla klientów prywatnych — klarowne zasady i estymowana rata.',
  },
  {
    title: 'Kredyt samochodowy',
    sub: 'Klasyczne finansowanie',
    desc: 'Rata i okres dopasowane do budżetu — porównujemy dostępne oferty.',
  },
  {
    title: 'Bez BIK / KRD',
    sub: 'Minimum formalności',
    desc: 'W wybranych instytucjach możliwe uproszczone procedury — zabezpieczeniem może być sam pojazd.',
  },
]

const steps = [
  {
    n: 1 as const,
    title: 'Wybierasz model',
    desc: 'Z oferty dostępnej od ręki lub w drodze.',
  },
  {
    n: 2 as const,
    title: 'Dobieramy finansowanie',
    desc: 'Najczęściej: 10% wpłaty • 35% wykupu • 36–60 miesięcy.',
  },
  {
    n: 3 as const,
    title: 'Decyzja i rezerwacja',
    desc: 'Otrzymujesz podsumowanie, podpis i odbiór auta.',
  },
]

export function FinancingSection() {
  return (
    <Section id="finansowanie" variant="soft" className="relative">
      <div className="max-w-2xl">
        <Heading level={2}>Finansowanie dopasowane do Ciebie.</Heading>
        <Text className="mt-4">
          Współpracujemy z <span className="font-semibold text-text-primary">16 instytucjami</span>{' '}
          finansowymi — dobieramy najlepsze rozwiązanie do Twojej sytuacji. Transparentnie, bez presji.
        </Text>
      </div>

      {/* Block A */}
      <div className="mt-10">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-[70ch]">
            <Heading level={3}>Możliwości finansowania</Heading>
            <Text variant="muted" className="mt-2">
              Dobieramy rozwiązanie do celu i profilu klienta — bez obietnic „dla każdego”.
            </Text>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {tiles.map((t) => (
            <Card key={t.title} className="rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <GoldMark />
                <div>
                  <Heading level={3} className="text-xl lg:text-xl">
                    {t.title}
                  </Heading>
                  <Text variant="muted" className="mt-1">
                    {t.sub}
                  </Text>
                  <Text variant="secondary" className="mt-3">
                    {t.desc}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-stroke bg-bg-primary p-4">
          <Text variant="muted">16 instytucji finansowych • weryfikujemy różne scenariusze • dobieramy najlepszą opcję</Text>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/#kontakt" variant="primary" size="lg">
            Umów konsultację
          </Button>
          <Button href="/modele" variant="secondary" size="lg">
            Sprawdź finansowanie
          </Button>
        </div>
      </div>

      <div aria-hidden className="mt-14 h-px w-full bg-stroke" />

      {/* Block B */}
      <Card className="relative mt-14 overflow-hidden rounded-2xl bg-bg-section p-7 ring-1 ring-black/5 md:p-10 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-brand-gold">
        <div className="max-w-[70ch]">
          <Heading level={3}>Jak to działa</Heading>
          <Text variant="muted" className="mt-2">
            Prosty proces — bez chaosu i bez presji.
          </Text>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.n} className="rounded-2xl bg-bg-primary p-6">
              <div className="flex items-start gap-4">
                <StepNumber n={s.n} />
                <div>
                  <Heading level={3} className="text-xl lg:text-xl">
                    {s.title}
                  </Heading>
                  <Text variant="secondary" className="mt-2">
                    {s.desc}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Text variant="muted" className="mt-6">
          Rata na stronie jest estymacją — finalna oferta zależy od banku i parametrów umowy.
        </Text>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/#kontakt" variant="primary" size="lg">
            Umów konsultację
          </Button>
          <Button href="/modele" variant="secondary" size="lg">
            Zobacz modele
          </Button>
        </div>
      </Card>
    </Section>
  )
}
