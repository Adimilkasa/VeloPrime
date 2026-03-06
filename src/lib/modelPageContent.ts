import type { ModelMedia } from '@/lib/media/seal6dmiMedia'
import { seal6dmiMedia } from '@/lib/media/seal6dmiMedia'
import { generatedBySlug } from '@/generated/models'

export type { ModelMedia }

export type ModelPageSectionContent = {
  design: {
    intro: string
    bullets: string[]
  }
  strengths: {
    intro?: string
    items: Array<{ title: string; desc: string }>
    board?: StrongSidesBoard
  }
  versions: {
    intro: string
    cards?: {
      recommendedTrim?: string
      items: Array<{
        trim: string
        badge?: string
        bullets: string[]
        ctaLabel: string
      }>
    }
  }
  specPdf: {
    intro: string
    href: string
    label: string
    premium?: {
      backgroundImageSrc: string
      description: string
      checklist: string[]
      ctaLabel: string
      helperText: string
    }
  }
  discount: {
    headline: string
    body: string
    premium?: {
      promoImageSrc: string
      benefits: string[]
      ctaLabel: string
    }
  }
}

export type StrongSidesIconName =
  | 'gauge'
  | 'fuel'
  | 'timer'
  | 'camera'
  | 'sparkles'
  | 'sun'
  | 'zap'
  | 'shield'
  | 'battery'
  | 'award'

export type StrongSidesTile = {
  value: string
  subtitle: string
  icon: StrongSidesIconName
}

export type StrongSidesBoard = {
  intro: string
  images: {
    exterior: { src: string; alt: string }
    interior: { src: string; alt: string }
    tech: { src: string; alt: string }
  }
  rows: {
    row1: StrongSidesTile[]
    row2: StrongSidesTile[]
    row3: StrongSidesTile[]
  }
}

export type ModelPageContent = {
  slug: string
  brand: string
  model: string
  media?: ModelMedia
  sections: ModelPageSectionContent
}

