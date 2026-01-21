// Domain Entities
export { Station } from './domain/entities/Station'
export type { StationDTO, SEOMetadata } from './domain/entities/Station'
export { User } from './domain/entities/User'
export { PopularCountry } from './domain/entities/PopularCountry'
export { PopularTag } from './domain/entities/PopularTag'
export { SitemapData } from './domain/entities/SitemapData'
export { Translation } from './domain/entities/Translation'

// Domain Entities - Advertisements
export type { Advertisement } from './domain/entities/Advertisement'
export {
  isAdvertisementActive,
  calculateAdvertisementCTR,
  calculateAdvertisementECPM,
  doesAdvertisementMatchContext,
  createAdvertisement,
} from './domain/entities/Advertisement'

export type { AdCampaign } from './domain/entities/AdCampaign'
export {
  isAdCampaignActive,
  getAdCampaignRemainingBudget,
  getAdCampaignBudgetUsagePercentage,
  hasAdCampaignReachedDailyBudget,
  createAdCampaign,
} from './domain/entities/AdCampaign'

export type { UserAdProfile } from './domain/entities/UserAdProfile'
export {
  hasActivePremiumSubscription,
  hasUserReachedHourlyAdLimit,
  hasUserReachedDailyAdLimit,
  incrementUserAdCounters,
  resetUserHourlyAdCounter,
  resetUserDailyAdCounter,
  createUserAdProfile,
} from './domain/entities/UserAdProfile'

// Domain Entities - Subscriptions
export type { Subscription, SubscriptionStatus, BillingInterval, CreateSubscriptionFromStripeDTO } from './domain/entities/Subscription'
export {
  createSubscription,
  isSubscriptionActive,
  isSubscriptionInTrial,
  isSubscriptionCanceled,
  getDaysRemainingInPeriod,
  formatSubscriptionPrice,
  getBillingIntervalText,
  createSubscriptionFromStripeWebhook,
} from './domain/entities/Subscription'

// Domain Entities - Audio Ads
export type {
  AudioAd,
  AudioAdPlacement,
  AudioAdFormat,
  AudioAdPlaybackState,
  AudioAdQueue,
  AudioAdMidRoll,
  AudioAdConfig,
  VASTResponse,
  VASTAd,
  VASTInLine,
  VASTWrapper,
  VASTCreative,
  VASTLinear,
  VASTNonLinear,
  VASTCompanionAd,
  VASTTrackingEvent,
  VASTTrackingEventType,
  VASTVideoClicks,
  VASTMediaFile,
  VASTIcon,
} from './domain/entities/AudioAd'
export {
  createAudioAdFromVAST,
  shouldPlayAudioAd,
  calculateAdProgress,
  formatAdDuration,
  createAudioAdQueue,
} from './domain/entities/AudioAd'

export type { SubscriptionPlan, PlanType, PlanFeatures } from './domain/entities/SubscriptionPlan'
export {
  createSubscriptionPlan,
  DEFAULT_PLANS,
  getPlanById,
  getPlanByType,
  calculateYearlySavings,
  formatPlanPrice,
  hasFeature,
  comparePlans,
  getActivePlans,
  getPopularPlan,
  getFeaturedPlan,
} from './domain/entities/SubscriptionPlan'

// Domain Entities - Maintenance
export type {
  PartitionInfo,
  PartitionStatusResponse,
  MaintenanceRecommendation,
  RecommendationsResponse,
  RefreshStatsResponse,
  RefreshViewsRequest,
  RefreshViewsResponse,
  CleanupPartitionsRequest,
  CleanupPartitionsResponse,
  CheckPartitionsResponse,
  FullMaintenanceResponse,
} from './domain/entities/Maintenance'

// Domain Entities - Monitoring
export type {
  Alert,
  DatabaseHealth,
  RedisHealth,
  ExternalAPIHealth,
  PartitionHealth,
  MaterializedViewHealth,
  PerformanceMetrics,
  HealthMetrics,
  HealthResponse,
  AlertsResponse,
} from './domain/entities/Monitoring'

// Domain Entities - Session
export type {
  DeviceInfo,
  Location,
  SessionInfo as SessionInfoEntity,
  GetSessionsResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  SessionMetadata as SessionMetadataEntity,
  ValidateTokenRequest,
  ValidateTokenResponse,
  LogoutResponse,
} from './domain/entities/Session'

// Domain Value Objects
export { Locale } from './domain/valueObjects/Locale'
export type { LocaleCode } from './domain/valueObjects/Locale'

