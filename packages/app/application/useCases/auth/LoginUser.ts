import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { IAnalyticsService } from '../ports/IAnalyticsService'
import { ILogger } from '../ports/ILogger'
import { User } from '../../domain/entities/User'
import { AuthenticationError } from '../../domain/errors/DomainErrors'

/**
 * Login User Use Case
 * Handles user authentication with analytics tracking
 */
export class LoginUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private analytics: IAnalyticsService,
    private logger: ILogger
  ) { }

  async execute(email: string, password: string): Promise<User> {
    this.logger.info('User login attempt', { email })

    try {
      // Validate inputs
      if (!email || !password) {
        throw new AuthenticationError('Email and password are required')
      }

      // Attempt login
      const user = await this.userRepo.login(email, password)

      // Identify user in analytics
      await this.analytics.identify(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
      })

      // Track login event
      await this.analytics.track('user_logged_in', {
        userId: user.id,
        method: 'email',
        role: user.role,
      })

      this.logger.info('User logged in successfully', {
        userId: user.id,
        role: user.role,
      })

      return user
    } catch (error) {
      this.logger.error('Login failed', { email, error })

      if (error instanceof AuthenticationError) {
        throw error
      }

      throw new AuthenticationError('Invalid credentials')
    }
  }
}
