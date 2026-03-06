import { notFound } from 'next/navigation'
import Image from 'next/image'

import inventory from '@/data/inventory.json'
import type { InventoryItem } from '@/types/inventory'

import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EnlargeableImage } from '@/components/ui/EnlargeableImage'

import { ModelSectionNav } from '@/components/model/ModelSectionNav'
import { getModelPageContent } from '@/lib/modelPageContent'
import { ModelMediaBlocks } from '@/components/model/ModelMediaBlocks'
import { ModelHeroGallery } from '@/components/model/ModelHeroGallery'
import { StrongSidesSection } from '@/components/model/StrongSidesSection'
import { VersionPricing } from '@/components/model/VersionPricing'

import { getAvailableItems } from '@/lib/inventory'
import { groupInventoryByModel } from '@/lib/modelGroups'
import { formatPLN } from '@/lib/pricing'
import { Check } from 'lucide-react'
import type { MediaItem, ModelMedia } from '@/lib/media/seal6dmiMedia'

function pickHeroItems(media: ModelMedia, maxItems = 6): MediaItem[] {
  const unique = new Map<string, MediaItem>()
  const add = (item: MediaItem | undefined | null) => {
    if (!item?.src) return
    if (!unique.has(item.src)) unique.set(item.src, item)
  }

  // Preferred order: explicit hero, then exterior, then interior, then details.
  for (const item of media.hero ?? []) add(item)
  for (const item of media.exteriorGrid ?? []) add(item)
  add(media.interior?.opener)
  for (const item of media.interior?.grid ?? []) add(item)
  for (const item of media.details ?? []) add(item)

  return [...unique.values()].slice(0, Math.max(1, maxItems))
}

