import { IStationRepository } from '../../domain/repositories/IStationRepository'
import { IAnalyticsService } from '../ports/IAnalyticsService'
import { ILogger } from '../ports/ILogger'
import { Station } from '../../domain/entities/Station'

/**
 * Search Stations Use Case
 * Handles station search with analytics tracking
 */
export class SearchStationsUseCase {
  constructor(
    private stationRepo: IStationRepository,
    private analytics: IAnalyticsService,
    private logger: ILogger
  ) { }

  async execute(query: string, limit: number = 20): Promise<Station[]> {
    this.logger.info('Searching stations', { query, limit })

    try {
      const stations = await this.stationRepo.search(query, limit)

      await this.analytics.track('station_searched', {
        query,
        resultsCount: stations.length,
        hasResults: stations.length > 0,
      })

      this.logger.info('Station search completed', {
        query,
        resultsCount: stations.length,
      })

      return stations
    } catch (error) {
      this.logger.error('Station search failed', { query, error })
      throw error
    }
  }
}
