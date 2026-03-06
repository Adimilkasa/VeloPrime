import type { Metadata } from 'next'

import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Reveal } from '@/components/ui/Reveal'

export const metadata: Metadata = {
  title: 'Playground',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PlaygroundPage() {
  return (
    <main>
      <Section variant="primary">
        <Container>
          <Heading level={1}>Playground UI</Heading>
          <Text className="mt-4 max-w-[60ch]">
            Miejsce do testowania komponentów i wariantów bez wpływu na homepage.
          </Text>
        </Container>
      </Section>

      <Section variant="white" title="Velo Prime UI" subtitle="Demo komponentów (PROMPT 4A)">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="gold">Premium</Badge>
          <Badge>Neutral</Badge>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" size="md">Umów konsultację</Button>
          <Button variant="secondary" size="md">Zobacz ofertę</Button>
          <Button variant="ghost" size="md">Kontakt</Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <Card variant="default" className="p-6">
              <Heading level={3}>Card default</Heading>
              <Text className="mt-3">Subtelny cień, obrys stroke i tło sekcji.</Text>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card variant="hoverable" goldTopLineOnHover className="p-6">
              <Heading level={3}>Card hoverable</Heading>
              <Text className="mt-3">
                Hover: translateY(-6px), cień premium i delikatna złota linia.
              </Text>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card variant="hoverable" className="p-6">
              <Heading level={3}>Typografia</Heading>
              <Text className="mt-3">
                Body/Muted/Secondary zgodnie z tokenami. Spacing w sekcjach: py-16/20/28.
              </Text>
              <Text variant="muted" className="mt-3">
                Muted tekst — spokojny, nienachalny.
              </Text>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section variant="soft" title="Background soft" subtitle="bg.bg.soft — #F1F3F6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <Heading level={3}>Komponenty są skalowalne</Heading>
            <Text className="mt-3">Docelowo na tych klockach budujemy kolejne sekcje.</Text>
          </Card>
          <Card className="p-6">
            <Heading level={3}>Framer Motion</Heading>
            <Text className="mt-3">Reveal: opacity 0→1, y 18→0, duration 0.6, easeOut.</Text>
          </Card>
        </div>
      </Section>
    </main>
  )
}
