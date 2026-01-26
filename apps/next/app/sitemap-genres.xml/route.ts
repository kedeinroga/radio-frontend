import { MetadataRoute } from 'next'
import { SEOApiRepository } from '@radio-app/app'

// Force dynamic generation
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de'] as const

/**
 * Genres Sitemap
 * Includes all genre/tag pages for all locales
 */
export default async function sitemapGenres(): Promise<MetadataRoute.Sitemap> {
  // CRITICAL: Skip during build to prevent worker crash
  if (process.env.SKIP_BUILD_STATIC_GENERATION === '1') {
    return []
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return []
  }

  const seoRepository = new SEOApiRepository()
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Helper function to generate alternates
  const generateAlternates = (path: string) => {
    const alternates: { languages: Record<string, string> } = {
      languages: {}
    }

    SUPPORTED_LOCALES.forEach(locale => {
      alternates.languages[locale] = `${BASE_URL}/${locale}${path}`
    })

    return alternates
  }

  try {
    const tags = await seoRepository.getPopularTags(200)

    tags.forEach(tag => {
      const path = `/genre/${tag.urlSlug}`

      SUPPORTED_LOCALES.forEach(locale => {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
          alternates: generateAlternates(path)
        })
      })
    })
  } catch (error) {
    console.error('[sitemap-genres] Error:', error)
  }

  return sitemapEntries
}
