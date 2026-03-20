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
        <div
          className="relative flex h-[50vh] min-h-[380px] max-h-[720px] items-center overflow-hidden bg-[linear-gradient(180deg,#f4efe5_0%,#ece3d3_100%)] md:h-[58vh] md:min-h-[500px]"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[url('/grafiki/Seal%207/premium%203.jpg')] bg-contain bg-center bg-no-repeat"
          />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_42%,rgba(244,239,229,0.34)_78%,rgba(236,227,211,0.72)_100%)]" />

          <Container>
            <div className="relative max-w-[640px]">
              <div className="rounded-2xl bg-white/40 backdrop-blur-lg ring-1 ring-black/10 shadow-card px-5 py-6 sm:px-6 sm:py-7">
                <Heading level={1}>Modele</Heading>
                <Text className="mt-4 max-w-[60ch]">
                  Wyłącznie nowe auta i szybki podgląd najważniejszych szczegółów modeli.
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

          <div className="mt-8 grid gap-6 items-stretch">
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

          <div className="mt-8 grid gap-6 items-stretch">
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
