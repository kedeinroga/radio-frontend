/**
 * Change Locale Use Case Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ChangeLocaleUseCase } from '@/application/useCases/i18n/ChangeLocale'
import { MockTranslator, MockLogger } from '@/test/mocks'
import { Locale } from '@/domain/valueObjects/Locale'

describe('ChangeLocaleUseCase', () => {
  let useCase: ChangeLocaleUseCase
  let mockTranslator: MockTranslator
  let mockLogger: MockLogger

  beforeEach(() => {
    mockTranslator = new MockTranslator()
    mockLogger = new MockLogger()
    useCase = new ChangeLocaleUseCase(mockTranslator, mockLogger)
  })

  describe('Successful Locale Change', () => {
    it('should change locale to English', async () => {
      const newLocale = Locale.fromCode('en')
      await useCase.execute(newLocale)

      // Check that setLocale was called
      expect(mockTranslator.calls.setLocale).toHaveLength(1)
      expect(mockTranslator.calls.setLocale[0].code).toBe('en')
      
      // Check that translations were loaded
      expect(mockTranslator.calls.loadTranslations).toHaveLength(1)
      expect(mockTranslator.calls.loadTranslations[0].code).toBe('en')
    })

    it('should change locale to French', async () => {
      const newLocale = Locale.fromCode('fr')
      await useCase.execute(newLocale)

      expect(mockTranslator.getCurrentLocale().code).toBe('fr')
    })

    it('should change locale to German', async () => {
      const newLocale = Locale.fromCode('de')
      await useCase.execute(newLocale)

      expect(mockTranslator.getCurrentLocale().code).toBe('de')
    })

    it('should log locale change', async () => {
      const newLocale = Locale.fromCode('en')
      await useCase.execute(newLocale)

      const infoLogs = mockLogger.getLogsByLevel('info')
      expect(infoLogs).toHaveLength(2) // One for start, one for success
      expect(infoLogs[0].message).toContain('Changing application locale')
      expect(infoLogs[1].message).toContain('Locale changed successfully')
    })

    it('should include locale codes in log context', async () => {
      const newLocale = Locale.fromCode('en')
      await useCase.execute(newLocale)

      const infoLogs = mockLogger.getLogsByLevel('info')
      expect(infoLogs[0].context).toEqual({ from: 'es', to: 'en' })
      expect(infoLogs[1].context).toEqual({ newLocale: 'en' })
    })
  })

  describe('Error Handling', () => {
    it('should throw error for invalid locale', async () => {
      // Create an invalid locale by bypassing type safety
      const invalidLocale = { code: 'invalid' } as any

      await expect(useCase.execute(invalidLocale)).rejects.toThrow()
    })

    it('should log error when locale change fails', async () => {
      // Create a mock that throws on setLocale
      const failingTranslator = new MockTranslator()
      failingTranslator.setLocale = async () => {
        throw new Error('Failed to set locale')
      }

      const failingUseCase = new ChangeLocaleUseCase(failingTranslator, mockLogger)
      const newLocale = Locale.fromCode('en')

      await expect(failingUseCase.execute(newLocale)).rejects.toThrow('Failed to set locale')

      const errorLogs = mockLogger.getLogsByLevel('error')
      expect(errorLogs).toHaveLength(1)
      expect(errorLogs[0].message).toContain('Failed to change locale')
    })
  })

  describe('Validation', () => {
    it('should validate locale is available', async () => {
      const validLocale = Locale.fromCode('en')
      await expect(useCase.execute(validLocale)).resolves.not.toThrow()
    })

    it('should check all available locales', async () => {
      const availableLocales = mockTranslator.getAvailableLocales()
      expect(availableLocales).toHaveLength(4)
      expect(availableLocales.map(l => l.code)).toEqual(['es', 'en', 'fr', 'de'])
    })
  })

  describe('Multiple Locale Changes', () => {
    it('should handle sequential locale changes', async () => {
      await useCase.execute(Locale.fromCode('en'))
      await useCase.execute(Locale.fromCode('fr'))
      await useCase.execute(Locale.fromCode('de'))

      expect(mockTranslator.calls.setLocale).toHaveLength(3)
      expect(mockTranslator.getCurrentLocale().code).toBe('de')
    })

    it('should allow changing back to default locale', async () => {
      await useCase.execute(Locale.fromCode('en'))
      await useCase.execute(Locale.default())

      expect(mockTranslator.getCurrentLocale().code).toBe('es')
    })
  })
})
