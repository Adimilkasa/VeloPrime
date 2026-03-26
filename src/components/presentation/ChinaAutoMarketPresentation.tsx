import { BarChart3, BatteryCharging, CarFront, ChevronRight, ChevronUp, Factory, Home, Percent, SunMedium } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'

const pillars = [
  {
    kicker: 'Perspektywa rynku',
    title: 'Chińskie marki wchodzą do mainstreamu szybciej, niż zakładał rynek.',
    body: 'Rosnący popyt, lepsza dostępność i coraz mocniejsze brandy sprawiają, że segment z miesiąca na miesiąc buduje realną skalę.',
  },
  {
    kicker: 'Mechanika wzrostu',
    title: 'To nie chwilowy trend, ale efekt przewag systemowych i technologicznych.',
    body: 'Polityka podatkowa, elektryfikacja i kontrola kosztów tworzą środowisko, w którym marki z Chin mogą rosnąć szybciej od konkurencji.',
  },
  {
    kicker: 'Znaczenie biznesowe',
    title: 'Dla dealerów i partnerów to moment, w którym warto zająć pozycję przed resztą rynku.',
    body: 'Prezentacja pokazuje, skąd bierze się przewaga chińskich aut i dlaczego ten segment będzie dalej zwiększał udział w polskim rynku.',
  },
]

const automotiveBullets = [
  'przejście z niszy do mainstreamu',
  'dynamiczny wzrost rynku',
  'rosnący udział marek chińskich',
  'silni gracze napędzają rynek (w tym BYD)',
]

const solarBullets = [
  'fotowoltaika 2018-2019',
  'boom rynkowy',
  'szybka adopcja technologii',
  'efekt skali i dostępności',
]

const exciseBullets = [
  '0% dla elektryków',
  'zwolnienie PHEV do 2029',
  'obniżona akcyza dla hybryd',
]

const marketImpactBullets = [
  'niższa cena zakupu',
  'większa dostępność',
  'szybsza adopcja technologii',
]

const chinaBrandBullets = [
  'chińskie marki korzystają z systemu',
  'BYD jako beneficjent',
  'dopasowanie do trendu elektryfikacji',
]

const costPillars = [
  {
    title: 'produkcja i skala',
    points: ['niższe koszty', 'kontrola łańcucha dostaw'],
    icon: Factory,
    tone: 'blue',
    position: 'top-left',
  },
  {
    title: 'technologia i baterie',
    points: ['szybkie wdrożenia', 'kontrola łańcucha dostaw'],
    icon: BatteryCharging,
    tone: 'green',
    position: 'top-right',
  },
  {
    title: 'model biznesowy',
    points: ['value for money', 'niższe koszty'],
    icon: CarFront,
    tone: 'green',
    position: 'bottom-left',
  },
  {
    title: 'strategia rynkowa',
    points: ['szybkie wdrożenia', 'value for money'],
    icon: BarChart3,
    tone: 'blue',
    position: 'bottom-right',
  },
] as const

const pillarToneClasses = {
  blue: {
    card: 'border-[#d7dee8] bg-[linear-gradient(180deg,#f8fbff_0%,#eef3fb_100%)]',
    iconWrap: 'bg-[#0d2d62]/10 text-[#0d2d62]',
    kicker: 'text-[#0d2d62]',
    text: 'text-[#22324d]',
  },
  green: {
    card: 'border-[#d6e7dc] bg-[linear-gradient(180deg,#f6fff8_0%,#edf9f1_100%)]',
    iconWrap: 'bg-[#26a96c]/12 text-[#26a96c]',
    kicker: 'text-[#1f7c52]',
    text: 'text-[#234733]',
  },
  red: {
    card: 'border-[#d6e7dc] bg-[linear-gradient(180deg,#f6fff8_0%,#edf9f1_100%)]',
    iconWrap: 'bg-[#26a96c]/12 text-[#26a96c]',
    kicker: 'text-[#1f7c52]',
    text: 'text-[#234733]',
  },
} as const

