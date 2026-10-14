/**
 * @radio-app/app — dominio e infraestructura compartidos del catálogo y el reproductor.
 * Solo se exporta lo que usa apps/next.
 */
export { Station } from './domain/entities/Station'
export type { StationDTO, SEOMetadata } from './domain/entities/Station'
export { Locale } from './domain/valueObjects/Locale'
export type { LocaleCode } from './domain/valueObjects/Locale'
export type { IStationRepository } from './domain/repositories/IStationRepository'
export type { ITranslator, TranslationOptions } from './application/ports/ITranslator'
export type { ILocaleFormatter, DateFormat, NumberFormatOptions, CurrencyFormatOptions } from './application/ports/ILocaleFormatter'
export { StationApiRepository } from './infrastructure/api/StationApiRepository'
export { default as apiClient, setApiLocale, getApiLocale } from './infrastructure/api/apiClient'
export { HowlerPlayerAdapter } from './infrastructure/audio/HowlerPlayerAdapter'
export { NextIntlAdapter } from './infrastructure/i18n/NextIntlAdapter'
export { LocaleFormatter } from './infrastructure/i18n/LocaleFormatter'
export { usePlayerStore } from './stores/playerStore'
export { RadioStationSchema, BreadcrumbSchema, WebSiteSchema } from './components/SEO/JsonLdSchema'
export { Breadcrumbs } from './components/SEO/Breadcrumbs'
export { GetRelatedStations } from './application/useCases/stations/GetRelatedStations'
