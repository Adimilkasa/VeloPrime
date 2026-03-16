const DEFAULT_SITE_URL = 'https://veloprime.pl'

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
}