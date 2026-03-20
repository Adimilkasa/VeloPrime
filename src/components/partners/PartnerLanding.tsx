import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PartnerJoinForm } from '@/components/partners/PartnerJoinForm'

export function PartnerLanding({ paymentUrl }: { paymentUrl: string }) {
  return (
    <>
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="relative flex items-end overflow-hidden min-h-[68svh] py-6 sm:min-h-[38vh] sm:max-h-[560px] sm:items-center sm:py-0 bg-[url('/assets/HERO.png')] bg-cover bg-no-repeat bg-[position:62%_54%] md:bg-[position:78%_50%]">
          <Container>
            <div className="max-w-[720px]">
              <div className="inline-flex">
                <Badge variant="gold">Partnerstwo</Badge>
              </div>
              <div className="mt-4 rounded-2xl bg-white/58 px-4 py-5 backdrop-blur-lg ring-1 ring-black/10 shadow-card sm:bg-white/40 sm:px-6 sm:py-7">
                <Heading level={1} className="max-w-[28ch]">
                  Landing dla przedstawicieli handlowych
                </Heading>
                <Text className="mt-4 max-w-[62ch] text-sm leading-6 sm:text-base sm:leading-7">
                  Jeśli sprzedajesz bezpośrednio i chcesz pracować na przejrzystych zasadach — dołącz do partnerstwa.
                  Dajemy Ci ofertę modeli, wsparcie i proces, który domyka sprzedaż.
                </Text>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
                    <a href="#dolacz">Dołącz do partnerstwa</a>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                    <a href="#jak-to-dziala">Jak to działa</a>
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <Section variant="white" aria-label="Korzyści partnerstwa">
        <div className="max-w-[80ch]">
          <Heading level={2}>Co zyskujesz</Heading>
          <Text className="mt-3">
            Ten model współpracy jest zbudowany pod tempo sprzedaży: szybki podgląd oferty, jasne warunki i prosta ścieżka do domknięcia.
          </Text>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <Heading level={3}>Oferta i dostępność</Heading>
            <Text className="mt-3" variant="muted">
              Pracujesz na aktualnych modelach i konfiguracjach. Klient widzi konkretne ceny i dostępność.
            </Text>
          </Card>
          <Card className="p-6">
            <Heading level={3}>Przejrzysty proces</Heading>
            <Text className="mt-3" variant="muted">
              Uporządkowany proces kontaktu i doradztwa. Mniej chaosu, więcej domknięć.
            </Text>
          </Card>
          <Card className="p-6">
            <Heading level={3}>Wsparcie sprzedaży</Heading>
            <Text className="mt-3" variant="muted">
              Materiały, argumenty i finansowanie dopasowane do klienta. Ty skupiasz się na rozmowie.
            </Text>
          </Card>
        </div>
      </Section>

      <Section id="jak-to-dziala" variant="soft" aria-label="Jak działa współpraca">
        <Heading level={2}>Jak to działa</Heading>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="p-6" variant="hoverable" goldTopLineOnHover>
            <p className="text-xs font-medium text-text-secondary">Krok 1</p>
            <Heading level={3} className="mt-2">Dołączasz</Heading>
            <Text className="mt-3" variant="muted">
              Opłacasz przystąpienie i zostawiasz dane. Wracamy do Ciebie z krótką rozmową i ustaleniem zakresu.
            </Text>
          </Card>
          <Card className="p-6" variant="hoverable" goldTopLineOnHover>
            <p className="text-xs font-medium text-text-secondary">Krok 2</p>
            <Heading level={3} className="mt-2">Dostajesz narzędzia</Heading>
            <Text className="mt-3" variant="muted">
              Otrzymujesz zestaw materiałów i sposób pracy z ofertą (modele, ceny, finansowanie, argumentacja).
            </Text>
          </Card>
          <Card className="p-6" variant="hoverable" goldTopLineOnHover>
            <p className="text-xs font-medium text-text-secondary">Krok 3</p>
            <Heading level={3} className="mt-2">Sprzedajesz i rozliczasz</Heading>
            <Text className="mt-3" variant="muted">
              Przekazujesz leady/klientów w uzgodniony sposób. Rozliczenie odbywa się według ustalonych zasad partnerstwa.
            </Text>
          </Card>
        </div>
      </Section>

      <Section id="dolacz" variant="white" aria-label="Dołącz do partnerstwa">
        <div className="max-w-[80ch]">
          <Heading level={2}>Dołącz</Heading>
          <Text className="mt-3">
            Najpierw opłać przystąpienie (jeśli wymagane), a następnie wyślij zgłoszenie.
          </Text>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <Card className="p-6">
            <Heading level={3}>Opłata za przystąpienie</Heading>
            <Text className="mt-3" variant="muted">
              Ten krok odfiltrowuje przypadkowe zgłoszenia i przyspiesza onboarding.
            </Text>

            <div className="mt-6">
              {paymentUrl ? (
                <Button asChild variant="primary" size="md">
                  <a href={paymentUrl} target="_blank" rel="noreferrer">
                    Opłać przystąpienie
                  </a>
                </Button>
              ) : (
                <Text variant="muted">
                  Brak podpiętego linku do płatności. Ustaw zmienną{' '}
                  <span className="text-text-secondary">NEXT_PUBLIC_PARTNER_JOIN_PAYMENT_URL</span>.
                </Text>
              )}
            </div>

            <Text className="mt-4" variant="muted">
              Po płatności wypełnij formularz obok — odezwiemy się w sprawie dalszych kroków.
            </Text>
          </Card>

          <Card className="p-6">
            <Heading level={3}>Formularz zgłoszenia</Heading>
            <Text className="mt-3" variant="muted">
              Zostaw dane — wrócimy z krótką rozmową i dopasowaniem zasad współpracy.
            </Text>
            <div className="mt-6">
              <PartnerJoinForm />
            </div>
          </Card>
        </div>
      </Section>
    </>
  )
}
