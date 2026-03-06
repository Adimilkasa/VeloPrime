import type { Metadata } from 'next'

import { PartnerWebinarLanding } from '@/components/partners/PartnerWebinarLanding'

export const metadata: Metadata = {
  title: 'Webinar — program partnerski Velo Prime',
  description:
    'Bezpłatny webinar o programie partnerskim Velo Prime: sprzedaż samochodów premium w modelu partnerskim, proces, start i finansowanie klientów.',
}

export default function Page() {
  return (
    <main>
      <PartnerWebinarLanding />
    </main>
  )
}
