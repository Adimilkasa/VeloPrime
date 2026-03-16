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
    title: 'Jasne warunki',
    desc: 'Pokazujemy ofertę i estymacje finansowania w przejrzysty sposób — bez zbędnych komplikacji i niedopowiedzeń.',
  },
  {
    title: 'Staranna selekcja modeli',
    desc: 'Koncentrujemy się na samochodach i konfiguracjach, które realnie odpowiadają na potrzeby klientów premium.',
  },
  {
    title: 'Proces bez presji',
    desc: 'Pomagamy przejść przez wybór auta i finansowania w uporządkowany sposób, z pełną kontrolą po stronie klienta.',
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
            Velo Prime to nowoczesne podejście do sprzedaży nowych samochodów. Łączymy starannie wybrane modele, przejrzyste warunki i sprawny proces obsługi — od pierwszego wyboru aż po finansowanie i odbiór auta.
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
