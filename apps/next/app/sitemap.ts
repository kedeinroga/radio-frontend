import { MetadataRoute } from 'next'
import { SEOApiRepository, GetSitemapData } from '@radio-app/app'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://radioapp.com'

/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml from backend SEO data
 * Includes: home, search, countries, genres
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seoRepository = new SEOApiRepository()
  const getSitemapData = new GetSitemapData(seoRepository)
  
  try {
    const sitemapData = await getSitemapData.execute()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/favorites`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    ]

    // Country pages
    const countryPages: MetadataRoute.Sitemap = sitemapData.popularCountries.map(country => ({
      url: `${BASE_URL}/country/${country.urlSlug}`,
      lastModified: sitemapData.lastUpdatedDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

    // Genre/Tag pages
    const genrePages: MetadataRoute.Sitemap = sitemapData.popularTags.map(tag => ({
      url: `${BASE_URL}/genre/${tag.urlSlug}`,
      lastModified: sitemapData.lastUpdatedDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...countryPages, ...genrePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return minimal sitemap on error
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      }
    ]
  }
}
