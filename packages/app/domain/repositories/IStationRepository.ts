import { Station } from '../entities/Station'
import { StationTrack } from '../entities/StationTrack'

/**
 * Station Repository Interface
 * Defines operations for station data access
 */
export interface IStationRepository {
  /**
   * Find a station by ID
   */
  findById(id: string): Promise<Station | null>

  /**
   * Search stations by query
   */
  search(query: string, limit?: number): Promise<Station[]>

  /**
   * Get popular stations
   */
  getPopular(limit?: number): Promise<Station[]>

  /**
   * Get stations by genre
   */
  getByGenre(genre: string, limit?: number): Promise<Station[]>

  /**
   * Get stations by country
   */
  getByCountry(country: string, limit?: number): Promise<Station[]>

  /**
   * Get the track currently playing on a station ("now playing").
   * Returns null when there is no data available.
   */
  getNowPlaying(stationId: string): Promise<StationTrack | null>

  /**
   * Get the recently played tracks of a station, newest first.
   */
  getRecentTracks(stationId: string, limit?: number): Promise<StationTrack[]>
}
