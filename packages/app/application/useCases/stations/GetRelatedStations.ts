import { IStationRepository } from '../../../domain/repositories/IStationRepository'
import { Station } from '../../../domain/entities/Station'

/**
 * Get Related Stations Use Case
 * Finds stations with similar tags for "Related Stations" section
 * Implements internal linking strategy for SEO
 */
export class GetRelatedStations {
  constructor(private stationRepository: IStationRepository) {}

  async execute(station: Station, limit: number = 6): Promise<Station[]> {
    // Get related tags from the station
    const relatedTags = station.getRelatedTags()
    
    if (relatedTags.length === 0) {
      // Fallback to country-based stations if no tags
      if (station.country) {
        const countryStations = await this.stationRepository.getByCountry(station.country, limit + 1)
        return countryStations.filter(s => s.id !== station.id).slice(0, limit)
      }
      return []
    }

    // Search for stations with similar tags
    const searchPromises = relatedTags.map(tag => 
      this.stationRepository.search(tag, 10)
    )

    try {
      const results = await Promise.all(searchPromises)
      
      // Flatten and deduplicate
      const allStations = results.flat()
      const uniqueStations = new Map<string, Station>()
      
      for (const s of allStations) {
        if (s.id !== station.id && !uniqueStations.has(s.id)) {
          uniqueStations.set(s.id, s)
        }
      }

      // Return up to limit stations
      return Array.from(uniqueStations.values()).slice(0, limit)
    } catch (error) {
      console.error('Error fetching related stations:', error)
      return []
    }
  }
}
