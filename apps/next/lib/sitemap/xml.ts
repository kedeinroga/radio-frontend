/**
 * Helpers compartidos para los sitemaps (urlset XML con hreflang).
 * Solo servidor.
 */

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
export const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de'] as const

/** Emisoras crudas por página de sitemap (antes de filtrar a https/no-HLS, ~1/3 sobrevive). */
export const RAW_STATIONS_PER_PAGE = 5000
/** Cuántas páginas de sitemap-stations-N.xml se anuncian en el índice (top ~20.000 por votos). */
export const STATION_SITEMAP_PAGES = 4

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export interface UrlEntry {
  /** Ruta sin locale ni dominio, ya codificada para URL (p.ej. "/genre/rock"). "" = home. */
  path: string
  priority: number
  changeFrequency: ChangeFreq
  lastModified?: Date
  /** Locales en los que existe la página (default: todos). */
  locales?: readonly string[]
}

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

const EMPTY_URLSET =
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'

/** Una entrada <url> por locale, cada una con los hreflang de todos los locales. */
function renderEntry(entry: UrlEntry): string {
  const locales = entry.locales ?? SUPPORTED_LOCALES
  const alternates = locales
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(`${BASE_URL}/${l}${entry.path}`)}"/>`)
    .join('\n')
  const lastmod = (entry.lastModified ?? new Date()).toISOString()

  return locales.map(
    (l) => `  <url>
    <loc>${escapeXml(`${BASE_URL}/${l}${entry.path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
${alternates}
  </url>`
  ).join('\n')
}

export function xmlResponse(entries: UrlEntry[]): Response {
  const body =
    entries.length === 0
      ? EMPTY_URLSET
      : `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(renderEntry).join('\n')}
</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

export const emptyUrlset = (): Response => xmlResponse([])
