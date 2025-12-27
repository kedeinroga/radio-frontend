/**
 * Mock implementations for testing
 */

import { ITranslator, TranslationOptions } from '@/application/ports/ITranslator'
import { ILogger } from '@/application/ports/ILogger'
import { Locale } from '@/domain/valueObjects/Locale'
import { Translation } from '@/domain/entities/Translation'

/**
 * Mock Translator for testing
 */
export class MockTranslator implements ITranslator {
  private currentLocale: Locale = Locale.default()
  private translations: Map<string, Map<string, string>> = new Map()
  
  // Track method calls for assertions
  public calls = {
    setLocale: [] as Locale[],
    loadTranslations: [] as Locale[],
    translate: [] as Array<{ key: string, options?: TranslationOptions }>,
  }

  constructor() {
    // Setup default translations
    this.setupTranslations()
  }

  private setupTranslations() {
    // Spanish translations
    const esTrans = new Map<string, string>()
    esTrans.set('common.loading', 'Cargando')
    esTrans.set('common.error', 'Error')
    esTrans.set('greeting.hello', 'Hola {{name}}')
    this.translations.set('es', esTrans)

    // English translations
    const enTrans = new Map<string, string>()
    enTrans.set('common.loading', 'Loading')
    enTrans.set('common.error', 'Error')
    enTrans.set('greeting.hello', 'Hello {{name}}')
    this.translations.set('en', enTrans)

    // French translations
    const frTrans = new Map<string, string>()
    frTrans.set('common.loading', 'Chargement')
    frTrans.set('common.error', 'Erreur')
    frTrans.set('greeting.hello', 'Bonjour {{name}}')
    this.translations.set('fr', frTrans)

    // German translations
    const deTrans = new Map<string, string>()
    deTrans.set('common.loading', 'Laden')
    deTrans.set('common.error', 'Fehler')
    deTrans.set('greeting.hello', 'Hallo {{name}}')
    this.translations.set('de', deTrans)
  }

  async setLocale(locale: Locale): Promise<void> {
    this.calls.setLocale.push(locale)
    this.currentLocale = locale
  }

  async loadTranslations(locale: Locale): Promise<void> {
    this.calls.loadTranslations.push(locale)
  }

  getCurrentLocale(): Locale {
    return this.currentLocale
  }

  getAvailableLocales(): Locale[] {
    return Locale.all()
  }

  translate(key: string, options?: TranslationOptions): string {
    this.calls.translate.push({ key, options })
    
    const localeTranslations = this.translations.get(this.currentLocale.code)
    if (!localeTranslations) {
      return key
    }

    let translation = localeTranslations.get(key) || key

    // Handle interpolation
    if (options?.params) {
      Object.entries(options.params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(value))
      })
    }

    return translation
  }

  translateTo(key: string, locale: Locale, options?: TranslationOptions): string {
    const localeTranslations = this.translations.get(locale.code)
    if (!localeTranslations) {
      return key
    }

    let translation = localeTranslations.get(key) || key

    // Handle interpolation
    if (options?.params) {
      Object.entries(options.params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{{${paramKey}}}`, String(value))
      })
    }

    return translation
  }

  hasKey(key: string): boolean {
    const localeTranslations = this.translations.get(this.currentLocale.code)
    return localeTranslations ? localeTranslations.has(key) : false
  }

  hasTranslation(key: string, locale?: Locale): boolean {
    const targetLocale = locale || this.currentLocale
    const localeTranslations = this.translations.get(targetLocale.code)
    return localeTranslations ? localeTranslations.has(key) : false
  }

  getTranslation(key: string, locale?: Locale): Translation | null {
    const targetLocale = locale || this.currentLocale
    const localeTranslations = this.translations.get(targetLocale.code)
    
    if (!localeTranslations || !localeTranslations.has(key)) {
      return null
    }

    return new Translation(key, localeTranslations.get(key)!, targetLocale)
  }

  // Helper method to add translations for testing
  addTranslation(locale: string, key: string, value: string) {
    if (!this.translations.has(locale)) {
      this.translations.set(locale, new Map())
    }
    this.translations.get(locale)!.set(key, value)
  }

  // Helper to reset call tracking
  resetCalls() {
    this.calls = {
      setLocale: [],
      loadTranslations: [],
      translate: [],
    }
  }
}

/**
 * Mock Logger for testing
 */
export class MockLogger implements ILogger {
  public logs: Array<{ level: string, message: string, context?: any }> = []

  info(message: string, context?: any): void {
    this.logs.push({ level: 'info', message, context })
  }

  warn(message: string, context?: any): void {
    this.logs.push({ level: 'warn', message, context })
  }

  error(message: string, context?: any): void {
    this.logs.push({ level: 'error', message, context })
  }

  debug(message: string, context?: any): void {
    this.logs.push({ level: 'debug', message, context })
  }

  fatal(message: string, context?: any): void {
    this.logs.push({ level: 'fatal', message, context })
  }

  // Helper to get logs by level
  getLogsByLevel(level: string) {
    return this.logs.filter(log => log.level === level)
  }

  // Helper to reset logs
  resetLogs() {
    this.logs = []
  }
}
