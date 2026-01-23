import { MetadataRoute } from 'next'
import { SEOApiRepository, GetSitemapData } from '@radio-app/app'

// Force dynamic generation - don't generate during build
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de'] as const

/**
 * Generate minimal sitemap when API is unavailable
 */
function generateMinimalSitemap(): MetadataRoute.Sitemap {
  const minimalSitemap: MetadataRoute.Sitemap = []
  
  SUPPORTED_LOCALES.forEach(locale => {
    minimalSitemap.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    })
  })
  
  return minimalSitemap
}

/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml from backend SEO data
 * Includes: home, search, countries, genres
 * Generates URLs for all supported locales with alternates
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // During build time, skip API calls if no API URL is configured
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.log('[Build] Skipping sitemap generation - no API URL configured')
    return generateMinimalSitemap()
  }

  const seoRepository = new SEOApiRepository()
  const getSitemapData = new GetSitemapData(seoRepository)
  
  try {
    const sitemapData = await getSitemapData.execute()

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

    // Country pages - generate for each locale
    sitemapData.popularCountries.forEach(country => {
      const path = `/country/${country.urlSlug}`
      
      SUPPORTED_LOCALES.forEach(locale => {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified: sitemapData.lastUpdatedDate,
          changeFrequency: 'daily' as const,
          priority: 0.9,
          alternates: generateAlternates(path)
        })
      })
    })

    // Genre/Tag pages - generate for each locale
    sitemapData.popularTags.forEach(tag => {
      const path = `/genre/${tag.urlSlug}`
      
      SUPPORTED_LOCALES.forEach(locale => {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified: sitemapData.lastUpdatedDate,
          changeFrequency: 'daily' as const,
          priority: 0.8,
          alternates: generateAlternates(path)
        })
      })
    })

    return sitemapEntries
  } catch (error) {
    console.error('[Build] Error generating sitemap:', error)
    // Return minimal sitemap on error - with all locales
    return generateMinimalSitemap()
  }
}
