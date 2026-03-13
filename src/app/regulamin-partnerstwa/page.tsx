import type { Metadata } from 'next'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'

const regulationsSections = [
  {
    title: '1. Postanowienia ogólne',
    paragraphs: [
      'Niniejszy dokument stanowi Regulamin zakupu szkolenia i uczestnictwa w programie partnerskim Velo Prime, dostępnego za pośrednictwem strony internetowej Velo Prime.',
      'Regulamin określa zasady odpłatnego przystąpienia do programu partnerskiego Velo Prime, płatności, realizacji etapu wdrożeniowego, zasad współpracy oraz wzajemnych praw i obowiązków stron.',
      'Dokument powinien zostać zaakceptowany przed dokonaniem płatności za wybrany pakiet partnerstwa.',
    ],
  },
  {
    title: '2. Dane usługodawcy',
    highlightLines: [
      'PRZYJAZNA NATURA SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
      'ul. Warszawska 183',
      '43-300 Bielsko-Biała',
      'KRS: 0000885111',
      'NIP: 5472223224',
      'REGON: 388204489',
    ],
    paragraphs: [
      'Spółka jest właścicielem marki Velo Prime oraz organizatorem programu partnerskiego opisanego na stronie partnerstwa.',
    ],
  },
  {
    title: '3. Przedmiot programu i zakres świadczenia',
    paragraphs: [
      'Przedmiotem zakupu za pośrednictwem strony partnerstwa jest odpłatne przystąpienie do programu partnerskiego Velo Prime w wybranym pakiecie.',
      'Program partnerski obejmuje etap wdrożeniowy przygotowujący uczestnika do współpracy w modelu sprzedażowym Velo Prime, a także dalsze uczestnictwo w sieci partnerskiej organizatora na zasadach określonych w Regulaminie.',
      'Zakup programu partnerskiego nie stanowi zakupu samochodu, rezerwacji pojazdu ani gwarancji osiągnięcia określonych wyników sprzedażowych, przychodów lub zysków.',
    ],
    bullets: [
      'wdrożenie do modelu współpracy Velo Prime,',
      'etap wdrożeniowy obejmujący sześć sesji szkoleniowo-organizacyjnych,',
      'wsparcie merytoryczne i sprzedażowe,',
      'materiały marketingowe i sprzedażowe przekazywane w toku wdrożenia,',
      'po ukończeniu etapu wdrożeniowego dostęp do narzędzi, systemu CRM, materiałów oraz informacji handlowych, w tym dostępności stocków samochodowych udostępnianych w ramach współpracy organizatora z partnerami motoryzacyjnymi.',
    ],
  },
  {
    title: '4. Zawarcie umowy i rozpoczęcie współpracy',
    paragraphs: [
      'Do zawarcia umowy dochodzi po wyborze pakietu, zaakceptowaniu Regulaminu oraz skutecznym dokonaniu płatności za pośrednictwem udostępnionej metody płatności.',
      'Kupujący zobowiązany jest do podania prawdziwych i kompletnych danych niezbędnych do realizacji programu, obsługi płatności oraz wystawienia dokumentów rozliczeniowych.',
      'Etap wdrożeniowy rozpoczyna się co do zasady w ciągu kilku dni od potwierdzenia zakupu, chyba że strony ustalą inny termin z przyczyn organizacyjnych.',
    ],
    bullets: [
      'wybór pakietu partnerstwa,',
      'wybór formy płatności',
      'akceptacja Regulaminu i Polityki prywatności,',
      'w przypadku osoby prywatnej wyrażenie zgody na rozpoczęcie etapu wdrożeniowego przed upływem 14 dni od zawarcia umowy,',
      'opłacenie zamówienia',
    ],
  },
  {
    title: '5. Ceny i płatności',
    paragraphs: [
      'Ceny pakietów prezentowane na stronie partnerstwa są cenami brutto, chyba że przy ofercie wskazano inaczej.',
      'Kupujący dokonuje płatności przelewem tradycyjnym na rachunek bankowy wskazany po uzupełnieniu formularza zgłoszeniowego.',
      'Kupujący może wybrać płatność jednorazową albo płatność ratalną rozłożoną maksymalnie na trzy raty.',
      'W przypadku wyboru płatności ratalnej kupujący opłaca pierwszą ratę przelewem po rejestracji, natomiast kolejne raty są rozliczane na podstawie faktur wystawianych przez organizatora w miesięcznych odstępach.',
    ],
  },
  {
    title: '6. Etap wdrożeniowy i dostęp do narzędzi',
    paragraphs: [
      'Etap wdrożeniowy trwa co do zasady około 14 dni, chyba że strony ustalą inaczej z przyczyn organizacyjnych.',
      'W okresie wdrożenia uczestnik bierze udział w szkoleniach oraz działaniach organizacyjnych przygotowujących go do współpracy w ramach programu partnerskiego Velo Prime.',
      'Materiały marketingowe, sprzedażowe i informacyjne mogą być przekazywane uczestnikowi już w trakcie trwania etapu wdrożeniowego, w tym po odbyciu pierwszych szkoleń, w zależności od harmonogramu i sposobu organizacji wdrożenia.',
      'Dostęp do systemu, CRM, zasobów operacyjnych oraz informacji handlowych, w tym stocków samochodowych, przyznawany jest po ukończeniu etapu wdrożeniowego albo po spełnieniu warunków organizacyjnych określonych przez organizatora.',
    ],
  },
  {
    title: '7. Charakter współpracy i obowiązki uczestnika',
    paragraphs: [
      'Uczestnictwo w programie partnerskim ma charakter bezterminowy, z zastrzeżeniem przypadków wynikających z Regulaminu, odrębnych ustaleń stron albo zakończenia współpracy zgodnie z obowiązującymi zasadami.',
      'Po zakończeniu etapu wdrożeniowego uczestnik może brać udział w dalszych działaniach realizowanych w ramach programu partnerskiego, w tym w szkoleniach cyklicznych, spotkaniach organizacyjnych, spotkaniach z przedstawicielami marek oraz innych aktywnościach wspierających sprzedaż i współpracę.',
      'Uczestnik programu zobowiązuje się do współpracy organizacyjnej, terminowego przekazywania wymaganych danych oraz korzystania z udostępnianych narzędzi zgodnie z ich przeznaczeniem.',
    ],
    bullets: [
      'podania poprawnych danych kontaktowych i rozliczeniowych,',
      'udziału w ustalonych działaniach wdrożeniowych i organizacyjnych,',
      'korzystania z materiałów, systemów i narzędzi zgodnie z ich przeznaczeniem,',
      'niewykorzystywania materiałów programu w sposób sprzeczny z prawem lub regulaminem',
    ],
  },
  {
    title: '8. Odstąpienie od umowy i rezygnacja',
    paragraphs: [
      'Osoba prywatna, która dokonała zakupu i zrezygnuje przed rozpoczęciem etapu wdrożeniowego, otrzymuje pełny zwrot dokonanej płatności.',
      'W przypadku osoby prywatnej rozpoczęcie etapu wdrożeniowego przed upływem 14 dni od zawarcia umowy następuje po wyrażeniu odpowiedniej zgody w procesie zakupu.',
      'Po rozpoczęciu realizacji etapu wdrożeniowego zwrot opłaty nie przysługuje.',
      'W przypadku przedsiębiorców zasady rezygnacji i zakończenia współpracy określa niniejszy Regulamin oraz warunki współpracy ustalane pomiędzy stronami.',
    ],
  },
  {
    title: '9. Reklamacje',
    paragraphs: [
      'Reklamacje związane z realizacją programu partnerskiego należy składać drogą elektroniczną na adres: velo@veloprime.pl',
      'Reklamacja powinna zawierać dane umożliwiające identyfikację kupującego oraz opis zgłaszanych zastrzeżeń.',
      'Reklamacje są rozpatrywane w terminie do 14 dni od dnia ich otrzymania.',
    ],
  },
  {
    title: '10. Dane osobowe',
    paragraphs: [
      'Zasady przetwarzania danych osobowych uczestników programu opisane są w odrębnej Polityce prywatności dostępnej na stronie internetowej Velo Prime.',
    ],
  },
  {
    title: '11. Postanowienia końcowe',
    paragraphs: [
      'Regulamin powinien być udostępniony użytkownikowi przed dokonaniem płatności oraz pozostawać dostępny w sposób umożliwiający jego zapisanie i odtworzenie.',
      'Organizator zastrzega możliwość aktualizacji regulaminu, przy czym zmiany nie naruszają praw nabytych przez uczestników przed wejściem ich w życie, o ile przepisy prawa nie stanowią inaczej.',
    ],
  },
]

