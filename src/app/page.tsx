import type { Metadata } from 'next'

import { HeroFullBleed } from '@/components/sections/HeroFullBleed'
import { ModelsTeaser } from '@/components/sections/ModelsTeaser'
import { FinancingSection } from '@/components/sections/FinancingSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Nowe auta dostępne od ręki. Sprawdź dostępność, porównaj finansowanie i umów konsultację.',
  openGraph: {
    title: 'Velo Prime',
    description: 'Nowe auta dostępne od ręki. Sprawdź dostępność, porównaj finansowanie i umów konsultację.',
    images: [{ url: '/assets/HERO.png' }],
  },
}

export default function Page() {
  return (
    <main>
      <HeroFullBleed />

      <ModelsTeaser />

      <FinancingSection />

      <AboutSection />

      <ContactSection />
    </main>
  )
}
