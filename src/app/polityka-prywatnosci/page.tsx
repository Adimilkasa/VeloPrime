import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { Badge } from '@/components/ui/Badge'

const policySections = [
  {
    title: '1. Informacje ogólne',
    paragraphs: [
      'Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych użytkowników korzystających ze strony internetowej www.veloprime.pl.',
      'Dbamy o prywatność użytkowników oraz bezpieczeństwo przekazywanych danych osobowych. Dane są przetwarzane zgodnie z obowiązującymi przepisami prawa, w szczególności zgodnie z:',
    ],
    bullets: [
      'Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO),',
      'ustawą o ochronie danych osobowych,',
      'ustawą o świadczeniu usług drogą elektroniczną.',
    ],
  },
  {
    title: '2. Administrator danych osobowych',
    paragraphs: ['Administratorem danych osobowych jest:'],
    highlightLines: [
      'PRZYJAZNA NATURA SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
      'ul. Warszawska 183',
      '43-300 Bielsko-Biała',
      'woj. śląskie, Polska',
      'KRS: 0000885111',
      'NIP: 5472223224',
      'REGON: 388204489',
    ],
    bodyAfterHighlight: [
      'Spółka PRZYJAZNA NATURA Sp. z o.o. jest właścicielem marki Velo Prime oraz właścicielem i operatorem serwisu internetowego www.veloprime.pl.',
    ],
  },
  {
    title: '3. Zakres przetwarzanych danych',
    paragraphs: ['Administrator może przetwarzać następujące dane osobowe użytkowników:'],
    bullets: [
      'imię i nazwisko',
      'numer telefonu',
      'adres e-mail',
      'adres zamieszkania lub adres inwestycji',
      'dane przekazane w formularzu kontaktowym',
      'adres IP',
      'dane dotyczące korzystania ze strony internetowej',
    ],
    bodyAfterHighlight: [
      'Podanie danych jest dobrowolne, jednak w niektórych przypadkach może być niezbędne do realizacji usługi lub kontaktu.',
    ],
  },
  {
    title: '4. Cele przetwarzania danych',
    paragraphs: ['Dane osobowe przetwarzane są w następujących celach:'],
    numbered: [
      'udzielenia odpowiedzi na zapytania przesłane przez formularz kontaktowy, telefon lub e-mail',
      'przygotowania oferty handlowej',
      'realizacji usług oferowanych przez Administratora',
      'obsługi klienta',
      'prowadzenia działań marketingowych',
      'prowadzenia statystyk oraz analizy ruchu na stronie',
      'dochodzenia lub obrony przed roszczeniami',
    ],
    bodyAfterHighlight: ['Podstawą prawną przetwarzania danych jest:'],
    bulletsAfter: [
      'art. 6 ust. 1 lit. a RODO – zgoda użytkownika',
      'art. 6 ust. 1 lit. b RODO – realizacja umowy lub działania przed jej zawarciem',
      'art. 6 ust. 1 lit. f RODO – prawnie uzasadniony interes administratora',
    ],
  },
  {
    title: '5. Odbiorcy danych',
    paragraphs: [
      'Dane osobowe mogą być przekazywane podmiotom współpracującym z administratorem, w szczególności:',
    ],
    bullets: [
      'firmom informatycznym obsługującym systemy IT',
      'firmom hostingowym',
      'dostawcom narzędzi marketingowych',
      'kancelariom prawnym',
      'podmiotom wspierającym realizację usług',
    ],
    bodyAfterHighlight: [
      'Dane nie są sprzedawane ani udostępniane podmiotom trzecim w celach handlowych.',
    ],
  },
  {
    title: '6. Okres przechowywania danych',
    paragraphs: ['Dane osobowe przechowywane są przez okres:'],
    bullets: [
      'niezbędny do realizacji celu przetwarzania',
      'wymagany przez przepisy prawa',
      'do momentu cofnięcia zgody przez użytkownika',
    ],
  },
  {
    title: '7. Prawa użytkownika',
    paragraphs: ['Użytkownik ma prawo do:'],
    bullets: [
      'dostępu do swoich danych',
      'sprostowania danych',
      'usunięcia danych',
      'ograniczenia przetwarzania',
      'przenoszenia danych',
      'wniesienia sprzeciwu wobec przetwarzania danych',
      'cofnięcia zgody na przetwarzanie danych',
    ],
    bodyAfterHighlight: [
      'W celu realizacji swoich praw należy skontaktować się z administratorem.',
      'Użytkownik ma również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).',
    ],
  },
  {
    title: '8. Pliki cookies',
    paragraphs: [
      'Strona internetowa korzysta z plików cookies (tzw. ciasteczek).',
      'Cookies to niewielkie pliki tekstowe zapisywane na urządzeniu użytkownika, które umożliwiają:',
    ],
    bullets: [
      'prawidłowe działanie strony internetowej',
      'analizę ruchu na stronie',
      'poprawę funkcjonalności serwisu',
      'prowadzenie działań marketingowych',
    ],
    bodyAfterHighlight: [
      'Narzędzia analityczne uruchamiane są po wyrażeniu zgody w banerze cookies. Użytkownik może również w każdej chwili zmienić ustawienia cookies w swojej przeglądarce internetowej.',
    ],
  },
  {
    title: '9. Narzędzia analityczne i marketingowe',
    paragraphs: ['Strona może korzystać z narzędzi takich jak:'],
    bullets: ['Google Analytics 4', 'Microsoft Clarity', 'Google Ads', 'Meta (Facebook) Pixel'],
    bodyAfterHighlight: [
      'Narzędzia te mogą zbierać informacje dotyczące korzystania ze strony w celu analizy ruchu, badania zachowań użytkowników oraz prowadzenia działań marketingowych, zgodnie z zakresem udzielonej zgody.',
    ],
  },
  {
    title: '10. Zabezpieczenie danych',
    paragraphs: [
      'Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające ochronę przetwarzanych danych osobowych, w szczególności zabezpieczenia chroniące dane przed:',
    ],
    bullets: [
      'nieuprawnionym dostępem',
      'utratą danych',
      'uszkodzeniem lub zniszczeniem danych',
    ],
  },
  {
    title: '11. Zmiany polityki prywatności',
    paragraphs: [
      'Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności.',
      'Nowa wersja dokumentu będzie publikowana na stronie internetowej.',
    ],
  },
  {
    title: '12. Kontakt',
    paragraphs: ['W sprawach dotyczących przetwarzania danych osobowych można kontaktować się z administratorem:'],
    highlightLines: [
      'PRZYJAZNA NATURA Sp. z o.o.',
      'ul. Warszawska 183',
      '43-300 Bielsko-Biała',
    ],
  },
]

