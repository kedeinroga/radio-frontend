/**
 * I18n System Integration Tests
 * Tests the complete i18n workflow from domain to infrastructure
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Locale } from '@/domain/valueObjects/Locale'
import { Translation } from '@/domain/entities/Translation'
import { ChangeLocaleUseCase } from '@/application/useCases/i18n/ChangeLocale'
import { GetTranslationUseCase } from '@/application/useCases/i18n/GetTranslation'
import { GetAvailableLocalesUseCase } from '@/application/useCases/i18n/GetAvailableLocales'
import { MockTranslator, MockLogger } from '@/test/mocks'

describe('I18n System Integration', () => {
  let translator: MockTranslator
  let logger: MockLogger
  let changeLocaleUseCase: ChangeLocaleUseCase
  let getTranslationUseCase: GetTranslationUseCase
  let getAvailableLocalesUseCase: GetAvailableLocalesUseCase

  beforeEach(() => {
    translator = new MockTranslator()
    logger = new MockLogger()
    changeLocaleUseCase = new ChangeLocaleUseCase(translator, logger)
    getTranslationUseCase = new GetTranslationUseCase(translator, logger)
    getAvailableLocalesUseCase = new GetAvailableLocalesUseCase(translator, logger)
  })

  describe('Complete User Flow', () => {
    it('should handle complete locale change and translation workflow', async () => {
      // 1. User starts with default locale (Spanish)
      const currentLocale = translator.getCurrentLocale()
      expect(currentLocale.code).toBe('es')

      // 2. User requests a translation in Spanish
      let translation = getTranslationUseCase.execute({ key: 'common.loading' })
      expect(translation).toBe('Cargando')

      // 3. User changes locale to English
      await changeLocaleUseCase.execute(Locale.fromCode('en'))
      expect(translator.getCurrentLocale().code).toBe('en')

      // 4. User requests same translation in English
      translation = getTranslationUseCase.execute({ key: 'common.loading' })
      expect(translation).toBe('Loading')

      // 5. User changes to French
      await changeLocaleUseCase.execute(Locale.fromCode('fr'))
      translation = getTranslationUseCase.execute({ key: 'common.loading' })
      expect(translation).toBe('Chargement')

      // 6. User changes to German
      await changeLocaleUseCase.execute(Locale.fromCode('de'))
      translation = getTranslationUseCase.execute({ key: 'common.loading' })
      expect(translation).toBe('Laden')
    })

    it('should handle translations with parameters across locales', async () => {
      // Spanish
      let translation = getTranslationUseCase.execute({
        key: 'greeting.hello',
        params: { name: 'María' }
      })
      expect(translation).toBe('Hola María')

      // Switch to English
      await changeLocaleUseCase.execute(Locale.fromCode('en'))
      translation = getTranslationUseCase.execute({
        key: 'greeting.hello',
        params: { name: 'María' }
      })
      expect(translation).toBe('Hello María')

      // Switch to French
      await changeLocaleUseCase.execute(Locale.fromCode('fr'))
      translation = getTranslationUseCase.execute({
        key: 'greeting.hello',
        params: { name: 'María' }
      })
      expect(translation).toBe('Bonjour María')
    })
  })

  describe('Available Locales Management', () => {
    it('should get all available locales', () => {
      const locales = getAvailableLocalesUseCase.execute()
      
      expect(locales).toHaveLength(4)
      expect(locales.map(l => l.code)).toEqual(['es', 'en', 'fr', 'de'])
    })

    it('should verify locale availability before changing', async () => {
      const availableLocales = getAvailableLocalesUseCase.execute()
      const targetLocaleCode = 'fr'
      
      const isAvailable = availableLocales.some(l => l.code === targetLocaleCode)
      expect(isAvailable).toBe(true)

      // Should successfully change to available locale
      await expect(changeLocaleUseCase.execute(Locale.fromCode('fr'))).resolves.not.toThrow()
    })
  })

  describe('Translation Entity Integration', () => {
    it('should create Translation entity from use case result', () => {
      const key = 'common.loading'
      const value = getTranslationUseCase.execute({ key })
      const locale = translator.getCurrentLocale()

      const translation = new Translation(key, value, locale)
      
      expect(translation.key).toBe(key)
      expect(translation.value).toBe('Cargando')
      expect(translation.locale.code).toBe('es')
    })

    it('should handle translations in multiple locales', async () => {
      const key = 'common.loading'
      const translations: Translation[] = []

      // Collect translations for all locales
      for (const locale of Locale.all()) {
        await changeLocaleUseCase.execute(locale)
        const value = getTranslationUseCase.execute({ key })
        translations.push(new Translation(key, value, locale))
      }

      expect(translations).toHaveLength(4)
      expect(translations[0].value).toBe('Cargando') // Spanish
      expect(translations[1].value).toBe('Loading') // English
      expect(translations[2].value).toBe('Chargement') // French
      expect(translations[3].value).toBe('Laden') // German
    })
  })

  describe('Error Handling Flow', () => {
    it('should handle missing translations gracefully', () => {
      const result = getTranslationUseCase.execute({
        key: 'nonexistent.key',
        defaultValue: 'Fallback Text'
      })

      expect(result).toBe('Fallback Text')
      
      const warnLogs = logger.getLogsByLevel('warn')
      expect(warnLogs).toHaveLength(1)
      expect(warnLogs[0].message).toContain('Translation key not found')
    })

    it('should log all locale changes', async () => {
      await changeLocaleUseCase.execute(Locale.fromCode('en'))
      await changeLocaleUseCase.execute(Locale.fromCode('fr'))
      await changeLocaleUseCase.execute(Locale.fromCode('de'))

      const infoLogs = logger.getLogsByLevel('info')
      
      // Should have 2 logs per change (start + success) = 6 logs
      expect(infoLogs.length).toBeGreaterThanOrEqual(6)
      
      const changeMessages = infoLogs.filter(log => 
        log.message.includes('Changing application locale')
      )
      expect(changeMessages).toHaveLength(3)
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle multiple translation requests', () => {
      const keys = ['common.loading', 'common.error', 'greeting.hello']
      const results = keys.map(key => 
        getTranslationUseCase.execute({ key })
      )

      expect(results).toHaveLength(3)
      expect(results[0]).toBe('Cargando')
      expect(results[1]).toBe('Error')
      expect(results[2]).toContain('Hola')
    })

    it('should maintain locale consistency across operations', async () => {
      await changeLocaleUseCase.execute(Locale.fromCode('en'))

      // Multiple translations should all use English
      const result1 = getTranslationUseCase.execute({ key: 'common.loading' })
      const result2 = getTranslationUseCase.execute({ key: 'common.error' })
      
      expect(result1).toBe('Loading')
      expect(result2).toBe('Error')
      expect(translator.getCurrentLocale().code).toBe('en')
    })
  })

  describe('Locale Metadata Integration', () => {
    it('should provide complete locale information', () => {
      const locales = getAvailableLocalesUseCase.execute()
      
      locales.forEach(locale => {
        expect(locale.name).toBeDefined()
        expect(locale.nativeName).toBeDefined()
        expect(locale.flag).toBeDefined()
        expect(locale.isActive).toBeDefined()
      })
    })

    it('should use locale metadata for UI display', async () => {
      await changeLocaleUseCase.execute(Locale.fromCode('en'))
      
      const currentLocale = translator.getCurrentLocale()
      expect(currentLocale.name).toBe('English')
      expect(currentLocale.nativeName).toBe('English')
      expect(currentLocale.flag).toBe('🇺🇸')
    })

    it('should mark current locale as active', async () => {
      await changeLocaleUseCase.execute(Locale.fromCode('fr'))
      
      const locales = getAvailableLocalesUseCase.execute()
      const activeLocale = locales.find(l => l.isActive)
      
      expect(activeLocale).toBeDefined()
      expect(activeLocale?.code).toBe('fr')
    })
  })

  describe('Real-World Scenarios', () => {
    it('should handle station description translations', async () => {
      translator.addTranslation('es', 'stations.listen24h', 'Escucha en vivo las 24 horas')
      translator.addTranslation('en', 'stations.listen24h', 'Listen live 24 hours')
      translator.addTranslation('fr', 'stations.listen24h', 'Écoutez en direct 24 heures')
      translator.addTranslation('de', 'stations.listen24h', 'Höre 24 Stunden live')

      // Spanish
      let result = getTranslationUseCase.execute({ key: 'stations.listen24h' })
      expect(result).toBe('Escucha en vivo las 24 horas')

      // English
      await changeLocaleUseCase.execute(Locale.fromCode('en'))
      result = getTranslationUseCase.execute({ key: 'stations.listen24h' })
      expect(result).toBe('Listen live 24 hours')

      // French
      await changeLocaleUseCase.execute(Locale.fromCode('fr'))
      result = getTranslationUseCase.execute({ key: 'stations.listen24h' })
      expect(result).toBe('Écoutez en direct 24 heures')
    })

    it('should handle player controls translation', async () => {
      translator.addTranslation('es', 'player.play', 'Reproducir')
      translator.addTranslation('en', 'player.play', 'Play')
      translator.addTranslation('fr', 'player.play', 'Jouer')
      translator.addTranslation('de', 'player.play', 'Abspielen')

      const locales = ['es', 'en', 'fr', 'de'] as const
      const expectedTranslations = ['Reproducir', 'Play', 'Jouer', 'Abspielen']

      for (let i = 0; i < locales.length; i++) {
        await changeLocaleUseCase.execute(Locale.fromCode(locales[i]))
        const result = getTranslationUseCase.execute({ key: 'player.play' })
        expect(result).toBe(expectedTranslations[i])
      }
    })
  })
})
