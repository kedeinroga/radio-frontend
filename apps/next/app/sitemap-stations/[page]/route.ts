import { getStationsForSitemap } from '@/lib/radioBrowser/client'
import { emptyUrlset, xmlResponse, RAW_STATIONS_PER_PAGE, type UrlEntry } from '@/lib/sitemap/xml'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ page: string }> | { page: string }
}

/**
 * GET /sitemap-stations-{page}.xml
 *
 * Emisoras ordenadas por votos; cada página toma RAW_STATIONS_PER_PAGE de Radio Browser y
 * conserva solo las reproducibles. Con 4 locales cada página queda muy por debajo del
 * límite de 50.000 URLs de Google.
 */
export async function GET(_request: Request, { params }: PageProps): Promise<Response> {
  // CRITICAL: Skip during build to prevent worker crash
  if (process.env.SKIP_BUILD_STATIC_GENERATION === '1') return emptyUrlset()

  const { page } = await Promise.resolve(params)
  const pageNum = Math.max(0, parseInt(page, 10) || 0)

  try {
    const stations = await getStationsForSitemap(pageNum, RAW_STATIONS_PER_PAGE)
    const entries: UrlEntry[] = stations.map((s) => ({
      path: `/radio/${s.id}`,
      priority: s.votes > 1000 ? 0.9 : 0.7,
      changeFrequency: 'weekly',
    }))
    return xmlResponse(entries)
  } catch (error) {
    console.error(`[sitemap-stations-${pageNum}] Error:`, error)
    return emptyUrlset()
  }
}
