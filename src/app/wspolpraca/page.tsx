import type { Metadata } from 'next'

import { CooperationLanding } from '@/components/partners/CooperationLanding'

export const metadata: Metadata = {
  title: 'Współpraca',
  description:
    'Landing page współpracy Velo Prime dla osób z doświadczeniem sprzedażowym, które chcą porozmawiać o modelu działania bez etapu płatności i webinaru.',
}

export default function Page() {
  return (
    <main>
      <CooperationLanding />
    </main>
  )
}