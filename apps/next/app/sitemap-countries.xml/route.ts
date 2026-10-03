import { getTopCountries } from '@/lib/radioBrowser/client'
import { emptyUrlset, xmlResponse, type UrlEntry } from '@/lib/sitemap/xml'

export const dynamic = 'force-dynamic'

/**
 * GET /sitemap-countries.xml
 * Páginas de país (/country/{iso}) para todos los locales, desde Radio Browser.
 */
export async function GET(): Promise<Response> {
  try {
    const countries = await getTopCountries(100)
    const entries: UrlEntry[] = countries.map((c) => ({
      path: `/country/${c.code.toLowerCase()}`,
      priority: 0.9,
      changeFrequency: 'daily',
    }))
    return xmlResponse(entries)
  } catch (error) {
    console.error('[sitemap-countries] Error:', error)
    return emptyUrlset()
  }
}
