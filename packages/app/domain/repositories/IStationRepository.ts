import { Station } from '../entities/Station'

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
}