export default async function ModelDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const available = getAvailableItems(inventory as InventoryItem[])
  const groups = groupInventoryByModel(available)
  const group = groups.find((g) => g.slug === slug)

  if (!group) notFound()

  const groupItems = group.items

  const netValues = groupItems
    .map((i) => i.ourPriceNet)
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0)
  const grossValues = groupItems
    .map((i) => i.ourPriceGross)
    .filter((n): n is number => Number.isFinite(n) && n > 0)

  const minNet = netValues.length ? Math.min(...netValues) : null
  const minGross = grossValues.length ? Math.min(...grossValues) : null

  const content = getModelPageContent({
    slug,
    brand: group.brand,
    model: group.model,
  })

  const heroItems = content.media ? pickHeroItems(content.media) : []

  const navItems = [
    { id: 'design', label: 'Design' },
    { id: 'mocne-strony', label: 'Mocne strony' },
    { id: 'wersje', label: 'Wersje' },
    { id: 'specyfikacja-pdf', label: 'Specyfikacja PDF' },
    { id: 'rabat', label: 'Rabat' },
  ]

  function pickCheapestItem(items: InventoryItem[]) {
    const candidates = items.filter((x) => typeof x.ourPriceGross === 'number' && x.ourPriceGross > 0)
    if (!candidates.length) return null
    return candidates.reduce((best, cur) => {
      const bestPrice = best.ourPriceGross ?? Number.POSITIVE_INFINITY
      const curPrice = cur.ourPriceGross ?? Number.POSITIVE_INFINITY
      return curPrice < bestPrice ? cur : best
    })
  }

  function pickCheapestByTrimLabel(trimLabel: string) {
    const label = String(trimLabel || '').trim().toLowerCase()
    if (!label) return null

    const exact = groupItems.filter((x) => x.trim.trim().toLowerCase() === label)
    const exactBest = pickCheapestItem(exact)
    if (exactBest) return exactBest

    const inclusive = groupItems.filter((x) => {
      const t = x.trim.toLowerCase()
      return t.includes(label) || label.includes(t)
    })
    return pickCheapestItem(inclusive)
  }

  const uniqueVersionItems = group.trims
    .map((trim) => {
      const itemsForTrim = groupItems.filter((x) => x.trim === trim)
      return pickCheapestItem(itemsForTrim)
    })
    .filter((x): x is InventoryItem => Boolean(x))

  return (
    <main aria-label="Szczegóły modelu">
      {content.media ? (
        <section
          aria-label="Hero modelu"
          className="relative h-[calc(100vh-4rem)] min-h-[680px] bg-bg-section"
        >
          <ModelHeroGallery items={heroItems} />
        </section>
      ) : (
        <Section variant="white" className="relative" aria-label="Hero modelu">
          <div className="max-w-[75ch]">
            <Text variant="muted" className="uppercase tracking-wide">
              {group.brand}
            </Text>
            <Heading level={1} className="mt-2">
              {group.model}
            </Heading>
            <Text className="mt-4">
              Poznaj kluczowe informacje o modelu i przejdź do wersji, specyfikacji oraz aktualnych warunków rabatu.
            </Text>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Card className="rounded-2xl bg-bg-section p-6">
              <Text variant="muted">Już od (brutto)</Text>
              <Text className="mt-2 text-2xl font-semibold text-text-primary">
                {minGross ? formatPLN(minGross) : '—'}
              </Text>
            </Card>
            <Card className="rounded-2xl bg-bg-section p-6">
              <Text variant="muted">Już od (netto)</Text>
              <Text className="mt-2 text-2xl font-semibold text-text-primary">
                {minNet ? formatPLN(minNet) : '—'}
              </Text>
            </Card>
          </div>
        </Section>
      )}

      <ModelSectionNav items={navItems} />

      <Section
        id="design"
        variant="white"
        className="scroll-mt-32 pt-10 md:pt-12 lg:pt-16"
      >
        {content.media ? <ModelMediaBlocks media={content.media} /> : null}
      </Section>

      {content.sections.strengths.board ? (
        <StrongSidesSection board={content.sections.strengths.board} />
      ) : (
        <Section
          id="mocne-strony"
          variant="soft"
          title="Mocne strony"
          subtitle={content.sections.strengths.intro}
          className="scroll-mt-32"
        >
          <div className="grid gap-6 md:grid-cols-3">
            {content.sections.strengths.items.map((x) => (
              <Card key={x.title} className="rounded-2xl p-6">
                <div className="h-[2px] w-10 rounded-full bg-brand-gold" aria-hidden />
                <Heading level={3} className="mt-4 text-xl lg:text-xl">
                  {x.title}
                </Heading>
                <Text variant="secondary" className="mt-3">
                  {x.desc}
                </Text>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section
        id="wersje"
        variant="white"
        title="Wersje"
        subtitle={content.sections.versions.intro}
        className="scroll-mt-32"
      >
        {content.sections.versions.cards ? (
          <div className="grid gap-6 md:grid-cols-2">
            {content.sections.versions.cards.items.map((card) => {
              const recommendedTrim = content.sections.versions.cards?.recommendedTrim
              const recommended =
                Boolean(recommendedTrim) &&
                card.trim.toLowerCase().includes(String(recommendedTrim).toLowerCase())
              const item = pickCheapestByTrimLabel(card.trim)

              return (
                <Card
                  key={card.trim}
                  variant="hoverable"
                  goldTopLineOnHover
                  className={
                    'flex h-full flex-col rounded-2xl p-6 ' +
                    (recommended ? 'bg-bg-soft' : '')
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Heading level={3} className="text-xl lg:text-xl line-clamp-1 min-h-[28px]">
                        {card.trim}
                      </Heading>
                      <Text variant="muted" className="mt-1">
                        {item?.year ?? '—'}
                      </Text>
                    </div>
                    {recommended && (card.badge || 'Polecana') ? (
                      <Badge variant="gold">{card.badge || 'Polecana'}</Badge>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    <VersionPricing ourPriceGross={item?.ourPriceGross} ourPriceNet={item?.ourPriceNet} months={60} />
                  </div>

                  <ul className="mt-6 space-y-2">
                    {card.bullets.map((label) => (
                      <li key={label} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                        <Check className="mt-0.5 h-4 w-4 text-brand-goldDark" aria-hidden />
                        <span className="line-clamp-2 min-h-[40px]">{label}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <Button
                      href="/#kontakt"
                      variant={recommended ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      {card.ctaLabel}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {uniqueVersionItems.map((item) => {
              const isRecommended = item.trim.toLowerCase().includes('comfort')

              return (
                <Card
                  key={`${item.brand}-${item.model}-${item.trim}-${item.year}`}
                  variant="hoverable"
                  goldTopLineOnHover
                  className={
                    'flex h-full flex-col rounded-2xl p-6 ' +
                    (isRecommended ? 'bg-bg-soft' : '')
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Heading level={3} className="text-xl lg:text-xl">
                        {item.trim}
                      </Heading>
                      <Text variant="muted" className="mt-1">
                        {item.year}
                      </Text>
                    </div>
                    {isRecommended ? <Badge variant="gold">Polecana</Badge> : null}
                  </div>

                  <div className="mt-6">
                    <VersionPricing ourPriceGross={item.ourPriceGross} ourPriceNet={item.ourPriceNet} months={60} />
                  </div>

                  <div className="mt-auto pt-6">
                    <Button
                      href="/#kontakt"
                      variant={isRecommended ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      Zapytaj o ofertę
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Section>

      <Section
        id="specyfikacja-pdf"
        variant="soft"
        title={content.sections.specPdf.premium ? undefined : 'Specyfikacja PDF'}
        subtitle={content.sections.specPdf.premium ? undefined : content.sections.specPdf.intro}
        className="scroll-mt-32"
      >
        {content.sections.specPdf.premium ? (
          <Card className="relative overflow-hidden rounded-2xl p-6 sm:p-8">
            <div aria-hidden className="absolute inset-0">
              <Image
                src={content.sections.specPdf.premium.backgroundImageSrc}
                alt=""
                fill
                className="object-cover opacity-[0.16] blur-[1px]"
                sizes="(max-width: 1024px) 100vw, 1280px"
                priority={false}
              />
              <div className="absolute inset-0 bg-bg-soft" style={{ opacity: 0.55 }} />
            </div>

            <div className="relative">
              <Heading level={2}>Specyfikacja PDF</Heading>
              <Text className="mt-3 max-w-[75ch]">
                {content.sections.specPdf.premium.description}
              </Text>

              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {content.sections.specPdf.premium.checklist.map((label) => (
                  <li key={label} className="flex items-start gap-3 rounded-xl border border-stroke bg-bg-section/80 p-4">
                    <Check className="mt-0.5 h-4 w-4 text-brand-goldDark" aria-hidden />
                    <span className="text-sm leading-relaxed text-text-secondary line-clamp-2 min-h-[40px]">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
                  <a href={content.sections.specPdf.href} target="_blank" rel="noreferrer">
                    {content.sections.specPdf.premium.ctaLabel}
                  </a>
                </Button>
                <Text variant="muted" className="sm:ml-2">
                  {content.sections.specPdf.premium.helperText}
                </Text>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="rounded-2xl p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-[70ch]">
                <Text variant="secondary">
                  {content.brand} {content.model}
                </Text>
                <Text variant="muted" className="mt-2">
                  Karta katalogowa zawiera pełne wyposażenie i dane techniczne.
                </Text>
              </div>

              <div className="w-full sm:w-auto">
                <Button asChild variant="primary" size="md" className="w-full sm:w-auto">
                  <a href={content.sections.specPdf.href} target="_blank" rel="noreferrer">
                    {content.sections.specPdf.label}
                  </a>
                </Button>
                <Text variant="muted" className="mt-2 text-center sm:text-left">
                  Otwiera się w nowej karcie.
                </Text>
              </div>
            </div>
          </Card>
        )}
      </Section>

      <Section
        id="rabat"
        variant="white"
        title={content.sections.discount.premium ? undefined : 'Rabat'}
        subtitle={content.sections.discount.premium ? undefined : content.sections.discount.body}
        className="scroll-mt-32"
      >
        {content.sections.discount.premium ? (
          <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
            <Card className="relative overflow-hidden rounded-2xl p-0 lg:col-span-8">
              <div className="relative aspect-[16/10] sm:aspect-[16/8]">
                <EnlargeableImage
                  src={content.sections.discount.premium.promoImageSrc}
                  alt=""
                  sizes="(max-width: 1024px) 100vw, 860px"
                  className="absolute inset-0"
                  imageClassName="object-cover"
                  buttonClassName="z-0"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="max-w-[75ch]">
                    <div className="text-xs font-medium uppercase tracking-wide text-white/80">Rabat</div>
                    <div className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                      {content.sections.discount.headline}
                    </div>
                    <div className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                      {content.sections.discount.body}
                    </div>

                    <div className="mt-6">
                      <Button href="/#kontakt" variant="primary" size="lg">
                        {content.sections.discount.premium.ctaLabel}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 sm:p-8 lg:col-span-4">
              <Heading level={3} className="text-xl">
                Korzyści
              </Heading>
              <ul className="mt-5 space-y-3">
                {content.sections.discount.premium.benefits.map((label) => (
                  <li key={label} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                    <Check className="mt-0.5 h-4 w-4 text-brand-goldDark" aria-hidden />
                    <span className="line-clamp-2 min-h-[40px]">{label}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ) : (
          <Card className="rounded-2xl p-6 sm:p-7">
            <Heading level={3} className="text-xl">
              {content.sections.discount.headline}
            </Heading>
            <Text variant="secondary" className="mt-3 max-w-[70ch]">
              Zostaw kontakt, a przygotujemy konkretną ofertę (rabat + finansowanie) pod Twoją konfigurację.
            </Text>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/#kontakt" variant="primary" size="md">
                Poproś o ofertę
              </Button>
            </div>
          </Card>
        )}
      </Section>
    </main>
  )
}
