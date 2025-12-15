import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { IAnalyticsService } from '../ports/IAnalyticsService'
import { ILogger } from '../ports/ILogger'
import { Station } from '../../domain/entities/Station'
import { PremiumRequiredError, AlreadyExistsError } from '../../domain/errors/DomainErrors'

/**
 * Add Favorite Use Case
 * Handles adding a station to user favorites
 */
export class AddFavoriteUseCase {
  constructor(
    private userRepo: IUserRepository,
    private analytics: IAnalyticsService,
    private logger: ILogger
  ) { }

  async execute(stationId: string): Promise<void> {
    this.logger.info('Adding station to favorites', { stationId })

    try {
      await this.userRepo.addFavorite(stationId)

      await this.analytics.track('station_favorited', {
        stationId,
      })

      this.logger.info('Station added to favorites', { stationId })
    } catch (error) {
      this.logger.error('Failed to add favorite', { stationId, error })

      // Handle specific error types from backend
      if (error instanceof Error) {
        const message = error.message.toLowerCase()

        if (message.includes('premium') || message.includes('403')) {
          throw new PremiumRequiredError('This station requires a premium account')
        }

        if (message.includes('already') || message.includes('409')) {
          throw new AlreadyExistsError('Station is already in favorites')
        }
      }

      throw error
    }
  }
}
