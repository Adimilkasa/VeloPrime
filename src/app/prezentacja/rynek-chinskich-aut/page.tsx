import type { Metadata } from 'next'

import { ChinaAutoMarketPresentation } from '@/components/presentation/ChinaAutoMarketPresentation'

export const metadata: Metadata = {
  title: 'Prezentacja rynku chińskich aut',
  description: 'Robocza, ukryta podstrona prezentacyjna dotycząca rynku samochodowego chińskich marek.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function Page() {
  return <ChinaAutoMarketPresentation />
}