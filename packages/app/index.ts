// Domain Entities
export { Station } from './domain/entities/Station'
export { User } from './domain/entities/User'

// Domain Errors
export * from './domain/errors/DomainErrors'

// Domain Repositories (interfaces only)
export type { IStationRepository } from './domain/repositories/IStationRepository'
export type { IUserRepository } from './domain/repositories/IUserRepository'
export type { IPlayerRepository, PlayerState } from './domain/repositories/IPlayerRepository'

// Infrastructure - Only working adapters
export { StationApiRepository } from './infrastructure/api/StationApiRepository'
export { ConsoleLogger } from './infrastructure/logging/ConsoleLogger'
export { MockAnalyticsService } from './infrastructure/analytics/MockAnalyticsService'
export { WebSecureStorage } from './infrastructure/storage/WebSecureStorage'
export type { ISecureStorage } from './infrastructure/storage/ISecureStorage'
export { default as apiClient } from './infrastructure/api/apiClient'
export { HowlerPlayerAdapter } from './infrastructure/audio/HowlerPlayerAdapter'

// Stores
export { usePlayerStore } from './stores/playerStore'

// Note: Components are platform-specific and should be imported from apps/next or apps/expo
// Note: Use cases are not exported due to module resolution issues in Next.js
// They can be imported directly when needed:
// import { SearchStationsUseCase } from '@radio-app/app/application/useCases/stations/SearchStations'
