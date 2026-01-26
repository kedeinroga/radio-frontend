import { MetadataRoute } from 'next'
import { SEOApiRepository } from '@radio-app/app'

// Force dynamic generation
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de'] as const
const STATIONS_PER_SITEMAP = 5000

interface PageProps {
  params: Promise<{ page: string }> | { page: string }
}

/**
 * Dynamic Stations Sitemap
 * Generates sitemap for a specific page of stations
 * 
 * URLs:
 * - /sitemap-stations-0.xml (stations 0-4999)
 * - /sitemap-stations-1.xml (stations 5000-9999)
 * - etc.
 */
export async function GET(
  request: Request,
  { params }: PageProps
): Promise<Response> {
  // CRITICAL: Skip during build to prevent worker crash
  if (process.env.SKIP_BUILD_STATIC_GENERATION === '1') {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    })
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    })
  }

  const resolvedParams = await Promise.resolve(params)
  const pageNum = parseInt(resolvedParams.page) || 0

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
    // Fetch stations for this page
    const stations = await seoRepository.getStationsForSitemap(pageNum, STATIONS_PER_SITEMAP)

    stations.forEach((station: any) => {
      const path = `/radio/${station.id}`
      const isPopular = (station.click_count || 0) > 1000

      SUPPORTED_LOCALES.forEach(locale => {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified: station.updated_at ? new Date(station.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: isPopular ? 0.9 : 0.7,
          alternates: generateAlternates(path)
        })
      })
    })
  } catch (error) {
    console.error(`[sitemap-stations-${pageNum}] Error:`, error)
  }

  // Generate XML manually for better control
  const xml = generateSitemapXML(sitemapEntries)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}

/**
 * Generate sitemap XML from entries
 */
function generateSitemapXML(entries: MetadataRoute.Sitemap): string {
  const urlEntries = entries.map(entry => {
    const alternates = entry.alternates?.languages
      ? Object.entries(entry.alternates.languages)
        .map(([lang, url]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`)
        .join('\n')
      : ''

    return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
${alternates}
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`
}