function TrendLine({ colorClassName }: { colorClassName: string }) {
  return (
    <svg viewBox="0 0 320 120" className="h-24 w-full" aria-hidden>
      <defs>
        <linearGradient id={`trend-${colorClassName.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <path d="M12 98 C70 96, 92 84, 132 78 S192 58, 222 42 S270 24, 308 12" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className={colorClassName} />
      <path d="M286 12 L308 12 L298 34" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className={colorClassName} />
      <path d="M12 108 H308" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="2" className={colorClassName} />
    </svg>
  )
}

export function ChinaAutoMarketPresentation() {
  return (
    <main className="bg-bg-primary">
      <section className="relative isolate overflow-hidden bg-[#efe6d7] text-text-primary">
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/grafiki/Seal%207/premium%203.jpg')] bg-cover bg-[position:62%_50%] bg-no-repeat opacity-90"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,18,24,0.76)_0%,rgba(16,18,24,0.44)_42%,rgba(16,18,24,0.12)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(235,201,113,0.24),transparent_34%)]" />

        <Container className="relative py-20 md:py-24 lg:py-32">
          <div className="max-w-[760px]">
            <div className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88 backdrop-blur-sm">
              Analiza rynku • Polska 2026
            </div>
            <Heading level={1} className="mt-6 max-w-[12ch] text-white">
              Chińskie marki motoryzacyjne zmieniają układ sił na polskim rynku.
            </Heading>
            <Text className="mt-6 max-w-[62ch] text-white/82">
              To już nie jest nisza oparta wyłącznie na cenie. Chińskie auta rosną dzięki połączeniu technologii, skali, polityki wspierającej elektryfikację i coraz silniejszej obecności marek, które budują zaufanie klienta.
            </Text>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#start-prezentacji" size="lg">
                Zobacz dynamikę rynku
              </Button>
              <Button href="#sekcja-03" variant="secondary" size="lg" className="border-white/24 bg-white/8 text-white hover:bg-white/14">
                Przejdź do przewagi kosztowej
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:mt-16 md:grid-cols-3">
            {pillars.map((item) => (
              <Card
                key={item.title}
                className="grid min-h-[220px] rounded-[24px] border-white/16 bg-white/10 p-6 shadow-[0_18px_44px_rgba(16,18,24,0.18)] backdrop-blur-md"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f1d898]">{item.kicker}</div>
                <div className="mt-3 text-xl font-semibold leading-tight text-white line-clamp-3">{item.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-white/80 line-clamp-4">{item.body}</div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <Section
        id="start-prezentacji"
        variant="white"
        title="Dynamiczny wzrost rynku chińskich samochodów w Polsce"
        subtitle="Nowoczesny slajd otwierający narrację: lewa strona pokazuje automotive, prawa stronę analogię do fotowoltaiki, a środek spina oba zjawiska jednym modelem wzrostu."
        className="border-y border-stroke/70 bg-[linear-gradient(180deg,#fbfbfd_0%,#f4efe7_100%)]"
      >
        <div className="relative overflow-hidden rounded-[34px] border border-stroke/75 bg-[linear-gradient(180deg,#ffffff_0%,#f8f4ed_100%)] p-5 shadow-[0_24px_64px_rgba(23,31,53,0.08)] md:p-7 lg:p-9">
          <div aria-hidden className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#0d2d62]/8 blur-3xl" />
          <div aria-hidden className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[#26a96c]/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[1fr_220px_1fr] xl:gap-8">
            <Card className="rounded-[28px] border-[#d7dee8] bg-[linear-gradient(180deg,#f8fbff_0%,#eef3fb_100%)] p-6 shadow-[0_18px_40px_rgba(13,45,98,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d2d62]">Automotive</div>
                  <div className="mt-3 max-w-[14ch] text-[30px] font-semibold leading-tight text-[#13233d]">
                    Rynek chińskich aut przechodzi z niszy do mainstreamu.
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d91f26]/10 text-[#d91f26]">
                  <CarFront className="h-6 w-6" aria-hidden />
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#d7dee8] bg-white/82 p-4 text-[#0d2d62]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5b7398]">Trend rynku</div>
                    <div className="mt-2 text-sm font-medium text-[#13233d]">Wyraźny ruch w górę i rosnąca akceptacja marek chińskich.</div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d91f26]/12 text-[#d91f26]">
                    <ChevronUp className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <div className="mt-4 text-[#26a96c]">
                  <TrendLine colorClassName="text-[#26a96c]" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#d7dee8] bg-white/88 p-4">
                  <div className="flex items-center gap-2 text-[#0d2d62]">
                    <BatteryCharging className="h-5 w-5 text-[#26a96c]" aria-hidden />
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5b7398]">Napęd i technologia</div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {automotiveBullets.slice(0, 2).map((item) => (
                      <div key={item} className="min-h-[40px] text-sm leading-relaxed text-[#22324d]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[#d6e7dc] bg-[linear-gradient(180deg,#f6fff8_0%,#edf9f1_100%)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f7c52]">Silni gracze napędzają rynek</div>
                  <div className="mt-3 grid gap-3 rounded-2xl border border-[#d6e7dc] bg-white/90 px-4 py-3 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#26a96c] text-sm font-bold text-white">
                      BYD
                    </div>
                    <div className="min-w-0 text-sm font-medium leading-relaxed text-[#234733] text-balance">
                      Jedna z marek, które budują zasięg, wiarygodność i skalę całego segmentu.
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {automotiveBullets.slice(2).map((item) => (
                      <div key={item} className="min-h-[40px] text-sm leading-relaxed text-[#234733]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="relative flex items-center justify-center xl:min-h-full">
              <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(13,45,98,0.06),rgba(38,169,108,0.18),rgba(217,31,38,0.08))] xl:block" />
              <div className="relative w-full rounded-[30px] border border-[#d9dfeb] bg-[linear-gradient(180deg,#ffffff_0%,#f0f5fb_100%)] px-5 py-6 text-center shadow-[0_18px_40px_rgba(23,31,53,0.08)] xl:px-6 xl:py-8">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0d2d62]">Most narracyjny</div>
                <div className="mt-4 text-2xl font-semibold leading-tight text-[#13233d] text-balance">
                  Analogiczny model wzrostu rynku
                </div>
                <div className="mt-4 text-sm leading-relaxed text-[#4f607d]">
                  Najpierw nisza i ostrożność. Potem szybka adopcja, większa dostępność i wejście do szerokiego mainstreamu.
                </div>
                <div className="mt-6 flex items-center justify-center gap-3 text-[#26a96c]">
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(38,169,108,0.5))]" />
                  <ChevronUp className="h-5 w-5" aria-hidden />
                  <ChevronUp className="h-6 w-6" aria-hidden />
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(38,169,108,0.5),transparent)]" />
                </div>
              </div>
            </div>

            <Card className="rounded-[28px] border-[#d6e7dc] bg-[linear-gradient(180deg,#f6fff8_0%,#edf9f1_100%)] p-6 shadow-[0_18px_40px_rgba(38,169,108,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f7c52]">Analogia do fotowoltaiki</div>
                  <div className="mt-3 max-w-[14ch] text-[30px] font-semibold leading-tight text-[#123928]">
                    Fotowoltaika 2018-2019 pokazała podobny schemat rynkowego boomu.
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#26a96c]/12 text-[#26a96c]">
                  <SunMedium className="h-6 w-6" aria-hidden />
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#d6e7dc] bg-white/82 p-4 text-[#1f7c52]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f8b71]">Model wzrostu</div>
                    <div className="mt-2 text-sm font-medium text-[#123928]">Szybka adopcja technologii, coraz lepsza dostępność i efekt skali.</div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#26a96c]/12 text-[#26a96c]">
                    <ChevronUp className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <div className="mt-4 text-[#26a96c]">
                  <TrendLine colorClassName="text-[#26a96c]" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#d6e7dc] bg-white/88 p-4">
                  <div className="flex items-center gap-2 text-[#123928]">
                    <SunMedium className="h-5 w-5 text-[#26a96c]" aria-hidden />
                    <Home className="h-5 w-5 text-[#26a96c]" aria-hidden />
                  </div>
                  <div className="mt-3 grid gap-2">
                    {solarBullets.slice(0, 2).map((item) => (
                      <div key={item} className="min-h-[40px] text-sm leading-relaxed text-[#234733]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[22px] border border-[#d6e7dc] bg-[linear-gradient(180deg,#ffffff_0%,#f4fbf6_100%)] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f7c52]">Co napędza boom</div>
                  <div className="mt-3 grid gap-2">
                    {solarBullets.slice(2).map((item) => (
                      <div key={item} className="min-h-[40px] text-sm leading-relaxed text-[#234733]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        id="sekcja-02"
        variant="white"
        title="Akcyza wspiera wzrost rynku"
        subtitle="Układ przyczynowo-skutkowy: po lewej mechanika podatkowa, po prawej efekt rynkowy, a na dole bezpośrednie przełożenie na chińskie marki i BYD."
        className="border-y border-stroke/70 bg-[linear-gradient(180deg,#f8fbfb_0%,#f2efe9_100%)]"
      >
        <div className="relative overflow-hidden rounded-[34px] border border-stroke/75 bg-[linear-gradient(180deg,#ffffff_0%,#f8f4ed_100%)] p-5 shadow-[0_24px_64px_rgba(23,31,53,0.08)] md:p-7 lg:p-9">
          <div aria-hidden className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#0d2d62]/8 blur-3xl" />
          <div aria-hidden className="absolute right-0 top-10 h-40 w-40 rounded-full bg-[#26a96c]/10 blur-3xl" />
          <div aria-hidden className="absolute bottom-0 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[#26a96c]/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[1fr_120px_1fr] xl:gap-8">
            <Card className="rounded-[28px] border-[#d7dee8] bg-[linear-gradient(180deg,#f8fbff_0%,#eef3fb_100%)] p-6 shadow-[0_18px_40px_rgba(13,45,98,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d2d62]">System podatkowy</div>
                  <div className="mt-3 max-w-[14ch] text-[30px] font-semibold leading-tight text-[#13233d] text-balance">
                    Akcyza działa jak realny akcelerator popytu.
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d2d62]/10 text-[#0d2d62]">
                  <Percent className="h-6 w-6" aria-hidden />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {exciseBullets.map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-[22px] border border-[#d7dee8] bg-white/90 px-4 py-4 shadow-[0_10px_24px_rgba(13,45,98,0.04)]">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d2d62]/8 text-[11px] font-semibold text-[#0d2d62]">
                      0{index + 1}
                    </div>
                    <div className="text-sm font-medium leading-relaxed text-[#1b2d47] text-balance">{item}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-[#d7dee8] bg-white/82 p-4">
                <div className="flex items-center gap-2 text-[#0d2d62]">
                  <BatteryCharging className="h-5 w-5 text-[#26a96c]" aria-hidden />
                  <CarFront className="h-5 w-5 text-[#d91f26]" aria-hidden />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5b7398]">Bodziec dla EV i PHEV</div>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-[#22324d]">
                  Preferencje akcyzowe obniżają barierę wejścia i wspierają decyzję zakupową tam, gdzie klient porównuje technologię, koszt wejścia i dostępność.
                </div>
              </div>
            </Card>

            <div className="relative flex items-center justify-center xl:min-h-full">
              <div className="hidden xl:flex xl:h-full xl:items-center">
                <div className="flex flex-col items-center gap-3 text-[#26a96c]">
                  <div className="h-20 w-px bg-[linear-gradient(180deg,rgba(13,45,98,0.08),rgba(38,169,108,0.4))]" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#26a96c]/18 bg-white shadow-[0_16px_36px_rgba(38,169,108,0.08)]">
                    <ChevronRight className="h-7 w-7" aria-hidden />
                  </div>
                  <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f7c52]">
                    Akcyza
                    <br />
                    → wzrost rynku
                  </div>
                  <div className="h-20 w-px bg-[linear-gradient(180deg,rgba(38,169,108,0.4),rgba(38,169,108,0.08))]" />
                </div>
              </div>

              <div className="w-full rounded-[28px] border border-[#d9dfeb] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7fb_100%)] px-5 py-5 text-center shadow-[0_18px_40px_rgba(23,31,53,0.08)] xl:hidden">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0d2d62]">Flow</div>
                <div className="mt-3 text-lg font-semibold leading-tight text-[#13233d] text-balance">Akcyza → niższa bariera wejścia → wzrost rynku</div>
              </div>
            </div>

            <Card className="rounded-[28px] border-[#d6e7dc] bg-[linear-gradient(180deg,#f6fff8_0%,#edf9f1_100%)] p-6 shadow-[0_18px_40px_rgba(38,169,108,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f7c52]">Wpływ na rynek</div>
                  <div className="mt-3 max-w-[14ch] text-[30px] font-semibold leading-tight text-[#123928] text-balance">
                    Niższy koszt wejścia przyspiesza adopcję technologii.
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#26a96c]/12 text-[#26a96c]">
                  <ChevronUp className="h-6 w-6" aria-hidden />
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#d6e7dc] bg-white/82 p-4 text-[#26a96c]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f8b71]">Kierunek trendu</div>
                    <div className="mt-2 text-sm font-medium text-[#123928]">System podatkowy nie buduje rynku sam, ale znacząco poprawia warunki do jego szybkiego wzrostu.</div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#26a96c]/12 text-[#26a96c]">
                    <ChevronUp className="h-5 w-5" aria-hidden />
                  </div>
                </div>
                <div className="mt-4 text-[#26a96c]">
                  <TrendLine colorClassName="text-[#26a96c]" />
                </div>
              </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {marketImpactBullets.map((item) => (
                    <div key={item} className="flex min-h-[96px] items-center rounded-[22px] border border-[#d6e7dc] bg-white/88 p-4 text-sm font-medium leading-relaxed text-[#234733] shadow-[0_10px_24px_rgba(38,169,108,0.04)] text-balance">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="relative mt-6 rounded-[30px] border border-[#d6e7dc] bg-[linear-gradient(180deg,#f6fff8_0%,#edf9f1_100%)] p-6 shadow-[0_18px_40px_rgba(38,169,108,0.08)] md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[720px]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f7c52]">Powiązanie z chińskimi markami</div>
                <div className="mt-3 max-w-[24ch] text-2xl font-semibold leading-tight text-[#123928] text-balance">
                  Chińskie marki wpisują się w system, który premiuje elektryfikację i przyspiesza ich wejście do szerokiego rynku.
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[22px] border border-[#d6e7dc] bg-white/88 px-4 py-3 shadow-[0_10px_24px_rgba(38,169,108,0.06)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#26a96c] text-sm font-bold text-white">
                  BYD
                </div>
                <div className="text-sm font-medium text-[#234733]">Przykład beneficjenta trendu</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {chinaBrandBullets.map((item) => (
                <div key={item} className="flex min-h-[96px] items-center rounded-[22px] border border-[#d6e7dc] bg-white/90 p-4 text-sm font-medium leading-relaxed text-[#234733] shadow-[0_10px_24px_rgba(38,169,108,0.04)] text-balance">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="sekcja-03"
        variant="white"
        title="Dlaczego chińskie auta wygrywają ceną?"
        subtitle="Schemat przewagi kosztowej pokazany jak consultingowy model operacyjny: cztery filary budują cost advantage, który finalnie przekłada się na niższą cenę końcową i lepszą konkurencyjność."
        className="border-y border-stroke/70 bg-[linear-gradient(180deg,#fbfbfd_0%,#f3efe7_100%)]"
      >
        <div className="relative overflow-hidden rounded-[34px] border border-stroke/75 bg-[linear-gradient(180deg,#ffffff_0%,#f8f4ed_100%)] p-5 shadow-[0_24px_64px_rgba(23,31,53,0.08)] md:p-7 lg:p-9">
          <div aria-hidden className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#0d2d62]/8 blur-3xl" />
          <div aria-hidden className="absolute right-0 top-16 h-40 w-40 rounded-full bg-[#26a96c]/10 blur-3xl" />
          <div aria-hidden className="absolute bottom-0 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[#26a96c]/10 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-center xl:gap-8">
            <div className="relative rounded-[30px] border border-[#d9dfeb] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7fb_100%)] p-5 shadow-[0_18px_40px_rgba(23,31,53,0.08)] md:p-7">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d2d62]">Schemat przewagi kosztowej</div>

              <div className="relative mt-8 grid gap-4 md:grid-cols-2">
                {costPillars.map((pillar) => {
                  const Icon = pillar.icon
                  const tone = pillarToneClasses[pillar.tone]

                  return (
                    <Card key={pillar.title} className={`rounded-[24px] p-5 shadow-[0_12px_28px_rgba(23,31,53,0.05)] ${tone.card}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className={`max-w-[14ch] text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.kicker}`}>
                          {pillar.title}
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone.iconWrap}`}>
                          <Icon className="h-5 w-5" aria-hidden />
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2">
                        {pillar.points.map((point) => (
                          <div key={point} className={`min-h-[40px] text-sm font-medium leading-relaxed ${tone.text} text-balance`}>
                            {point}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                })}

              </div>
              <div className="mt-6 rounded-[24px] border border-[#d7dee8] bg-white/82 p-4 shadow-[0_12px_28px_rgba(23,31,53,0.04)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0d2d62]">Wniosek strategiczny</div>
                <div className="mt-2 text-lg font-semibold text-[#13233d]">Przewaga kosztowa powstaje wtedy, gdy wszystkie 4 filary wzmacniają się jednocześnie.</div>
              </div>
            </div>

            <div className="grid gap-5">
              <Card className="rounded-[30px] border-[#d6e7dc] bg-[linear-gradient(180deg,#f6fff8_0%,#edf9f1_100%)] p-6 shadow-[0_18px_40px_rgba(38,169,108,0.08)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f7c52]">Wpływ na rynek</div>
                <div className="mt-3 max-w-[16ch] text-[30px] font-semibold leading-tight text-[#123928] text-balance">
                  Niższa cena końcowa wynika z przewagi strukturalnej, a nie tylko z chwilowej promocji.
                </div>

                <div className="mt-6 flex items-center gap-3 text-[#26a96c]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#26a96c]/12">
                    <ChevronRight className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(38,169,108,0.22),rgba(38,169,108,0.7))]" />
                  <div className="rounded-full border border-[#26a96c]/16 bg-white px-4 py-2 text-sm font-semibold text-[#1f7c52]">
                    niższa cena końcowa
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {['niższe koszty', 'kontrola łańcucha dostaw', 'szybkie wdrożenia', 'value for money'].map((item) => (
                    <div key={item} className="flex min-h-[64px] items-center rounded-[22px] border border-[#d6e7dc] bg-white/88 px-4 py-3 text-sm font-medium text-[#234733] shadow-[0_10px_24px_rgba(38,169,108,0.04)] text-balance">
                      {item}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-[30px] border-[#d6e7dc] bg-[linear-gradient(180deg,#f6fff8_0%,#edf9f1_100%)] p-6 shadow-[0_18px_40px_rgba(38,169,108,0.08)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f7c52]">BYD jako przykład</div>
                <div className="mt-3 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#26a96c] text-sm font-bold text-white">
                    BYD
                  </div>
                  <div>
                    <div className="max-w-[18ch] text-xl font-semibold leading-tight text-[#123928] text-balance">
                      Integracja technologii wzmacnia konkurencyjność kosztową.
                    </div>
                    <div className="mt-3 text-sm leading-relaxed text-[#234733]">
                      BYD jest przykładem marki, która łączy produkcję, baterie, technologię i strategię rynkową w jeden spójny model przewagi.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Section>

    </main>
  )
}