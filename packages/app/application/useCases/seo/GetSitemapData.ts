import { ISEORepository } from '../../../domain/repositories/ISEORepository'
import { SitemapData } from '../../../domain/entities/SitemapData'

/**
 * Get Sitemap Data Use Case
 * Fetches aggregated data for sitemap.xml generation
 * Includes popular countries, tags, and metadata
 * Backend caches this for 6 hours
 */
export class GetSitemapData {
  constructor(private seoRepository: ISEORepository) {}

  async execute(): Promise<SitemapData> {
    return this.seoRepository.getSitemapData()
  }
}
