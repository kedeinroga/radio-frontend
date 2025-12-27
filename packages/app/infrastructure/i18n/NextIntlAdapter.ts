/**
 * Next-Intl Adapter
 * Implements ITranslator using a simple translation store
 * This adapter can be adapted to work with next-intl or any other i18n library
 */

import { ITranslator, TranslationOptions } from '../../application/ports/ITranslator'
import { Translation } from '../../domain/entities/Translation'
import { Locale } from '../../domain/valueObjects/Locale'

type TranslationMessages = Record<string, any>

export class NextIntlAdapter implements ITranslator {
  private currentLocale: Locale
  private translations: Map<string, TranslationMessages> = new Map()
  private onLocaleChange?: (locale: Locale) => void

  constructor(
    initialLocale: Locale,
    onLocaleChange?: (locale: Locale) => void,
    initialMessages?: TranslationMessages
  ) {
    this.currentLocale = initialLocale
    this.onLocaleChange = onLocaleChange
    
    // Load initial translations if provided
    if (initialMessages) {
      this.translations.set(initialLocale.code, initialMessages)
    }
  }

  /**
   * Set translations directly (useful for SSR)
   */
  setTranslations(locale: Locale, messages: TranslationMessages): void {
    this.translations.set(locale.code, messages)
  }

  /**
   * Loads translations from JSON files
   * In Next.js App Router, this is typically done server-side
   */
  async loadTranslations(locale: Locale): Promise<void> {
    // Validate locale
    if (!locale || !locale.code) {
      console.error('Invalid locale provided to loadTranslations:', locale)
      throw new Error('Invalid locale: locale or locale.code is undefined')
    }

    // Check if already loaded
    if (this.translations.has(locale.code)) {
      return
    }

    try {
      // Dynamic import of translation files
      // Located in apps/next/i18n/locales/
      const messages = await import(`../../../../apps/next/i18n/locales/${locale.code}.json`)
      this.translations.set(locale.code, messages.default || messages)
    } catch (error) {
      console.error(`Failed to load translations for locale ${locale.code}:`, error)
      throw new Error(`Could not load translations for locale: ${locale.code}`)
    }
  }

  translate(key: string, options?: TranslationOptions): string {
    return this.translateTo(key, this.currentLocale, options)
  }

  translateTo(key: string, locale: Locale, options?: TranslationOptions): string {
    const messages = this.translations.get(locale.code)

    if (!messages) {
      console.warn(`No translations loaded for locale: ${locale.code}`)
      return options?.defaultValue || key
    }

    // Navigate through nested keys (e.g., "common.play" -> messages.common.play)
    const value = this.getNestedValue(messages, key)

    if (value === undefined || value === null) {
      console.warn(`Translation key not found: ${key} (locale: ${locale.code})`)
      return options?.defaultValue || key
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key} (locale: ${locale.code})`)
      return options?.defaultValue || key
    }

    // Handle pluralization if count is provided
    if (options?.count !== undefined) {
      return this.pluralize(value, options.count, options.params)
    }

    // Handle interpolation if params are provided
    if (options?.params) {
      return this.interpolate(value, options.params)
    }

    return value
  }

  getCurrentLocale(): Locale {
    return this.currentLocale
  }

  async setLocale(locale: Locale): Promise<void> {
    // Load translations for the new locale if not already loaded
    if (!this.translations.has(locale.code)) {
      await this.loadTranslations(locale)
    }

    this.currentLocale = locale

    // Notify listeners (e.g., to update URL, save to cookie)
    if (this.onLocaleChange) {
      this.onLocaleChange(locale)
    }
  }

  getAvailableLocales(): Locale[] {
    return Locale.all()
  }

  hasTranslation(key: string, locale?: Locale): boolean {
    const targetLocale = locale || this.currentLocale
    const messages = this.translations.get(targetLocale.code)

    if (!messages) {
      return false
    }

    const value = this.getNestedValue(messages, key)
    return value !== undefined && value !== null
  }

  getTranslation(key: string, locale?: Locale): Translation | null {
    const targetLocale = locale || this.currentLocale
    const messages = this.translations.get(targetLocale.code)

    if (!messages) {
      return null
    }

    const value = this.getNestedValue(messages, key)

    if (value === undefined || value === null || typeof value !== 'string') {
      return null
    }

    // Extract namespace from key (e.g., "common.play" -> namespace: "common", key: "play")
    const parts = key.split('.')
    const namespace = parts.length > 1 ? parts[0] : undefined
    const simpleKey = parts.length > 1 ? parts.slice(1).join('.') : key

    return new Translation(simpleKey, value, targetLocale, namespace)
  }

  /**
   * Gets a nested value from an object using dot notation
   * Example: getNestedValue({common: {play: "Play"}}, "common.play") -> "Play"
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined
      }
      current = current[key]
    }

    return current
  }

  /**
   * Interpolates parameters into a template string
   * Example: "Hello {{name}}!" with {name: "John"} -> "Hello John!"
   * Supports both {{key}} (double braces) and {key} (single braces)
   */
  private interpolate(template: string, params: Record<string, any>): string {
    let result = template

    Object.entries(params).forEach(([key, value]) => {
      // Replace {{key}} (double braces) - primary format
      const doubleBracePlaceholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(doubleBracePlaceholder, String(value))
      
      // Replace {key} (single braces) - fallback format
      const singleBracePlaceholder = new RegExp(`\\{${key}\\}`, 'g')
      result = result.replace(singleBracePlaceholder, String(value))
    })

    // Warn about unresolved placeholders (both double and single braces)
    const unresolvedPlaceholders = result.match(/\{\{?[^}]+\}\}?/g)
    if (unresolvedPlaceholders) {
      console.warn(`Unresolved placeholders: ${unresolvedPlaceholders.join(', ')}`)
    }

    return result
  }

  /**
   * Handles pluralization
   * Simple implementation: "item|items" with count=1 -> "item"
   * More complex rules should be in a separate PluralRules service
   */
  private pluralize(
    template: string,
    count: number,
    params?: Record<string, any>
  ): string {
    const forms = template.split('|')

    if (forms.length === 1) {
      // No plural form, just interpolate count
      return this.interpolate(template, { ...params, count })
    }

    // Simple pluralization: 0 or 1 use first form, else use second
    const formIndex = count === 0 || count === 1 ? 0 : 1
    const form = forms[formIndex] || forms[0]

    return this.interpolate(form, { ...params, count })
  }

  /**
   * Preloads translations for multiple locales
   * Useful for SSR or initial app load
   */
  async preloadTranslations(locales: Locale[]): Promise<void> {
    await Promise.all(
      locales.map(locale => this.loadTranslations(locale))
    )
  }

  /**
   * Clears cached translations
   * Useful for hot-reloading in development
   */
  clearCache(): void {
    this.translations.clear()
  }

  /**
   * Gets all loaded locales
   */
  getLoadedLocales(): Locale[] {
    return Array.from(this.translations.keys()).map(code =>
      Locale.fromString(code)
    )
  }
}
