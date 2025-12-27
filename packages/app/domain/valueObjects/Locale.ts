/**
 * Locale Value Object
 * Represents a language/locale in the domain
 * Immutable and self-validating
 */

export type LocaleCode = 'es' | 'en' | 'fr' | 'de'

export interface LocaleMetadata {
  code: LocaleCode
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
}

export class Locale {
  private static readonly VALID_LOCALES: LocaleCode[] = ['es', 'en', 'fr', 'de']
  private static readonly DEFAULT_LOCALE: LocaleCode = 'es'
  
  private static readonly LOCALE_METADATA: Record<LocaleCode, LocaleMetadata> = {
    es: {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      direction: 'ltr'
    },
    en: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr'
    },
    fr: {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      direction: 'ltr'
    },
    de: {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      direction: 'ltr'
    }
  }

  private constructor(private readonly _code: LocaleCode) {
    this.validate()
  }

  private validate(): void {
    if (!Locale.VALID_LOCALES.includes(this._code)) {
      throw new Error(`Invalid locale code: ${this._code}. Valid locales are: ${Locale.VALID_LOCALES.join(', ')}`)
    }
  }

  /**
   * Gets the locale code (es, en, fr, de)
   */
  get code(): LocaleCode {
    return this._code
  }

  /**
   * Gets full metadata for this locale
   */
  get metadata(): LocaleMetadata {
    return Locale.LOCALE_METADATA[this._code]
  }

  /**
   * Gets the display name in English
   */
  get name(): string {
    return this.metadata.name
  }

  /**
   * Gets the native name (e.g., "Español" for Spanish)
   */
  get nativeName(): string {
    return this.metadata.nativeName
  }

  /**
   * Gets the flag emoji
   */
  get flag(): string {
    return this.metadata.flag
  }

  /**
   * Gets text direction (ltr or rtl)
   */
  get direction(): 'ltr' | 'rtl' {
    return this.metadata.direction
  }

  /**
   * Creates a Locale from a string (e.g., "es", "en-US", "fr_FR")
   * Normalizes the input and validates
   * Returns default locale if invalid
   */
  static fromString(input: string): Locale {
    // Normalize: lowercase, extract first part before - or _
    const normalized = input.toLowerCase().split(/[-_]/)[0] as LocaleCode
    
    if (Locale.VALID_LOCALES.includes(normalized)) {
      return new Locale(normalized)
    }
    
    // Fallback to default
    return Locale.default()
  }

  /**
   * Creates a Locale from browser Accept-Language header
   * Example: "en-US,en;q=0.9,es;q=0.8" -> Locale('en')
   */
  static fromAcceptLanguage(header: string): Locale {
    // Parse Accept-Language header
    const languages = header
      .split(',')
      .map(lang => {
        const [locale, q] = lang.trim().split(';q=')
        return {
          locale: locale.trim(),
          quality: q ? parseFloat(q) : 1.0
        }
      })
      .sort((a, b) => b.quality - a.quality)

    // Try each language in order of preference
    for (const { locale } of languages) {
      const normalized = locale.split('-')[0].toLowerCase() as LocaleCode
      if (Locale.VALID_LOCALES.includes(normalized)) {
        return new Locale(normalized)
      }
    }

    // Fallback to default
    return Locale.default()
  }

  /**
   * Returns the default locale (Spanish)
   */
  static default(): Locale {
    return new Locale(Locale.DEFAULT_LOCALE)
  }

  /**
   * Returns all available locales
   */
  static all(): Locale[] {
    return Locale.VALID_LOCALES.map(code => new Locale(code))
  }

  /**
   * Gets all available locale codes
   */
  static codes(): LocaleCode[] {
    return [...Locale.VALID_LOCALES]
  }

  /**
   * Checks if a locale code is valid
   */
  static isValid(code: string): boolean {
    return Locale.VALID_LOCALES.includes(code as LocaleCode)
  }

  /**
   * Checks equality with another Locale
   */
  equals(other: Locale): boolean {
    return this._code === other._code
  }

  /**
   * Returns string representation (the locale code)
   */
  toString(): string {
    return this._code
  }

  /**
   * Returns JSON representation
   */
  toJSON(): LocaleCode {
    return this._code
  }

  /**
   * Creates a Locale from a LocaleCode (type-safe factory)
   */
  static fromCode(code: LocaleCode): Locale {
    return new Locale(code)
  }
}
