/**
 * Get Translation Use Case
 * Retrieves a specific translation with proper error handling
 */

import { ITranslator } from '../../ports/ITranslator'
import { ILogger } from '../../ports/ILogger'
import { Locale } from '../../../domain/valueObjects/Locale'

export interface GetTranslationRequest {
  key: string
  locale?: Locale
  params?: Record<string, string | number | boolean>
  defaultValue?: string
}

export class GetTranslationUseCase {
  constructor(
    private readonly translator: ITranslator,
    private readonly logger: ILogger
  ) {}

  execute(request: GetTranslationRequest): string {
    const { key, locale, params, defaultValue } = request
    const targetLocale = locale || this.translator.getCurrentLocale()

    this.logger.debug('Getting translation', {
      key,
      locale: targetLocale.code,
      hasParams: !!params
    })

    try {
      // Check if translation exists
      if (!this.translator.hasTranslation(key, targetLocale)) {
        this.logger.warn('Translation key not found', {
          key,
          locale: targetLocale.code
        })

        if (defaultValue) {
          return defaultValue
        }

        // Return the key as fallback
        return key
      }

      // Get the translation
      const translation = locale
        ? this.translator.translateTo(key, locale, { params, defaultValue })
        : this.translator.translate(key, { params, defaultValue })

      return translation
    } catch (error) {
      this.logger.error('Failed to get translation', {
        key,
        locale: targetLocale.code,
        error
      })

      // Return default value or key as fallback
      return defaultValue || key
    }
  }
}
