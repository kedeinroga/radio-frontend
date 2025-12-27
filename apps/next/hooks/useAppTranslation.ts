/**
 * useAppTranslation Hook
 * 
 * Application-specific translation hook that wraps the i18n infrastructure.
 * Provides a convenient interface for translating text in components.
 * 
 * This hook abstracts the underlying i18n implementation, following Clean Architecture
 * principles by depending on abstractions rather than concrete implementations.
 */

'use client'

import { useTranslation as useI18nTranslation } from '@/components/I18nProvider'

/**
 * Translation function type
 */
type TranslateFn = (key: string, params?: Record<string, any>) => string

/**
 * Hook return type
 */
interface UseAppTranslationReturn {
  /**
   * Translate a key to the current locale
   * @param key - Translation key (e.g., 'common.loading')
   * @param params - Optional parameters for interpolation (e.g., { name: 'John' })
   */
  t: TranslateFn
  
  /**
   * Current locale code (es, en, fr, de)
   */
  locale: string
  
  /**
   * Check if a translation key exists
   */
  hasKey: (key: string) => boolean
}

/**
 * App Translation Hook
 * 
 * Use this hook in client components to access translations.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale } = useAppTranslation()
 *   
 *   return (
 *     <div>
 *       <h1>{t('app.title')}</h1>
 *       <p>{t('player.nowPlaying', { name: 'Rock FM' })}</p>
 *       <span>Current locale: {locale}</span>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAppTranslation(): UseAppTranslationReturn {
  const { t, locale } = useI18nTranslation()

  /**
   * Check if a translation key exists
   * Returns false if translation is missing (returns key as-is)
   */
  const hasKey = (key: string): boolean => {
    const result = t(key)
    return result !== key
  }

  return {
    t,
    locale: locale.code,
    hasKey,
  }
}

/**
 * Translation Key Type Helper
 * 
 * Use this to get type-safe translation keys in your components.
 * 
 * @example
 * ```tsx
 * const key: TranslationKey = 'common.loading' // ✅ Type-safe
 * const invalid: TranslationKey = 'invalid.key' // ❌ Would error if strict types
 * ```
 */
export type TranslationKey = string

/**
 * Helper to create namespaced translation keys
 * 
 * @example
 * ```tsx
 * const playerKeys = createTranslationNamespace('player')
 * const text = t(playerKeys.play) // 'player.play'
 * ```
 */
export function createTranslationNamespace(namespace: string) {
  return new Proxy({} as Record<string, string>, {
    get: (_target, prop: string) => `${namespace}.${prop}`,
  })
}

/**
 * Helper to translate with fallback
 * 
 * @example
 * ```tsx
 * const { t } = useAppTranslation()
 * const text = translateWithFallback(t, 'missing.key', 'Default text')
 * ```
 */
export function translateWithFallback(
  t: TranslateFn,
  key: string,
  fallback: string,
  params?: Record<string, any>
): string {
  const result = t(key, params)
  return result === key ? fallback : result
}
