/**
 * Change Locale Use Case
 * Handles changing the application locale
 */

import { ITranslator } from '../../ports/ITranslator'
import { ILogger } from '../../ports/ILogger'
import { Locale } from '../../../domain/valueObjects/Locale'

export class ChangeLocaleUseCase {
  constructor(
    private readonly translator: ITranslator,
    private readonly logger: ILogger
  ) {}

  async execute(newLocale: Locale): Promise<void> {
    const currentLocale = this.translator.getCurrentLocale()

    this.logger.info('Changing application locale', {
      from: currentLocale.code,
      to: newLocale.code
    })

    try {
      // Validate that the new locale is available
      const availableLocales = this.translator.getAvailableLocales()
      const isAvailable = availableLocales.some(locale => locale.equals(newLocale))

      if (!isAvailable) {
        throw new Error(
          `Locale ${newLocale.code} is not available. Available locales: ${availableLocales.map(l => l.code).join(', ')}`
        )
      }

      // Load translations for the new locale if needed
      await this.translator.loadTranslations(newLocale)

      // Set the new locale
      await this.translator.setLocale(newLocale)

      this.logger.info('Locale changed successfully', {
        newLocale: newLocale.code
      })
    } catch (error) {
      this.logger.error('Failed to change locale', {
        targetLocale: newLocale.code,
        error
      })
      throw error
    }
  }
}
