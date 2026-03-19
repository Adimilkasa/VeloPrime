'use client'

import { usePathname } from 'next/navigation'

import { CookieConsentBanner } from '@/components/analytics/CookieConsentBanner'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { FloatingOfferWidget } from '@/components/sections/FloatingOfferWidget'

export function SiteChrome() {
  const pathname = usePathname()
  const isLandingPage = pathname === '/wspolpraca'

  if (isLandingPage) {
    return null
  }

  return (
    <>
      <Header />
      <FloatingOfferWidget />
      <CookieConsentBanner />
      <Footer />
    </>
  )
}