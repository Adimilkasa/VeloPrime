import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'

type ValueTile = {
  title: string
  desc: string
}

const values: ValueTile[] = [
  {
    title: 'Transparentnie',
    desc: 'Pokazujemy ceny i estymacje jasno — bez ukrytych kosztów i niepotrzebnych obietnic.',
  },
  {
    title: 'Premium w przystępnej cenie',
    desc: 'Selekcja konfiguracji i rabaty, które mają realną wartość dla klienta.',
  },
  {
    title: 'Bez presji',
    desc: 'Pomagamy podjąć dobrą decyzję w spokojnym tempie — Ty masz kontrolę nad procesem.',
  },
]

export function AboutSection() {
  return (
    <Section
      id="o-nas"
      variant="white"
      className="relative overflow-hidden bg-[url('/grafiki/Seal/premium%202.jpg')] bg-cover bg-center bg-no-repeat before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:bg-black/35"
    >
      <div className="relative z-10">
        <div className="max-w-2xl">
          <Heading level={2} className="text-white">
            O nas
          </Heading>
          <Text className="mt-4 text-white/85">
            Velo Prime to selekcja nowych aut i uporządkowany proces — od wyboru modelu po finansowanie i odbiór.
          </Text>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <Card
              key={v.title}
              className="rounded-2xl bg-white/40 p-6 shadow-card ring-1 ring-white/10 backdrop-blur-lg"
            >
              <div className="h-[2px] w-10 rounded-full bg-brand-gold" aria-hidden />
              <Heading level={3} className="mt-4 text-xl lg:text-xl">
                {v.title}
              </Heading>
              <Text variant="secondary" className="mt-3 text-white/90">
                {v.desc}
              </Text>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}
