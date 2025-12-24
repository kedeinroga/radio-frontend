import { ISEORepository } from '../../../domain/repositories/ISEORepository'
import { PopularCountry } from '../../../domain/entities/PopularCountry'

/**
 * Get Popular Countries Use Case
 * Fetches list of countries with most active stations
 * Used for sitemap generation and country navigation pages
 */
export class GetPopularCountries {
  constructor(private seoRepository: ISEORepository) {}

  async execute(limit: number = 50): Promise<PopularCountry[]> {
    return this.seoRepository.getPopularCountries(limit)
  }
}
