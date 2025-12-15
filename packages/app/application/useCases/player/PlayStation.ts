import { IStationRepository } from '../../domain/repositories/IStationRepository'
import { IPlayerRepository } from '../../domain/repositories/IPlayerRepository'
import { IAnalyticsService } from '../ports/IAnalyticsService'
import { ILogger } from '../ports/ILogger'
import { StationNotFoundError, PlaybackError } from '../../domain/errors/DomainErrors'

/**
 * Play Station Use Case
 * Handles station playback with error handling and analytics
 */
export class PlayStationUseCase {
  constructor(
    private stationRepo: IStationRepository,
    private playerRepo: IPlayerRepository,
    private analytics: IAnalyticsService,
    private logger: ILogger
  ) { }

  async execute(stationId: string): Promise<void> {
    this.logger.info('Playing station', { stationId })

    try {
      // Get station details
      const station = await this.stationRepo.findById(stationId)

      if (!station) {
        throw new StationNotFoundError(stationId)
      }

      // Start playback
      await this.playerRepo.play(station.streamUrl)

      // Track analytics
      await this.analytics.track('playback_started', {
        stationId: station.id,
        stationName: station.name,
        genre: station.genre,
        country: station.country,
        isPremium: station.isPremium,
      })

      this.logger.info('Playback started successfully', {
        stationId: station.id,
        stationName: station.name,
      })
    } catch (error) {
      this.logger.error('Playback failed', { stationId, error })

      if (error instanceof StationNotFoundError) {
        throw error
      }

      throw new PlaybackError(error instanceof Error ? error.message : 'Unknown error')
    }
  }
}
