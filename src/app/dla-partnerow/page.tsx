import type { Metadata } from 'next'

import { PartnerLanding } from '@/components/partners/PartnerLanding'

export const metadata: Metadata = {
  title: 'Dla partnerów',
  description:
    'Landing partnerski dla przedstawicieli handlowych sprzedaży bezpośredniej. Warunki współpracy, proces i dołączenie do partnerstwa.',
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
  const paymentUrl = process.env.NEXT_PUBLIC_PARTNER_JOIN_PAYMENT_URL || ''

  return (
    <main>
      <PartnerLanding paymentUrl={paymentUrl} />
    </main>
  )
}
