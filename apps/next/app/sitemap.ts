import { MetadataRoute } from 'next'
import { SEOApiRepository } from '@radio-app/app'

// Force dynamic generation
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
const STATIONS_PER_SITEMAP = 5000 // Google recommends max 50,000 URLs per sitemap

/**
 * Sitemap Index
 * 
 * With 30,000+ stations, we need multiple sitemaps:
 * - sitemap.xml (this file) - Index pointing to all sitemaps
 * - sitemap-static.xml - Static pages (home, search, etc)
 * - sitemap-countries.xml - Country pages
 * - sitemap-genres.xml - Genre pages
 * - sitemap-stations-0.xml - Stations 0-4999
 * - sitemap-stations-1.xml - Stations 5000-9999
 * - sitemap-stations-2.xml - Stations 10000-14999
 * - ... etc
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // CRITICAL: Skip during build to prevent worker crash
  if (process.env.SKIP_BUILD_STATIC_GENERATION === '1') {
    return []
  }

  // During build time, skip API calls if no API URL is configured
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return []
  }

  try {
    // Get actual station count from API
    const seoRepository = new SEOApiRepository()
    let totalStations = 30000 // Default fallback

    try {
      totalStations = await seoRepository.getTotalStationCount()
    } catch (error) {
      console.error('[sitemap] Error getting station count, using default:', error)
    }

    const numStationSitemaps = Math.ceil(totalStations / STATIONS_PER_SITEMAP)

    const sitemapIndex: MetadataRoute.Sitemap = [
      // Static pages sitemap
      {
        url: `${BASE_URL}/sitemap-static.xml`,
        lastModified: new Date(),
      },
      // Countries sitemap
      {
        url: `${BASE_URL}/sitemap-countries.xml`,
        lastModified: new Date(),
      },
      // Genres sitemap
      {
        url: `${BASE_URL}/sitemap-genres.xml`,
        lastModified: new Date(),
      },
    ]

    // Add station sitemaps dynamically based on actual count
    for (let i = 0; i < numStationSitemaps; i++) {
      sitemapIndex.push({
        url: `${BASE_URL}/sitemap-stations-${i}.xml`,
        lastModified: new Date(),
      })
    }

    return sitemapIndex
  } catch (error) {
    console.error('[sitemap] Error generating sitemap index:', error)
    return []
  }
}
