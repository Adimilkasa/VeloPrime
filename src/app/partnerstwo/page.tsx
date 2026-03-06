import type { Metadata } from 'next'

import { PartnerProgramLanding } from '@/components/partners/PartnerProgramLanding'

export const metadata: Metadata = {
  title: 'Partnerstwo',
  description:
    'Program partnerski Velo Prime dla profesjonalistów sprzedaży bezpośredniej po webinarze: warianty współpracy, proces i FAQ.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function Page() {
  return (
    <main>
      <PartnerProgramLanding />
    </main>
  )
}
