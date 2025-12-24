// Domain Entities
export { Station } from './domain/entities/Station'
export { User } from './domain/entities/User'
export { PopularCountry } from './domain/entities/PopularCountry'
export { PopularTag } from './domain/entities/PopularTag'
export { SitemapData } from './domain/entities/SitemapData'
export type { SEOMetadata } from './domain/entities/Station'

// Domain Errors
export * from './domain/errors/DomainErrors'

// Domain Repositories (interfaces only)
export type { IStationRepository } from './domain/repositories/IStationRepository'
export type { IUserRepository } from './domain/repositories/IUserRepository'
export type { IPlayerRepository, PlayerState } from './domain/repositories/IPlayerRepository'
export type { ISEORepository } from './domain/repositories/ISEORepository'

// Infrastructure - Only working adapters
export { StationApiRepository } from './infrastructure/api/StationApiRepository'
export { SEOApiRepository } from './infrastructure/api/SEOApiRepository'
export { FavoritesApiRepository } from './infrastructure/api/FavoritesApiRepository'
export { AnalyticsApiRepository } from './infrastructure/api/AnalyticsApiRepository'
export { AuthApiRepository } from './infrastructure/api/AuthApiRepository'
export type { TrendingSearch, PopularStation, ActiveUsersCount, TimeRange } from './infrastructure/api/AnalyticsApiRepository'
export type { LoginRequest, RegisterRequest, RefreshRequest, AuthTokens, UserInfo } from './infrastructure/api/AuthApiRepository'
export { ConsoleLogger } from './infrastructure/logging/ConsoleLogger'
export { MockAnalyticsService } from './infrastructure/analytics/MockAnalyticsService'
export { WebSecureStorage } from './infrastructure/storage/WebSecureStorage'
export type { ISecureStorage } from './infrastructure/storage/ISecureStorage'
export { default as apiClient, initializeApiClient } from './infrastructure/api/apiClient'
export { HowlerPlayerAdapter } from './infrastructure/audio/HowlerPlayerAdapter'

// Stores
export { usePlayerStore } from './stores/playerStore'

// SEO Components
export { RadioStationSchema, BreadcrumbSchema, WebSiteSchema } from './components/SEO/JsonLdSchema'
export { Breadcrumbs } from './components/SEO/Breadcrumbs'
export { RelatedStations } from './components/SEO/RelatedStations'

// Use Cases - Exportamos los principales para Next.js
export { GetRelatedStations } from './application/useCases/stations/GetRelatedStations'
export { GetPopularCountries } from './application/useCases/seo/GetPopularCountries'
export { GetPopularTags } from './application/useCases/seo/GetPopularTags'
export { GetSitemapData } from './application/useCases/seo/GetSitemapData'

// Note: Components are platform-specific and should be imported from apps/next or apps/expo
// Note: Additional use cases can be imported directly when needed:
// import { SearchStationsUseCase } from '@radio-app/app/application/useCases/stations/SearchStations'
