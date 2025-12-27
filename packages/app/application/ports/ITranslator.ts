/**
 * ITranslator Port
 * Abstraction for translation services
 * Allows different implementations (next-intl, i18next, etc.)
 */

import { Locale } from '../../domain/valueObjects/Locale'
import { Translation } from '../../domain/entities/Translation'

export interface TranslationOptions {
  /**
   * Parameters for interpolation
   */
  params?: Record<string, string | number | boolean>
  
  /**
   * Default value if translation is not found
   */
  defaultValue?: string
  
  /**
   * Count for pluralization
   */
  count?: number
}

export interface ITranslator {
  /**
   * Translates a key using the current locale
   * @param key - Translation key (e.g., "common.play", "player.nowPlaying")
   * @param options - Translation options (params, defaultValue, count)
   * @returns Translated string
   */
  translate(key: string, options?: TranslationOptions): string

  /**
   * Translates a key to a specific locale
   * @param key - Translation key
   * @param locale - Target locale
   * @param options - Translation options
   * @returns Translated string
   */
  translateTo(key: string, locale: Locale, options?: TranslationOptions): string

  /**
   * Gets the current active locale
   * @returns Current Locale
   */
  getCurrentLocale(): Locale

  /**
   * Changes the active locale
   * @param locale - New locale to activate
   */
  setLocale(locale: Locale): Promise<void>

  /**
   * Gets all available locales
   * @returns Array of available locales
   */
  getAvailableLocales(): Locale[]

  /**
   * Checks if a translation key exists
   * @param key - Translation key to check
   * @param locale - Optional locale (uses current if not provided)
   * @returns True if translation exists
   */
  hasTranslation(key: string, locale?: Locale): boolean

  /**
   * Gets a Translation entity for a key
   * @param key - Translation key
   * @param locale - Optional locale (uses current if not provided)
   * @returns Translation entity or null if not found
   */
  getTranslation(key: string, locale?: Locale): Translation | null

  /**
   * Loads translations for a specific locale
   * Useful for lazy loading translations
   * @param locale - Locale to load translations for
   */
  loadTranslations(locale: Locale): Promise<void>
}
