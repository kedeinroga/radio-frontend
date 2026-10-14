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
  /**
   * Código ISO 3166-1 alpha-2 cuando Radio Browser lo trae (la UI lo traduce con
   * formatCountry); si no, el nombre crudo del país.
   */
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
    country: /^[A-Z]{2}$/i.test(s.countrycode) ? s.countrycode.toUpperCase() : s.country,
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

/** Sufijos técnicos al final del nombre: "WALM 2 HD Opus", "SomaFM Lush (128k AAC)", "SWR3 | 48k aac". */
const TECH_SUFFIX = /[\s\-_|/([]+(hd|opus|mp3|aac\+?|he-?aac|ogg|flac|hq|lq|hi-?fi|\d{2,3}\s?k(bps)?|low|high|mobile|stream)[)\]]?$/i

/**
 * Clave para detectar la misma emisora publicada varias veces (por códec/bitrate o entradas
 * repetidas): nombre sin sufijos técnicos ni puntuación + país. Con el país en la clave no se
 * fusionan emisoras homónimas de países distintos.
 */
function dedupeKey(s: RadioBrowserStation): string {
  let name = s.name.trim().toLowerCase()
  let previous
  do {
    previous = name
    name = name.replace(TECH_SUFFIX, '').trim()
  } while (name !== previous)
  name = name.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  return `${name || s.name.trim().toLowerCase()}|${s.countrycode}`
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

  // raw viene ordenado por votos: de cada grupo de duplicados queda la variante más votada.
  const stations: StationDTO[] = []
  const seen = new Set<string>()
  for (const s of raw) {
    if (stations.length >= limit) break
    const dto = toDTO(s)
    if (!dto) continue
    const key = dedupeKey(s)
    if (seen.has(key)) continue
    seen.add(key)
    stations.push(dto)
  }
  return stations
}

const SEASONAL_CHRISTMAS = /christmas|xmas|navidad|navide|weihnacht|no[eë]l/i

/** Del 15 de noviembre al 6 de enero. */
function isChristmasSeason(date = new Date()): boolean {
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  return (month === 10 && day >= 15) || month === 11 || (month === 0 && day <= 6)
}

/** En los rankings no tiene sentido mostrar emisoras navideñas en octubre. */
function isOutOfSeason(station: StationDTO): boolean {
  if (isChristmasSeason()) return false
  return SEASONAL_CHRISTMAS.test(station.name) || station.tags.some((t) => SEASONAL_CHRISTMAS.test(t))
}

export async function getPopularStations(limit: number, country?: string): Promise<StationDTO[]> {
  // 2 letras => código ISO (filtro exacto); si no, nombre de país.
  const isCode = !!country && /^[a-z]{2}$/i.test(country)
  // Margen para lo que descarta el filtro de temporada.
  const stations = await searchStations({
    limit: limit + 10,
    ...(country ? (isCode ? { countrycode: country.toUpperCase() } : { country }) : {}),
  })
  return stations.filter((s) => !isOutOfSeason(s)).slice(0, limit)
}

export function searchStationsByName(name: string, limit: number): Promise<StationDTO[]> {
  return searchStations({ name, limit })
}

/** Emisoras cuyo tag contiene `tag` (p.ej. "rock" incluye "classic rock"). */
export function searchStationsByTag(tag: string, limit: number): Promise<StationDTO[]> {
  return searchStations({ tag, limit })
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
