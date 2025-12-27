/**
 * Get Translation Use Case Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GetTranslationUseCase } from '@/application/useCases/i18n/GetTranslation'
import { MockTranslator, MockLogger } from '@/test/mocks'
import { Locale } from '@/domain/valueObjects/Locale'

describe('GetTranslationUseCase', () => {
  let useCase: GetTranslationUseCase
  let mockTranslator: MockTranslator
  let mockLogger: MockLogger

  beforeEach(() => {
    mockTranslator = new MockTranslator()
    mockLogger = new MockLogger()
    useCase = new GetTranslationUseCase(mockTranslator, mockLogger)
  })

  describe('Basic Translation', () => {
    it('should get translation for current locale', () => {
      const result = useCase.execute({ key: 'common.loading' })
      expect(result).toBe('Cargando')
    })

    it('should translate to English', () => {
      const result = useCase.execute({
        key: 'common.loading',
        locale: Locale.fromCode('en')
      })
      expect(result).toBe('Loading')
    })

    it('should translate to French', () => {
      const result = useCase.execute({
        key: 'common.loading',
        locale: Locale.fromCode('fr')
      })
      expect(result).toBe('Chargement')
    })

    it('should translate to German', () => {
      const result = useCase.execute({
        key: 'common.loading',
        locale: Locale.fromCode('de')
      })
      expect(result).toBe('Laden')
    })
  })

  describe('Interpolation', () => {
    it('should handle parameter interpolation', () => {
      const result = useCase.execute({
        key: 'greeting.hello',
        params: { name: 'John' }
      })
      expect(result).toBe('Hola John')
    })

    it('should interpolate in different locales', () => {
      const resultEn = useCase.execute({
        key: 'greeting.hello',
        locale: Locale.fromCode('en'),
        params: { name: 'John' }
      })
      expect(resultEn).toBe('Hello John')

      const resultFr = useCase.execute({
        key: 'greeting.hello',
        locale: Locale.fromCode('fr'),
        params: { name: 'John' }
      })
      expect(resultFr).toBe('Bonjour John')
    })

    it('should handle multiple parameters', () => {
      mockTranslator.addTranslation('es', 'test.multi', 'Usuario {{name}} tiene {{age}} años')
      
      const result = useCase.execute({
        key: 'test.multi',
        params: { name: 'Ana', age: 25 }
      })
      expect(result).toBe('Usuario Ana tiene 25 años')
    })
  })

  describe('Missing Translations', () => {
    it('should return key when translation not found', () => {
      const result = useCase.execute({ key: 'missing.key' })
      expect(result).toBe('missing.key')
    })

    it('should use default value when provided', () => {
      const result = useCase.execute({
        key: 'missing.key',
        defaultValue: 'Default Text'
      })
      expect(result).toBe('Default Text')
    })

    it('should log warning for missing translations', () => {
      useCase.execute({ key: 'missing.key' })
      
      const warnLogs = mockLogger.getLogsByLevel('warn')
      expect(warnLogs).toHaveLength(1)
      expect(warnLogs[0].message).toContain('Translation key not found')
    })
  })

  describe('Locale Switching', () => {
    it('should respect translator current locale', async () => {
      let result = useCase.execute({ key: 'common.loading' })
      expect(result).toBe('Cargando') // Spanish default

      await mockTranslator.setLocale(Locale.fromCode('en'))
      result = useCase.execute({ key: 'common.loading' })
      expect(result).toBe('Loading') // English

      await mockTranslator.setLocale(Locale.fromCode('fr'))
      result = useCase.execute({ key: 'common.loading' })
      expect(result).toBe('Chargement') // French
    })

    it('should override current locale when specified', async () => {
      await mockTranslator.setLocale(Locale.fromCode('en'))
      
      // Even though current is English, we request French
      const result = useCase.execute({
        key: 'common.loading',
        locale: Locale.fromCode('fr')
      })
      
      expect(result).toBe('Chargement')
    })
  })
})
