import { ISEORepository } from '../../../domain/repositories/ISEORepository'
import { PopularTag } from '../../../domain/entities/PopularTag'

/**
 * Get Popular Tags Use Case
 * Fetches list of tags/genres with most active stations
 * Used for sitemap generation and genre navigation pages
 */
export class GetPopularTags {
  constructor(private seoRepository: ISEORepository) {}

  async execute(limit: number = 100): Promise<PopularTag[]> {
    return this.seoRepository.getPopularTags(limit)
  }
}
