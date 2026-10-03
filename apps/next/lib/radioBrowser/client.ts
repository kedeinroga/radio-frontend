/**
 * Radio Browser client (server-side)
 *
 * Consume directamente la API pública de Radio Browser (https://api.radio-browser.info),
 * la misma fuente que usaba el backend Go. Reemplaza al backend para el catálogo.
 *
 * ✅ Sin API key, sin costo
 * ✅ Fallback entre mirrors (la red es de voluntarios y a veces se cae un nodo)
 * ✅ Solo devuelve emisoras con stream https (el sitio es https: un stream http:// lo bloquea
 *    el navegador por contenido mixto, y ya no hay proxy de audio) y no-HLS (Howler/HTML5 audio
 *    no reproduce .m3u8 fuera de Safari)
 * ✅ Devuelve la misma forma (snake_case) que devolvía el backend, para no tocar los mappers
 * ❌ NUNCA importar en componentes del cliente
 */

const DEFAULT_SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://all.api.radio-browser.info',
]

const SERVERS = (process.env.RADIO_BROWSER_API_URL
  ? [process.env.RADIO_BROWSER_API_URL, ...DEFAULT_SERVERS]
  : DEFAULT_SERVERS
).map((s) => s.replace(/\/+$/, ''))

const USER_AGENT = 'rradio.online/1.0'
const REQUEST_TIMEOUT_MS = 8000
const REVALIDATE_SECONDS = 60 * 60 // el catálogo cambia lento: 1h de caché en el data cache de Next

/** Solo ~1/3 de las emisoras globales sirven por https; se sobre-pide y se filtra. */
const OVERFETCH_FACTOR = 4
const MAX_FETCH = 1000

interface RadioBrowserStation {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  favicon: string
  tags: string
  country: string
  countrycode: string
  votes: number
  bitrate: number
  codec: string
  hls: number
  lastcheckok: number
}

/** Forma que consumen los mappers del front (equivale al JSON del backend Go). */
export interface StationDTO {
  id: string
  name: string
  stream_url: string
  image_url?: string
  tags: string[]
  country: string
  votes: number
  bitrate?: number
  slug: string
  is_premium_only: false
}

export class RadioBrowserError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RadioBrowserError'
  }
}

export interface StationQuery {
  name?: string
  country?: string
  countrycode?: string
  tag?: string
  limit: number
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100)
    .replace(/-$/, '')
  return slug || 'station'
}

function isHttps(url: string): boolean {
  return url.startsWith('https://')
}

function toDTO(s: RadioBrowserStation): StationDTO | null {
  const streamUrl = s.url_resolved || s.url
  if (!s.stationuuid || !s.name?.trim() || !streamUrl || !isHttps(streamUrl)) return null
  if (s.hls === 1 || /\.m3u8(\?|$)/i.test(streamUrl)) return null

  return {
    id: s.stationuuid,
    name: s.name.trim(),
    stream_url: streamUrl,
    image_url: s.favicon && isHttps(s.favicon) ? s.favicon : undefined,
    tags: s.tags ? s.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    country: s.country,
    votes: s.votes,
    bitrate: s.bitrate > 0 ? s.bitrate : undefined,
    slug: slugify(s.name),
    is_premium_only: false,
  }
}