// Domain Value Objects - Advertisements
export type { AdPlacement } from './domain/valueObjects/AdPlacement'
export {
  AD_FREQUENCY_CAPPING,
  AD_PLACEMENT_PRIORITY,
  isValidAdPlacement,
  getAdFormatForPlacement,
  canShowAdInPlacement,
  getNextAvailableAdTime,
  getPlacementsByPriority,
} from './domain/valueObjects/AdPlacement'

export type { AdFormat } from './domain/valueObjects/AdFormat'
export {
  AD_BANNER_SIZES,
  AUDIO_AD_DURATION,
  getRecommendedBannerSize,
  getRecommendedAudioDuration,
} from './domain/valueObjects/AdFormat'

// Domain Errors
export * from './domain/errors/DomainErrors'

// Domain Repositories (interfaces only)
export type { IStationRepository } from './domain/repositories/IStationRepository'
export type { IUserRepository } from './domain/repositories/IUserRepository'
export type { IPlayerRepository, PlayerState } from './domain/repositories/IPlayerRepository'
export type { ISEORepository } from './domain/repositories/ISEORepository'

// Domain Repositories - Advertisements
export type {
  IAdvertisementRepository,
  AdContext,
  ImpressionMetadata,
  ClickMetadata,
  FetchAdResult,
} from './domain/repositories/IAdvertisementRepository'

// Application Ports
export type { ITranslator, TranslationOptions } from './application/ports/ITranslator'
export type { ILocaleFormatter, DateFormat, NumberFormatOptions, CurrencyFormatOptions } from './application/ports/ILocaleFormatter'

// Infrastructure - Only working adapters
export { StationApiRepository } from './infrastructure/api/StationApiRepository'
export { SEOApiRepository } from './infrastructure/api/SEOApiRepository'
export { FavoritesApiRepository } from './infrastructure/api/FavoritesApiRepository'
export { AnalyticsApiRepository } from './infrastructure/api/AnalyticsApiRepository'
export { AuthApiRepository } from './infrastructure/api/AuthApiRepository'
export { AdminApiRepository, adminApiRepository } from './infrastructure/api/AdminApiRepository'
export { MaintenanceApiRepository, maintenanceApiRepository } from './infrastructure/api/MaintenanceApiRepository'
export { MonitoringApiRepository, monitoringApiRepository } from './infrastructure/api/MonitoringApiRepository'
export { AdvertisementApiRepository } from './infrastructure/api/AdvertisementApiRepository'
export type { TrendingSearch, PopularStation, ActiveUsersCount, TimeRange } from './infrastructure/api/AnalyticsApiRepository'
export type { LoginRequest, RegisterRequest, RefreshRequest, AuthTokens, UserInfo } from './infrastructure/api/AuthApiRepository'
export { ConsoleLogger } from './infrastructure/logging/ConsoleLogger'
export { securityLogger, SecurityLog, SecurityEventType } from './infrastructure/logging/SecurityLogger'
export type { SecurityEvent } from './infrastructure/logging/SecurityLogger'
export { MockAnalyticsService } from './infrastructure/analytics/MockAnalyticsService'
export { WebSecureStorage } from './infrastructure/storage/WebSecureStorage'
export type { ISecureStorage } from './infrastructure/storage/ISecureStorage'
export { default as apiClient, initializeApiClient, setApiLocale, getApiLocale } from './infrastructure/api/apiClient'
export { HowlerPlayerAdapter } from './infrastructure/audio/HowlerPlayerAdapter'

// Infrastructure - i18n
export { NextIntlAdapter } from './infrastructure/i18n/NextIntlAdapter'
export { LocaleFormatter } from './infrastructure/i18n/LocaleFormatter'

// Infrastructure - Security Helpers
export { 
  isSafeInternalRedirect, 
  safeRedirect, 
  sanitizeErrorMessage,
  isValidEmail,
  validatePasswordStrength,
  generateSecureToken
} from './infrastructure/utils/securityHelpers'

// Infrastructure - Ad Sanitization
export {
  sanitizeAdUrl,
  validateAdMedia,
  sanitizeAdText,
  sanitizeAdvertisement,
  validateAdvertisementSafety,
  sanitizeAdHTML,
} from './infrastructure/utils/adSanitization'

// Infrastructure - Ad Fraud Detection
export {
  FraudDetectionService,
  getFraudDetectionService,
  resetFraudDetectionService,
} from './infrastructure/ads/FraudDetection'
export type {
  FraudValidationResult,
  FraudDetectionConfig,
} from './infrastructure/ads/FraudDetection'

export {
  ImpressionCache,
  getImpressionCache,
  resetImpressionCache,
} from './infrastructure/ads/ImpressionCache'
export type {
  CachedImpression,
  CachedClick,
} from './infrastructure/ads/ImpressionCache'

