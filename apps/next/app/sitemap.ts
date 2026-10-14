import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/sitemap/xml'

// Force dynamic generation
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

/**
 * Sitemap Index
 *
 * Solo anuncia páginas indexables con contenido propio (sitemap-static.xml). Las fichas de
 * emisoras, géneros y países llevan noindex y no se listan.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${BASE_URL}/sitemap-static.xml`, lastModified: new Date() }]
}
