import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { PricingModeProvider } from '@/components/providers/PricingModeProvider'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
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
        <PricingModeProvider>
          <Header />
          {children}
        </PricingModeProvider>
      </body>
    </html>
  )
}
