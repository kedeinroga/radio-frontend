import { MetadataRoute } from 'next'
import { SEOApiRepository } from '@radio-app/app'

// Force dynamic generation
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de'] as const

/**
 * Static Pages Sitemap
 * Includes: home, search, favorites for all locales
 */
export default async function sitemapStatic(): Promise<MetadataRoute.Sitemap> {
  // CRITICAL: Skip during build to prevent worker crash
  if (process.env.SKIP_BUILD_STATIC_GENERATION === '1') {
    return []
  }

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Helper function to generate alternates for a given path
  const generateAlternates = (path: string) => {
    const alternates: { languages: Record<string, string> } = {
      languages: {}
    }

    SUPPORTED_LOCALES.forEach(locale => {
      alternates.languages[locale] = `${BASE_URL}/${locale}${path}`
    })

    return alternates
  }

  // Static pages - generate for each locale
  const staticPaths = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/search', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/favorites', priority: 0.7, changeFrequency: 'weekly' as const }
  ]

  staticPaths.forEach(({ path, priority, changeFrequency }) => {
    SUPPORTED_LOCALES.forEach(locale => {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: generateAlternates(path)
      })
    })
  })

  return sitemapEntries
}
