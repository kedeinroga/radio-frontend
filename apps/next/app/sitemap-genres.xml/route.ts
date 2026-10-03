import { getTopTags } from '@/lib/radioBrowser/client'
import { emptyUrlset, xmlResponse, type UrlEntry } from '@/lib/sitemap/xml'

export const dynamic = 'force-dynamic'

/**
 * GET /sitemap-genres.xml
 * Páginas de género (/genre/{tag}) para todos los locales, desde Radio Browser.
 */
export async function GET(): Promise<Response> {
  try {
    const tags = await getTopTags(200)
    const entries: UrlEntry[] = tags.map((t) => ({
      // La página de género revierte los guiones a espacios (decodeURIComponent + replace).
      path: `/genre/${encodeURIComponent(t.name.replace(/\s+/g, '-'))}`,
      priority: 0.8,
      changeFrequency: 'daily',
    }))
    return xmlResponse(entries)
  } catch (error) {
    console.error('[sitemap-genres] Error:', error)
    return emptyUrlset()
  }
}
