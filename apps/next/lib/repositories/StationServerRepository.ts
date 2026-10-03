import type { IStationRepository } from '@radio-app/app'
import { Station } from '@radio-app/app'
import type { SEOMetadata, StationTrack } from '@radio-app/app'
import {
  getPopularStations,
  searchStationsByName,
  getStationById,
} from '@/lib/radioBrowser/client'

const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'


/**
 * Station Server Repository
 *
 * Implementación de IStationRepository para uso EXCLUSIVO en SSR (apps/next).
 *
 * ✅ Consume Radio Browser directamente (lib/radioBrowser/client) — ya no depende del backend
 * ✅ Implementa la misma interfaz que StationApiRepository (intercambiable)
 * ❌ NUNCA importar en componentes del cliente
 */
export class StationServerRepository implements IStationRepository {
  // In-memory cache for slug -> ID mapping (per request, no cross-request state)
  private slugToIdCache = new Map<string, string>()

  async findById(id: string): Promise<Station | null> {
    try {
      const data = await getStationById(id)
      return data ? this.mapToStation(data) : null
    } catch {
      throw new Error('Failed to fetch station. Please try again.')
    }
  }

  async search(query: string, limit: number = 20): Promise<Station[]> {
    try {
      const data = await searchStationsByName(query, limit)
      return data.map((item) => this.mapToStation(item))
    } catch {
      throw new Error('The search service is temporarily unavailable. Please try again later.')
    }
  }

  async getPopular(limit: number = 20, country?: string): Promise<Station[]> {
    try {
      const data = await getPopularStations(limit, country)
      return data.map((item) => this.mapToStation(item))
    } catch {
      throw new Error('The stations service is temporarily unavailable. Please try again later.')
    }
  }

  async getByGenre(genre: string, limit: number = 20): Promise<Station[]> {
    return this.search(genre, limit)
  }

  async getByCountry(country: string, limit: number = 20): Promise<Station[]> {
    // Los códigos ISO de 2 letras se filtran por countrycode; el resto cae a nombre de país.
    return this.getPopular(limit, country)
  }

  async findBySlug(slug: string): Promise<Station | null> {
    if (this.isUUID(slug)) return this.findById(slug)

    const cachedId = this.slugToIdCache.get(slug)
    if (cachedId) return this.findById(cachedId)

    try {
      const popularStations = await this.getPopular(100)
      const station = popularStations.find((s) => s.slug === slug)
      if (station) {
        this.slugToIdCache.set(slug, station.id)
        return station
      }

      const searchResults = await this.search(slug.replace(/-/g, ' '), 50)
      const searchStation = searchResults.find((s) => s.slug === slug)
      if (searchStation) {
        this.slugToIdCache.set(slug, searchStation.id)
        return searchStation
      }

      return null
    } catch {
      return null
    }
  }

  async findBySlugOrId(slugOrId: string): Promise<Station | null> {
    if (this.isUUID(slugOrId)) return this.findById(slugOrId)
    return this.findBySlug(slugOrId)
  }

  // Sin backend no hay metadata ICY: "sonando ahora" y su historial quedan vacíos.
  async getNowPlaying(_stationId: string): Promise<StationTrack | null> {
    return null
  }

  async getRecentTracks(_stationId: string, _limit: number = 10): Promise<StationTrack[]> {
    return []
  }

  private isUUID(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
  }

  private mapToStation(data: any): Station {
    const seoMetadata: SEOMetadata | undefined = data.seo_metadata
      ? {
        title: data.seo_metadata.title || '',
        description: data.seo_metadata.description || '',
        keywords: data.seo_metadata.keywords || [],
        // Ignore the backend's canonical_url (it can carry the backend's own host,
        // e.g. localhost in misconfigured envs). The public canonical is always
        // derived from the frontend's base URL.
        canonicalUrl: `${PUBLIC_BASE_URL}/radio/${data.id}`,
        imageUrl: data.seo_metadata.image_url || '',
        alternateNames: data.seo_metadata.alternate_names || [],
        lastModified: data.seo_metadata.last_modified || new Date().toISOString(),
      }
      : undefined

    return new Station(
      data.id,
      data.name,
      data.stream_url,
      data.slug || this.generateSlug(data.name),
      data.tags || [],
      seoMetadata,
      data.image_url,
      data.country,
      data.genre,
      data.is_premium_only || false,
      data.description,
      data.bitrate,
      data.votes
    )
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}
