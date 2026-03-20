import inventory from '@/data/inventory.json'
import type { InventoryItem } from '@/types/inventory'

import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

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
      <Section
        variant="primary"
        className="relative flex min-h-[72svh] items-end overflow-hidden py-6 sm:min-h-[78vh] sm:items-center sm:py-10 md:min-h-[90vh] md:py-20 lg:py-28 bg-[url('/grafiki/Seal%207/premium%203.jpg')] bg-cover bg-no-repeat bg-[position:60%_54%] sm:bg-[position:64%_56%] md:bg-[position:74%_56%]"
      >
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,239,229,0.36)_0%,rgba(244,239,229,0.38)_24%,rgba(244,239,229,0.78)_72%,rgba(244,239,229,0.94)_100%)] sm:bg-[linear-gradient(90deg,rgba(244,239,229,0.88)_0%,rgba(244,239,229,0.72)_28%,rgba(244,239,229,0.14)_58%,rgba(244,239,229,0)_100%)]" />
        <div className="relative grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,640px)_1fr]">
          <div className="min-w-0 max-w-[640px] w-full">
            <div className="min-w-0 rounded-2xl bg-white/58 px-4 py-5 shadow-card ring-1 ring-black/10 backdrop-blur-lg sm:bg-white/40 sm:px-6 sm:py-7">
              <div className="inline-flex rounded-full border border-brand-gold/25 bg-white/78 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b6a21] backdrop-blur-sm sm:px-4 sm:text-[11px] sm:tracking-[0.18em]">
                Elektryczne i hybrydowe modele BYD
              </div>
              <Heading
                level={1}
                className="mt-4 max-w-[15ch] text-[clamp(1.8rem,8vw,4.5rem)] leading-[0.98] sm:mt-5 sm:max-w-[14ch] sm:leading-[0.95]"
              >
                Elektryczne i hybrydowe modele BYD w jednym miejscu.
              </Heading>

              <Text className="mt-4 max-w-[56ch] text-sm leading-6 sm:mt-6 sm:text-base sm:leading-7">
                Przejrzyj aktualną gamę, poznaj charakter każdego modelu i wybierz auto dopasowane do codziennych potrzeb.
              </Text>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
                <Button href="#elektryczne" variant="primary" size="lg" className="w-full sm:w-auto">
                  Modele elektryczne
                </Button>
                <Button href="#hybrydowe" variant="secondary" size="lg" className="w-full sm:w-auto">
                  Modele hybrydowe
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden md:block" />
        </div>
      </Section>

      <Section variant="white" className="relative overflow-x-hidden" aria-label="Modele – katalog">
        <div id="elektryczne" className="scroll-mt-24">
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

        <div id="hybrydowe" className="mt-16 scroll-mt-24">
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