const mockBySlug: Record<string, ModelPageContent> = {
  // Example mock (extend per real slugs as needed)
  'byd-atto-2': {
    slug: 'byd-atto-2',
    brand: 'BYD',
    model: 'Atto 2',
    sections: {
      design: {
        intro:
          'Minimalistyczne wnętrze, dopracowane detale i spokojna linia nadwozia. Tu liczy się realny komfort w codziennym użytkowaniu.',
        bullets: [
          'Duży ekran centralny i czytelny kokpit',
          'Wygodne fotele i ergonomia na długie trasy',
          'Przemyślane schowki i funkcjonalność',
        ],
      },
      strengths: {
        intro: 'Najważniejsze przewagi w skrócie — bez marketingowego hałasu.',
        items: [
          {
            title: 'Technologia w standardzie',
            desc: 'Bogate wyposażenie i systemy wsparcia kierowcy w wielu konfiguracjach.',
          },
          {
            title: 'Komfort i cisza',
            desc: 'Stabilne prowadzenie i dopracowane wyciszenie przy wyższych prędkościach.',
          },
          {
            title: 'Zasięg i efektywność',
            desc: 'Rozsądny kompromis pomiędzy dynamiką a zużyciem energii w realnym ruchu.',
          },
        ],
      },
      versions: {
        intro: 'Poniżej dostępne warianty i ceny (na żywo z inventory).',
      },
      specPdf: {
        intro: 'Pełna specyfikacja i wyposażenie w pliku PDF.',
        href: '/spec/byd-atto-2.pdf',
        label: 'Pobierz PDF',
      },
      discount: {
        headline: 'Rabat i warunki',
        body: 'Sprawdź aktualny rabat i dostępne formy finansowania — przygotujemy konkretną propozycję po krótkiej konsultacji.',
      },
    },
  },

  'byd-seal-6': {
    slug: 'byd-seal-6',
    brand: 'BYD',
    model: 'Seal 6',
    media: seal6dmiMedia,
    sections: {
      design: {
        intro:
          'Dynamiczna sylwetka, dopracowane detale i wnętrze nastawione na komfort. Poniżej ujęcia zewnętrzne, wnętrze i kluczowe detale.',
        bullets: [
          'Spójna linia nadwozia i „premium” proporcje',
          'Wnętrze z naciskiem na ergonomię i czytelność',
          'Detale, które robią różnicę w odbiorze jakości',
        ],
      },
      strengths: {
        intro: 'Najważniejsze przewagi w skrócie — bez hałasu.',
        items: [
          {
            title: 'DM-i (PHEV) w praktyce',
            desc: 'Elastyczność na co dzień i w trasie — sensowny kompromis między spokojem a osiągami.',
          },
          {
            title: 'Wyposażenie i komfort',
            desc: 'Rozsądnie dobrane elementy wyposażenia oraz dopracowane wyciszenie.',
          },
          {
            title: 'Nowoczesne systemy wsparcia',
            desc: 'Bezpieczeństwo i wygoda w ruchu miejskim i na drogach szybkiego ruchu.',
          },
        ],
        board: {
          intro:
            'Kluczowe liczby i elementy wyposażenia, które realnie przekładają się na komfort i bezpieczeństwo.',
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
        },
      },
      versions: {
        intro:
          'Wybierz wariant dopasowany do stylu jazdy. Comfort daje większy zasięg elektryczny i bogatsze wyposażenie.',
        cards: {
          recommendedTrim: 'Comfort',
          items: [
            {
              trim: 'Boost',
              bullets: [
                'Zasięg EV (WLTP): 55 km (mieszany), 75 km (miejski)',
                'Bateria: 10,08 kWh',
                'Ładowanie AC: 3,3 kW',
                '0–100 km/h: 8,9 s',
                'Ekran: 12,8”',
                'Audio: 6 głośników',
              ],
              ctaLabel: 'Zapytaj o ofertę',
            },
            {
              trim: 'Comfort',
              badge: 'Polecana',
              bullets: [
                'Zasięg EV (WLTP): 105 km (mieszany), 140 km (miejski)',
                'Bateria: 19 kWh',
                'Ładowanie AC: 6,6 kW',
                'Ładowanie DC: do 26 kW (30–80% ~23 min)',
                '0–100 km/h: 8,5 s',
                'Ekran: 15,6” + audio 8 głośników Hi-Fi',
              ],
              ctaLabel: 'Zapytaj o ofertę',
            },
          ],
        },
      },
      specPdf: {
        intro: 'Pełna specyfikacja i wyposażenie w pliku PDF — porównanie Boost i Comfort.',
        href: '/spec/seal-6-dmi.pdf',
        label: 'Pobierz specyfikację (PDF)',
        premium: {
          backgroundImageSrc: '/grafiki/seal-6-dmi/premium bok.jpg',
          description: 'Pełna specyfikacja i wyposażenie w pliku PDF — porównanie Boost i Comfort.',
          checklist: [
            'Wyposażenie standardowe i funkcje',
            'Dane techniczne i osiągi',
            'Porównanie wersji (Boost vs Comfort)',
          ],
          ctaLabel: 'Pobierz specyfikację (PDF)',
          helperText: 'Pobieranie rozpocznie się automatycznie.',
        },
      },
      discount: {
        headline: 'Skorzystaj z indywidualnego rabatu',
        body:
          'Podczas konsultacji przedstawimy aktualne możliwości rabatowe oraz dopasujemy finansowanie do Twojej sytuacji.',
        premium: {
          promoImageSrc: '/grafiki/seal-6-dmi/premium tył samochodu.jpg',
          benefits: [
            'Rabat dopasowany do konfiguracji i dostępności',
            'Leasing lub kredyt — dobór do potrzeb',
            'Szybka odpowiedź z konkretną wyceną',
          ],
          ctaLabel: 'Zapytaj o ofertę',
        },
      },
    },
  },
}

function titleCaseFromSlug(slug: string) {
  return slug
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

export function getModelPageContent(args: {
  slug: string
  brand?: string
  model?: string
}): ModelPageContent {
  const { slug, brand, model } = args
  const generated = generatedBySlug[slug]
  if (generated) return generated
  const existing = mockBySlug[slug]
  if (existing) return existing

  const fallbackBrand = brand || 'Model'
  const fallbackModel = model || titleCaseFromSlug(slug)

  return {
    slug,
    brand: fallbackBrand,
    model: fallbackModel,
    sections: {
      design: {
        intro:
          'Sekcja w przygotowaniu. Docelowo: opis designu, wnętrza i galerii — z danych per model.',
        bullets: ['Kluczowy detal #1', 'Kluczowy detal #2', 'Kluczowy detal #3'],
      },
      strengths: {
        intro: 'Sekcja w przygotowaniu — docelowo mocne strony per model.',
        items: [
          { title: 'Mocna strona #1', desc: 'Krótki opis korzyści.' },
          { title: 'Mocna strona #2', desc: 'Krótki opis korzyści.' },
          { title: 'Mocna strona #3', desc: 'Krótki opis korzyści.' },
        ],
      },
      versions: {
        intro: 'Dostępne wersje i ceny.',
      },
      specPdf: {
        intro: 'Specyfikacja PDF dla tego modelu.',
        href: '/spec/specyfikacja.pdf',
        label: 'Pobierz PDF',
      },
      discount: {
        headline: 'Rabat',
        body: 'Zapytaj o aktualny rabat i ofertę finansowania.',
      },
    },
  }
}
