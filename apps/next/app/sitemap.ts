import { MetadataRoute } from 'next'
import { BASE_URL, STATION_SITEMAP_PAGES } from '@/lib/sitemap/xml'

// Force dynamic generation
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

/**
 * Sitemap Index
 *
 * - sitemap.xml (this file) - Index pointing to all sitemaps
 * - sitemap-static.xml - Static pages (home, search, blog, etc)
 * - sitemap-countries.xml - Country pages
 * - sitemap-genres.xml - Genre pages
 * - sitemap-stations-0..N.xml - Stations ranked by votes (see STATION_SITEMAP_PAGES)
 *
 * No backend or API calls: the list of sub-sitemaps is fixed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE_URL}/sitemap-static.xml`, lastModified: now },
    { url: `${BASE_URL}/sitemap-countries.xml`, lastModified: now },
    { url: `${BASE_URL}/sitemap-genres.xml`, lastModified: now },
    ...Array.from({ length: STATION_SITEMAP_PAGES }, (_, i) => ({
      url: `${BASE_URL}/sitemap-stations-${i}.xml`,
      lastModified: now,
    })),
  ]
}