// Infrastructure - Crypto Helpers
export {
  encrypt,
  decrypt,
  isEncryptionAvailable
} from './infrastructure/utils/cryptoHelpers'

// Infrastructure - JWT Helpers
export {
  decodeJWT,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  willExpireSoon,
  getTokenRole,
  getTokenUserId,
  getTokenId,
  getSessionId,
  isValidJWTFormat,
  isTokenValid
} from './infrastructure/utils/jwtHelpers'
export type { JWTPayload } from './infrastructure/utils/jwtHelpers'

// Infrastructure - Session Validation
export { SessionValidator } from './infrastructure/auth/SessionValidator'
export type { 
  SessionMetadata, 
  TokenValidationResult, 
  SessionInfo 
} from './infrastructure/auth/SessionValidator'

// Infrastructure - Validation Schemas
export {
  loginSchema,
  registerSchema,
  translationSchema,
  searchSchema,
  stationIdSchema,
  urlParamSchema,
  validateData
} from './infrastructure/validation/schemas'
export type {
  LoginFormData,
  RegisterFormData,
  TranslationFormData,
  SearchFormData,
  StationIdData,
  UrlParamData
} from './infrastructure/validation/schemas'

// Stores
export { usePlayerStore } from './stores/playerStore'
export { useAuthStore } from './stores/authStore'

// SEO Components
export { RadioStationSchema, BreadcrumbSchema, WebSiteSchema } from './components/SEO/JsonLdSchema'
export { Breadcrumbs } from './components/SEO/Breadcrumbs'
export { RelatedStations } from './components/SEO/RelatedStations'

// Use Cases - Exportamos los principales para Next.js
export { GetRelatedStations } from './application/useCases/stations/GetRelatedStations'
export { GetPopularCountries } from './application/useCases/seo/GetPopularCountries'
export { GetPopularTags } from './application/useCases/seo/GetPopularTags'
export { GetSitemapData } from './application/useCases/seo/GetSitemapData'

// Use Cases - Advertisements
export { FetchAdForPlacement } from './application/useCases/ads/FetchAdForPlacement'
export type {
  FetchAdForPlacementInput,
  FetchAdForPlacementOutput,
} from './application/useCases/ads/FetchAdForPlacement'

export { TrackAdImpression } from './application/useCases/ads/TrackAdImpression'
export type {
  TrackImpressionInput,
  TrackImpressionOutput,
} from './application/useCases/ads/TrackAdImpression'

export { TrackAdClick } from './application/useCases/ads/TrackAdClick'
export type {
  TrackClickInput,
  TrackClickOutput,
} from './application/useCases/ads/TrackAdClick'

// Use Cases - Subscriptions
export { CreateCheckoutSession } from './application/useCases/subscription/CreateCheckoutSession'
export type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from './application/useCases/subscription/CreateCheckoutSession'

export { CancelSubscription } from './application/useCases/subscription/CancelSubscription'
export type {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
} from './application/useCases/subscription/CancelSubscription'

export { GetUserSubscription } from './application/useCases/subscription/GetUserSubscription'
export type {
  GetUserSubscriptionRequest,
  GetUserSubscriptionResponse,
} from './application/useCases/subscription/GetUserSubscription'

export { CheckPremiumStatus } from './application/useCases/subscription/CheckPremiumStatus'
export type {
  CheckPremiumStatusRequest,
  CheckPremiumStatusResponse,
} from './application/useCases/subscription/CheckPremiumStatus'

export { ResumeSubscription } from './application/useCases/subscription/ResumeSubscription'
export type {
  ResumeSubscriptionRequest,
  ResumeSubscriptionResponse,
} from './application/useCases/subscription/ResumeSubscription'

// Infrastructure - Repositories
export { SubscriptionApiRepository } from './infrastructure/api/SubscriptionApiRepository'

// Use Cases - i18n
export { ChangeLocaleUseCase } from './application/useCases/i18n/ChangeLocale'
export { GetAvailableLocalesUseCase } from './application/useCases/i18n/GetAvailableLocales'
export { GetTranslationUseCase } from './application/useCases/i18n/GetTranslation'
export type { LocaleInfo } from './application/useCases/i18n/GetAvailableLocales'
export type { GetTranslationRequest } from './application/useCases/i18n/GetTranslation'

// Note: Components are platform-specific and should be imported from apps/next or apps/expo
// Note: Additional use cases can be imported directly when needed:
// import { SearchStationsUseCase } from '@radio-app/app/application/useCases/stations/SearchStations'
