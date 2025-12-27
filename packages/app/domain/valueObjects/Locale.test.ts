/**
 * Locale Value Object Tests
 * Tests for the Locale domain entity
 */

import { describe, it, expect } from 'vitest'
import { Locale, LocaleCode } from '@/domain/valueObjects/Locale'

describe('Locale Value Object', () => {
  describe('Factory Methods', () => {
    it('should create a valid locale from code', () => {
      const locale = Locale.fromCode('es')
      expect(locale.code).toBe('es')
    })

    it('should create locale for each supported language', () => {
      const validCodes: LocaleCode[] = ['es', 'en', 'fr', 'de']
      
      validCodes.forEach(code => {
        const locale = Locale.fromCode(code)
        expect(locale.code).toBe(code)
      })
    })

    it('should throw error for invalid locale code', () => {
      expect(() => Locale.fromCode('invalid' as LocaleCode))
        .toThrow('Invalid locale code')
    })

    it('should create default locale', () => {
      const locale = Locale.default()
      expect(locale.code).toBe('es')
    })

    it('should return all available locales', () => {
      const locales = Locale.all()
      expect(locales).toHaveLength(4)
      expect(locales.map(l => l.code)).toEqual(['es', 'en', 'fr', 'de'])
    })
  })

  describe('Metadata', () => {
    it('should have correct Spanish metadata', () => {
      const locale = Locale.fromCode('es')
      expect(locale.name).toBe('Spanish')
      expect(locale.nativeName).toBe('Español')
      expect(locale.flag).toBe('🇪🇸')
      expect(locale.direction).toBe('ltr')
    })

    it('should have correct English metadata', () => {
      const locale = Locale.fromCode('en')
      expect(locale.name).toBe('English')
      expect(locale.nativeName).toBe('English')
      expect(locale.flag).toBe('🇺🇸')
      expect(locale.direction).toBe('ltr')
    })

    it('should have correct French metadata', () => {
      const locale = Locale.fromCode('fr')
      expect(locale.name).toBe('French')
      expect(locale.nativeName).toBe('Français')
      expect(locale.flag).toBe('🇫🇷')
      expect(locale.direction).toBe('ltr')
    })

    it('should have correct German metadata', () => {
      const locale = Locale.fromCode('de')
      expect(locale.name).toBe('German')
      expect(locale.nativeName).toBe('Deutsch')
      expect(locale.flag).toBe('🇩🇪')
      expect(locale.direction).toBe('ltr')
    })

    it('should return full metadata object', () => {
      const locale = Locale.fromCode('es')
      const metadata = locale.metadata
      
      expect(metadata).toHaveProperty('code', 'es')
      expect(metadata).toHaveProperty('name', 'Spanish')
      expect(metadata).toHaveProperty('nativeName', 'Español')
      expect(metadata).toHaveProperty('flag', '🇪🇸')
      expect(metadata).toHaveProperty('direction', 'ltr')
    })
  })

  describe('Validation', () => {
    it('should validate supported locale codes', () => {
      expect(Locale.isValid('es')).toBe(true)
      expect(Locale.isValid('en')).toBe(true)
      expect(Locale.isValid('fr')).toBe(true)
      expect(Locale.isValid('de')).toBe(true)
    })

    it('should reject invalid locale codes', () => {
      expect(Locale.isValid('pt')).toBe(false)
      expect(Locale.isValid('invalid')).toBe(false)
      expect(Locale.isValid('')).toBe(false)
    })
  })

  describe('Equality', () => {
    it('should be equal when codes match', () => {
      const locale1 = Locale.fromCode('es')
      const locale2 = Locale.fromCode('es')
      expect(locale1.equals(locale2)).toBe(true)
    })

    it('should not be equal when codes differ', () => {
      const locale1 = Locale.fromCode('es')
      const locale2 = Locale.fromCode('en')
      expect(locale1.equals(locale2)).toBe(false)
    })
  })

  describe('String Conversion', () => {
    it('should convert to string representation', () => {
      const locale = Locale.fromCode('es')
      expect(locale.toString()).toBe('es')
    })

    it('should have consistent string conversion for all locales', () => {
      const locales = Locale.all()
      locales.forEach(locale => {
        expect(locale.toString()).toBe(locale.code)
      })
    })
  })
})
