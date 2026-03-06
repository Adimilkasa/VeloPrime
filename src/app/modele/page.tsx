import type { Metadata } from 'next'
import { ModelsCatalogue } from '@/components/sections/ModelsCatalogue'

export const metadata: Metadata = {
  title: 'Modele',
  description: 'Dostępne modele i konfiguracje. Sprawdź cenę, rabat i estymowaną ratę, a potem umów konsultację.',
  openGraph: {
    title: 'Modele — Velo Prime',
    description: 'Dostępne modele i konfiguracje. Sprawdź cenę, rabat i estymowaną ratę.',
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
