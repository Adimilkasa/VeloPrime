'use client'

import * as React from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  readAnalyticsConsent,
} from '@/lib/analyticsConsent'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
  }
}

export function AnalyticsScripts() {
  const pathname = usePathname()
  const [consent, setConsent] = React.useState<string | null>(null)

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim()

  React.useEffect(() => {
    setConsent(readAnalyticsConsent())

    function handleStorage(event: StorageEvent) {
      if (event.key === ANALYTICS_CONSENT_STORAGE_KEY) {
        setConsent(readAnalyticsConsent())
      }
    }

    function handleConsentChange() {
      setConsent(readAnalyticsConsent())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsentChange)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsentChange)
    }
  }, [])

  React.useEffect(() => {
    if (consent !== 'accepted' || !gaId || typeof window.gtag !== 'function') {
      return
    }

    const query = window.location.search.replace(/^\?/, '')
    const pagePath = query ? `${pathname}?${query}` : pathname

    window.gtag('config', gaId, {
      page_path: pagePath,
      page_location: window.location.href,
    })
  }, [consent, gaId, pathname])

  if (consent !== 'accepted') {
    return null
  }

  return (
    <>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaId}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}

      {clarityId ? (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      ) : null}
    </>
  )
}