import type { MetadataRoute } from 'next'
import { generatedBySlug } from '@/generated/models'
import { getSiteUrl } from '@/lib/siteUrl'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl()
  const now = new Date()
  const staticPages = [
    { path: '/', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/modele', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/wspolpraca', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/partnerstwo', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/dla-partnerow', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/webinar', changeFrequency: 'monthly' as const, priority: 0.4 },
    { path: '/polityka-prywatnosci', changeFrequency: 'yearly' as const, priority: 0.2 },
    { path: '/regulamin-partnerstwa', changeFrequency: 'yearly' as const, priority: 0.2 },
  ]

  const modelPages = Object.keys(generatedBySlug).map((slug) => ({
    url: `${baseUrl}/modele/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticPages.map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...modelPages,
  ]
}