export const metadata: Metadata = {
  title: 'Regulamin zakupu szkolenia i uczestnictwa w programie partnerskim Velo Prime',
  description:
    'Regulamin zakupu szkolenia i uczestnictwa w programie partnerskim Velo Prime.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PartnerRegulationsPage() {
  return (
    <main>
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <section
          aria-label="Regulamin programu partnerskiego"
          className="relative flex min-h-[48vh] max-h-[720px] items-end overflow-hidden bg-[url('/grafiki/byd-dolphin-surf/premium%204.jpg')] bg-cover bg-center bg-no-repeat pt-20"
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,248,250,0.10),rgba(247,248,250,0.18)_40%,rgba(12,18,28,0.42)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,201,119,0.24),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.30),transparent_28%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(247,248,250,0),rgba(247,248,250,0.92))]" />

          <Container className="relative z-10 py-10 md:py-14 lg:py-20">
            <div className="max-w-[920px] overflow-hidden rounded-[28px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.54))] px-5 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.20)] backdrop-blur-xl sm:px-7 sm:py-8 lg:px-10 lg:py-10">
              <div className="h-[2px] w-20 rounded-full bg-[linear-gradient(90deg,#C9A13B,#E6C977)]" />

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Badge variant="gold">Regulamin</Badge>
                <span className="inline-flex rounded-full border border-black/10 bg-white/55 px-3 py-1 text-xs font-medium tracking-[0.16em] text-black/75 uppercase">
                  Program partnerski
                </span>
              </div>

              <Heading level={1} className="mt-5 max-w-[20ch] text-[clamp(2rem,4.6vw,4rem)] leading-[1.04] text-black">
                Regulamin zakupu szkolenia i uczestnictwa w programie partnerskim Velo Prime
              </Heading>
            </div>
          </Container>
        </section>
      </div>

      <Section variant="primary" className="relative">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)]">
          <Card className="h-fit rounded-[24px] border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.9))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:sticky lg:top-24">
            <Text variant="muted" className="uppercase tracking-[0.18em] text-brand-goldDark">
              Dokument
            </Text>
            <Heading level={3} className="mt-3 text-xl lg:text-2xl">
              Informacje podstawowe
            </Heading>
            <Text variant="secondary" className="mt-3">
              Dokument reguluje przystąpienie do programu partnerskiego Velo Prime, płatność, realizację etapu wdrożeniowego oraz zasady dalszej współpracy.
            </Text>

            <div className="mt-6 space-y-4 border-t border-stroke pt-6">
              <div>
                <Text variant="muted">Zakres dokumentu</Text>
                <Text variant="secondary" className="mt-1 text-text-primary">
                  Przystąpienie do programu partnerskiego i etap wdrożeniowy
                </Text>
              </div>

              <div>
                <Text variant="muted">Reklamacje</Text>
                <Text variant="secondary" className="mt-1 text-text-primary">
                  velo@veloprime.pl
                </Text>
              </div>

              <div>
                <Text variant="muted">Powiązana strona</Text>
                <a
                  href="/partnerstwo"
                  className="mt-1 inline-flex text-sm text-text-primary underline decoration-brand-gold/60 underline-offset-4 transition hover:text-brand-goldDark"
                >
                  Partnerstwo Velo Prime
                </a>
              </div>
            </div>

            <div className="mt-6 border-t border-stroke pt-6">
              <Text variant="muted" className="uppercase tracking-[0.18em] text-brand-goldDark">
                Spis sekcji
              </Text>
              <div className="mt-4 grid gap-2">
                {regulationsSections.map((section, index) => (
                  <a
                    key={section.title}
                    href={`#sekcja-${index + 1}`}
                    className="rounded-xl border border-transparent px-3 py-2 text-sm text-text-secondary transition hover:border-brand-gold/20 hover:bg-bg-primary hover:text-text-primary"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden rounded-[28px] border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.94))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-brand-gold/8 blur-3xl" />
              <div className="absolute left-0 top-0 h-[2px] w-32 bg-[linear-gradient(90deg,#C9A13B,#E6C977,transparent)]" />
            </div>

            <div className="relative max-w-[78ch] space-y-12">
              {regulationsSections.map((section, index) => (
                <section
                  id={`sekcja-${index + 1}`}
                  key={section.title}
                  className={index === 0 ? '' : 'border-t border-stroke pt-10'}
                >
                  <div className="mb-4 h-[2px] w-14 rounded-full bg-brand-gold/70" />
                  <Heading level={2} className="text-2xl leading-tight lg:text-3xl">
                    {section.title}
                  </Heading>

                  {section.highlightLines ? (
                    <div className="mt-6 rounded-2xl border border-stroke bg-bg-soft p-5 sm:p-6">
                      <div className="space-y-2">
                        {section.highlightLines.map((line) => (
                          <Text key={line} variant="secondary" className="text-text-primary">
                            {line}
                          </Text>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {section.paragraphs ? (
                    <div className="mt-5 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <Text key={paragraph}>{paragraph}</Text>
                      ))}
                    </div>
                  ) : null}

                  {section.bullets ? (
                    <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-relaxed text-text-secondary marker:text-brand-goldDark lg:text-lg">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </main>
  )
}