export const metadata: Metadata = {
  title: 'Polityka prywatności',
  description: 'Informacje o przetwarzaniu danych osobowych i zasadach prywatności w Velo Prime.',
  openGraph: {
    title: 'Polityka prywatności - Velo Prime',
    description: 'Informacje o przetwarzaniu danych osobowych i zasadach prywatności w Velo Prime.',
    images: [{ url: '/grafiki/Seal%207/premium%203.jpg' }],
  },
}

export default function PrivacyPolicyPage() {
  return (
    <main>
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <section
          aria-label="Polityka prywatności"
          className="relative flex min-h-[48vh] max-h-[720px] items-end overflow-hidden bg-[url('/grafiki/Seal%207/premium%203.jpg')] bg-cover bg-center bg-no-repeat pt-20"
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,248,250,0.08),rgba(247,248,250,0.16)_40%,rgba(12,18,28,0.38)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,201,119,0.26),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.32),transparent_28%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(247,248,250,0),rgba(247,248,250,0.92))]" />

          <Container className="relative z-10 py-10 md:py-14 lg:py-20">
            <div className="max-w-[820px] overflow-hidden rounded-[28px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.54))] px-5 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.20)] backdrop-blur-xl sm:px-7 sm:py-8 lg:px-10 lg:py-10">
              <div className="h-[2px] w-20 rounded-full bg-[linear-gradient(90deg,#C9A13B,#E6C977)]" />

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Badge variant="gold">Dokument</Badge>
                <span className="inline-flex rounded-full border border-black/10 bg-white/55 px-3 py-1 text-xs font-medium tracking-[0.16em] text-black/75 uppercase">
                  Ochrona danych
                </span>
              </div>

              <Heading level={1} className="mt-5 max-w-[15ch] text-[clamp(2.3rem,5vw,4.5rem)] leading-[1.02] text-black">
                Polityka prywatności
              </Heading>

              <div className="mt-7 flex flex-wrap gap-3 text-sm text-black/74">
                <span className="inline-flex items-center rounded-full border border-black/10 bg-white/55 px-3 py-1.5">
                  RODO
                </span>
                <span className="inline-flex items-center rounded-full border border-black/10 bg-white/55 px-3 py-1.5">
                  Cookies
                </span>
                <span className="inline-flex items-center rounded-full border border-black/10 bg-white/55 px-3 py-1.5">
                  Kontakt z administratorem
                </span>
              </div>
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
              Najważniejsze informacje
            </Heading>
            <Text variant="secondary" className="mt-3">
              Dokument opisuje zasady przetwarzania danych osobowych, wykorzystania plików cookies oraz prawa użytkowników serwisu Velo Prime.
            </Text>

            <div className="mt-6 space-y-4 border-t border-stroke pt-6">
              <div>
                <Text variant="muted">Administrator</Text>
                <Text variant="secondary" className="mt-1 text-text-primary">
                  PRZYJAZNA NATURA Sp. z o.o.
                </Text>
              </div>

              <div>
                <Text variant="muted">Strona internetowa</Text>
                <a
                  href="http://www.veloprime.pl"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-sm text-text-primary underline decoration-brand-gold/60 underline-offset-4 transition hover:text-brand-goldDark"
                >
                  www.veloprime.pl
                </a>
              </div>
            </div>

            <div className="mt-6 border-t border-stroke pt-6">
              <Text variant="muted" className="uppercase tracking-[0.18em] text-brand-goldDark">
                Spis sekcji
              </Text>
              <div className="mt-4 grid gap-2">
                {policySections.map((section, index) => (
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
              {policySections.map((section, index) => (
                <section
                  id={`sekcja-${index + 1}`}
                  key={section.title}
                  className={index === 0 ? '' : 'border-t border-stroke pt-10'}
                >
                  <div className="mb-4 h-[2px] w-14 rounded-full bg-brand-gold/70" />
                  <Heading level={2} className="text-2xl lg:text-3xl leading-tight">
                    {section.title}
                  </Heading>

                  {section.paragraphs ? (
                    <div className="mt-5 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <Text key={paragraph}>{paragraph}</Text>
                      ))}
                    </div>
                  ) : null}

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

                  {section.numbered ? (
                    <ol className="mt-5 space-y-3 pl-5 text-base leading-relaxed text-text-secondary marker:font-semibold marker:text-text-primary lg:text-lg">
                      {section.numbered.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  ) : null}

                  {section.bullets ? (
                    <ul className="mt-5 space-y-3 pl-5 text-base leading-relaxed text-text-secondary marker:text-brand-goldDark list-disc lg:text-lg">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}

                  {section.bodyAfterHighlight ? (
                    <div className="mt-5 space-y-4">
                      {section.bodyAfterHighlight.map((paragraph) => (
                        <Text key={paragraph}>{paragraph}</Text>
                      ))}
                    </div>
                  ) : null}

                  {section.bulletsAfter ? (
                    <ul className="mt-5 space-y-3 pl-5 text-base leading-relaxed text-text-secondary marker:text-brand-goldDark list-disc lg:text-lg">
                      {section.bulletsAfter.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}

                  {section.title === '12. Kontakt' ? (
                    <div className="mt-5">
                      <Text>
                        Strona:{' '}
                        <a
                          href="http://www.veloprime.pl"
                          target="_blank"
                          rel="noreferrer"
                          className="text-text-primary underline decoration-brand-gold/60 underline-offset-4 transition hover:text-brand-goldDark"
                        >
                          www.veloprime.pl
                        </a>
                      </Text>
                    </div>
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