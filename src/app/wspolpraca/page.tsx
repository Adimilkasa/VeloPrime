import type { Metadata } from 'next'

import { CooperationLanding } from '@/components/partners/CooperationLanding'

export const metadata: Metadata = {
  title: 'Współpraca',
  description:
    'Współpraca Velo Prime dla partnerów, liderów sprzedaży i managerów, którzy chcą rozwijać własny region oraz strukturę sprzedażową.',
}

export default function Page() {
  return (
    <main>
      <CooperationLanding />
    </main>
  )
}