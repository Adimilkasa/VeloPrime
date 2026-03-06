import {
  Award,
  BatteryCharging,
  Camera,
  Fuel,
  Gauge,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  Zap,
} from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { EnlargeableImage } from '@/components/ui/EnlargeableImage'
import { cn } from '@/lib/cn'
import type { StrongSidesBoard, StrongSidesIconName, StrongSidesTile } from '@/lib/modelPageContent'

const iconByName: Record<StrongSidesIconName, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  gauge: Gauge,
  fuel: Fuel,
  timer: Timer,
  camera: Camera,
  sparkles: Sparkles,
  sun: Sun,
  zap: Zap,
  shield: ShieldCheck,
  battery: BatteryCharging,
  award: Award,
}

const defaultBoard: StrongSidesBoard = {
  intro: 'Kluczowe liczby i elementy wyposażenia, które realnie przekładają się na komfort i bezpieczeństwo.',
  images: {
    exterior: {
      src: '/grafiki/seal-6-dmi/premium bok.jpg',
      alt: 'BYD Seal 6 DM-i – ujęcie zewnętrzne premium',
    },
    interior: {
      src: '/grafiki/seal-6-dmi/kokpit jasne kanapy.jpg',
      alt: 'BYD Seal 6 DM-i – wnętrze premium',
    },
    tech: {
      src: '/grafiki/seal-6-dmi/ładowanie samochodu.jpg',
      alt: 'BYD Seal 6 DM-i – technologia i ładowanie',
    },
  },
  rows: {
    row1: [
      { value: '1505 km', subtitle: 'zasięgu całkowitego', icon: 'gauge' },
      { value: '1,5 L / 100 km', subtitle: 'zużycie (cykl mieszany ważony)', icon: 'fuel' },
      { value: '0–100 km/h w 8,5 s', subtitle: 'przyspieszenie', icon: 'timer' },
      { value: '491 / 1370 L', subtitle: 'przestrzeni bagażowej', icon: 'sparkles' },
    ],
    row2: [
      { value: '360°', subtitle: 'kamery + ADAS — bezpieczeństwo i komfort', icon: 'camera' },
      { value: '15,6”', subtitle: 'Ambient + ekran — luksusowe i przestronne wnętrze', icon: 'sparkles' },
      { value: 'Szklany dach', subtitle: 'więcej światła w kabinie', icon: 'sun' },
      { value: '50 W', subtitle: 'bezprzewodowe ładowanie', icon: 'zap' },
    ],
    row3: [
      { value: 'Bateria Blade LFP', subtitle: 'wysokie bezpieczeństwo baterii', icon: 'shield' },
      { value: '30–80% ~23 min', subtitle: 'ładowanie DC — szybkie i wygodne', icon: 'battery' },
      { value: '8 lat / 250 000 km', subtitle: 'gwarancji', icon: 'award' },
    ],
  },
}

function TileCard({ tile }: { tile: StrongSidesTile }) {
  const Icon = iconByName[tile.icon]

  return (
    <Card
      className={cn(
        'h-full rounded-2xl p-6',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover',
        'bg-bg-section',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={cn(
              'text-2xl font-semibold tracking-tight text-text-primary leading-tight',
              'min-h-[56px] line-clamp-2',
            )}
          >
            {tile.value}
          </div>
          <div
            className={cn(
              'mt-2 text-sm leading-relaxed text-text-muted',
              'min-h-[44px] line-clamp-2',
            )}
          >
            {tile.subtitle}
          </div>
        </div>
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stroke bg-bg-soft">
          {Icon ? <Icon className="h-5 w-5 text-brand-goldDark" aria-hidden /> : null}
        </span>
      </div>
    </Card>
  )
}

function ImageCard({ src, alt }: { src: string; alt: string }) {
  return (
    <Card className="relative overflow-hidden rounded-2xl bg-bg-soft p-0">
      <div className="relative aspect-[16/11]">
        <EnlargeableImage
          src={src}
          alt={alt}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 640px"
          className="absolute inset-0"
        />
      </div>
    </Card>
  )
}

export function StrongSidesSection({ board }: { board?: StrongSidesBoard }) {
  const data = board ?? defaultBoard
  return (
    <Section id="mocne-strony" variant="soft" className="scroll-mt-32" aria-label="Mocne strony">
      <div className="max-w-2xl">
        <Heading level={2}>Mocne strony</Heading>
        <Text className="mt-3">{data.intro}</Text>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        {/* Row 1 — 4 number tiles */}
        {data.rows.row1.map((tile) => (
          <div key={`${tile.value}-${tile.subtitle}`} className="lg:col-span-3">
            <TileCard tile={tile} />
          </div>
        ))}

        {/* Exterior image + row 2 tiles */}
        <div className="md:col-span-2 lg:col-span-6">
          <ImageCard
            src={data.images.exterior.src}
            alt={data.images.exterior.alt}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {data.rows.row2.map((tile) => (
              <TileCard key={`${tile.value}-${tile.subtitle}`} tile={tile} />
            ))}
          </div>
        </div>

        {/* Two premium images */}
        <div className="lg:col-span-6">
          <ImageCard
            src={data.images.interior.src}
            alt={data.images.interior.alt}
          />
        </div>
        <div className="lg:col-span-6">
          <ImageCard
            src={data.images.tech.src}
            alt={data.images.tech.alt}
          />
        </div>

        {/* Row 3 — technology/exploitation tiles */}
        {data.rows.row3.map((tile) => (
          <div key={`${tile.value}-${tile.subtitle}`} className="lg:col-span-4">
            <TileCard tile={tile} />
          </div>
        ))}
      </div>
    </Section>
  )
}
