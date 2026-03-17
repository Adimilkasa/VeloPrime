export const ANALYTICS_CONSENT_STORAGE_KEY = 'veloprime.analyticsConsent'
export const ANALYTICS_CONSENT_CHANGED_EVENT = 'analytics-consent-changed'
export const ANALYTICS_CONSENT_OPEN_EVENT = 'analytics-consent-open'

export type AnalyticsConsentValue = 'accepted' | 'rejected'

export function isAnalyticsConsentValue(value: string | null): value is AnalyticsConsentValue {
  return value === 'accepted' || value === 'rejected'
}

export function readAnalyticsConsent() {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)
  return isAnalyticsConsentValue(value) ? value : null
}

export function writeAnalyticsConsent(value: AnalyticsConsentValue) {
  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, value)
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGED_EVENT))
}