/** GET con fallback entre mirrors. Lanza RadioBrowserError si todos fallan. */
async function rbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
  /** false para respuestas > 2MB, que el data cache de Next no admite. */
  useDataCache = true
): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()

  let lastError: unknown
  for (const server of SERVERS) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(`${server}${path}${qs ? `?${qs}` : ''}`, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
        ...(useDataCache ? { next: { revalidate: REVALIDATE_SECONDS } } : { cache: 'no-store' as const }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as T
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const reason = lastError instanceof Error ? lastError.message : 'unknown error'
  throw new RadioBrowserError(`Radio Browser unavailable: ${reason}`)
}

async function searchStations(query: StationQuery): Promise<StationDTO[]> {
  const { limit, ...filters } = query
  const raw = await rbFetch<RadioBrowserStation[]>('/json/stations/search', {
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    limit: Math.min(limit * OVERFETCH_FACTOR, MAX_FETCH),
    hidebroken: true,
    order: 'votes',
    reverse: true,
  })

  const stations: StationDTO[] = []
  const seen = new Set<string>()
  for (const s of raw) {
    if (stations.length >= limit) break
    const dto = toDTO(s)
    if (!dto || seen.has(dto.id)) continue
    seen.add(dto.id)
    stations.push(dto)
  }
  return stations
}

export function getPopularStations(limit: number, country?: string): Promise<StationDTO[]> {
  // 2 letras => código ISO (filtro exacto); si no, nombre de país.
  const isCode = !!country && /^[a-z]{2}$/i.test(country)
  return searchStations({
    limit,
    ...(country ? (isCode ? { countrycode: country.toUpperCase() } : { country }) : {}),
  })
}

export function searchStationsByName(name: string, limit: number): Promise<StationDTO[]> {
  return searchStations({ name, limit })
}

export async function getStationById(id: string): Promise<StationDTO | null> {
  const raw = await rbFetch<RadioBrowserStation[]>('/json/stations/byuuid', { uuids: id })
  return raw.length > 0 ? toDTO(raw[0]) : null
}

/**
 * Cuenta un "click" de reproducción en Radio Browser (alimenta su ranking).
 * Best-effort: nunca lanza.
 */
export async function registerStationClick(id: string): Promise<void> {
  try {
    await fetch(`${SERVERS[0]}/json/url/${encodeURIComponent(id)}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(3000), // no debe retrasar la reproducción
      cache: 'no-store',
    })
  } catch {
    // ignorado a propósito
  }
}

// ─── Sitemaps ────────────────────────────────────────────────────────────────

export interface SitemapStation {
  id: string
  votes: number
}

/**
 * Una "página" de emisoras para sitemap, ordenadas por votos. La paginación es sobre el
 * resultado crudo de Radio Browser (offset = page * rawPageSize) y luego se filtra a las
 * reproducibles, así que cada página devuelve menos de rawPageSize.
 */
export async function getStationsForSitemap(page: number, rawPageSize: number): Promise<SitemapStation[]> {
  const raw = await rbFetch<RadioBrowserStation[]>('/json/stations/search', {
    limit: rawPageSize,
    offset: page * rawPageSize,
    hidebroken: true,
    order: 'votes',
    reverse: true,
  }, false) // ~7MB por página: no cabe en el data cache; el sitemap se cachea por Cache-Control
  return raw.flatMap((s) => {
    const dto = toDTO(s)
    return dto ? [{ id: dto.id, votes: dto.votes }] : []
  })
}

export interface CountrySummary {
  code: string
  name: string
  stationCount: number
}

export async function getTopCountries(limit: number): Promise<CountrySummary[]> {
  const raw = await rbFetch<{ name: string; iso_3166_1: string; stationcount: number }[]>(
    '/json/countries',
    { order: 'stationcount', reverse: true, hidebroken: true }
  )
  return raw
    .filter((c) => /^[A-Z]{2}$/.test(c.iso_3166_1))
    .slice(0, limit)
    .map((c) => ({ code: c.iso_3166_1, name: c.name, stationCount: c.stationcount }))
}

export interface TagSummary {
  name: string
  stationCount: number
}

export async function getTopTags(limit: number): Promise<TagSummary[]> {
  const raw = await rbFetch<{ name: string; stationcount: number }[]>('/json/tags', {
    order: 'stationcount',
    reverse: true,
    hidebroken: true,
    limit: limit * 2, // margen para descartar tags vacíos o no-url-safe
  })
  return raw
    .filter((t) => t.name && t.name.trim() && /^[\p{L}\p{N} \-]+$/u.test(t.name.trim()))
    .slice(0, limit)
    .map((t) => ({ name: t.name.trim(), stationCount: t.stationcount }))
}
