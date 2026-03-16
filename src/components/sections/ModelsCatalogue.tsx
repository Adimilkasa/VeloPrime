import inventory from '@/data/inventory.json'
import type { InventoryItem } from '@/types/inventory'

import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Container } from '@/components/ui/Container'

import { getAvailableItems } from '@/lib/inventory'
import { groupInventoryByModel } from '@/lib/modelGroups'
import { ModelGroupCard } from '@/components/cards/ModelGroupCard'

export function ModelsCatalogue() {
  const items = getAvailableItems(inventory as InventoryItem[])
  const groups = groupInventoryByModel(items)

  const electric = groups.filter((g) => g.powertrain === 'BEV')
  const hybrid = groups.filter((g) => g.powertrain !== 'BEV')

  return (
    <>
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
        <div className="relative flex items-center overflow-hidden h-[38vh] min-h-[280px] max-h-[520px] bg-[url('/assets/HERO.png')] bg-cover bg-no-repeat bg-[position:72%_56%] md:bg-[position:78%_50%]">
          <Container>
            <div className="max-w-[640px]">
              <div className="rounded-2xl bg-white/40 backdrop-blur-lg ring-1 ring-black/10 shadow-card px-5 py-6 sm:px-6 sm:py-7">
                <Heading level={1}>Modele</Heading>
                <Text className="mt-4 max-w-[60ch]">
                  Wyłącznie nowe auta, estymowane raty i szybki podgląd szczegółów.
                </Text>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <Section variant="white" className="relative" aria-label="Modele – katalog">
        <div>
          <Heading level={2} className="text-lg">Elektryczne</Heading>
          <Text className="mt-2">Modele BEV z estymowaną ratą i szybkim przejściem do szczegółów.</Text>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {electric.map((group) => (
              <div key={group.key} className="h-full">
                <ModelGroupCard group={group} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <Heading level={2} className="text-lg">Hybrydowe</Heading>
          <Text className="mt-2">Modele PHEV z elastycznym wejściem w finansowanie i pełną kartą modelu.</Text>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {hybrid.map((group) => (
              <div key={group.key} className="h-full">
                <ModelGroupCard group={group} />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
