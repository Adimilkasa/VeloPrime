import type { Metadata } from 'next'
import './globals.css'
import { AnalyticsScripts } from '@/components/analytics/AnalyticsScripts'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { PricingModeProvider } from '@/components/providers/PricingModeProvider'
import { getSiteUrl } from '@/lib/siteUrl'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Velo Prime',
    template: '%s — Velo Prime',
  },
  description: 'Nowe auta dostępne od ręki. Transparentne ceny i finansowanie dopasowane do Ciebie.',
  openGraph: {
    title: 'Velo Prime',
    description: 'Nowe auta dostępne od ręki. Transparentne ceny i finansowanie dopasowane do Ciebie.',
    type: 'website',
    images: [{ url: '/assets/HERO.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velo Prime',
    description: 'Nowe auta dostępne od ręki. Transparentne ceny i finansowanie dopasowane do Ciebie.',
    images: ['/assets/HERO.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body className="noise-overlay">
        <AnalyticsScripts />
        <PricingModeProvider>
          {children}
          <SiteChrome />
        </PricingModeProvider>
      </body>
    </html>
  )
}
