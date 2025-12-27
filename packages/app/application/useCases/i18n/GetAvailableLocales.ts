/**
 * Get Available Locales Use Case
 * Returns all available locales in the application
 */

import { ITranslator } from '../../ports/ITranslator'
import { ILogger } from '../../ports/ILogger'

export interface LocaleInfo {
  code: string
  name: string
  nativeName: string
  flag: string
  isActive: boolean
}

export class GetAvailableLocalesUseCase {
  constructor(
    private readonly translator: ITranslator,
    private readonly logger: ILogger
  ) {}

  execute(): LocaleInfo[] {
    this.logger.info('Getting available locales')

    try {
      const availableLocales = this.translator.getAvailableLocales()
      const currentLocale = this.translator.getCurrentLocale()

      const localeInfos: LocaleInfo[] = availableLocales.map(locale => ({
        code: locale.code,
        name: locale.name,
        nativeName: locale.nativeName,
        flag: locale.flag,
        isActive: locale.equals(currentLocale)
      }))

      this.logger.info('Retrieved available locales', {
        count: localeInfos.length,
        locales: localeInfos.map(l => l.code).join(', '),
        currentLocale: currentLocale.code
      })

      return localeInfos
    } catch (error) {
      this.logger.error('Failed to get available locales', { error })
      throw error
    }
  }
}
