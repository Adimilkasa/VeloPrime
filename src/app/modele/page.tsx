import type { Metadata } from 'next'
import { ModelsCatalogue } from '@/components/sections/ModelsCatalogue'

export const metadata: Metadata = {
  title: 'Modele',
  description: 'Dostępne modele i konfiguracje. Sprawdź estymowaną ratę, poznaj szczegóły modelu i umów konsultację.',
  openGraph: {
    title: 'Modele — Velo Prime',
    description: 'Dostępne modele i konfiguracje. Sprawdź estymowaną ratę i poznaj szczegóły modelu.',
    images: [{ url: '/assets/HERO.png' }],
  },
}

export default function Page() {
  return (
    <main>
      <ModelsCatalogue />
    </main>
  )
}
