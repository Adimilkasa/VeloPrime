'use client'

import { usePathname } from 'next/navigation'

import { CookieConsentBanner } from '@/components/analytics/CookieConsentBanner'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { FloatingOfferWidget } from '@/components/sections/FloatingOfferWidget'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/wspolpraca' || pathname.startsWith('/prezentacja')

  if (isLandingPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      {children}
      <FloatingOfferWidget />
      <CookieConsentBanner />
      <Footer />
    </>
  )
}