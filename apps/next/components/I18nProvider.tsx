'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  Locale,
  ITranslator,
  ILocaleFormatter,
  NextIntlAdapter,
  LocaleFormatter,
  setApiLocale,
} from '@radio-app/app'

/**
 * I18n Context Type
 * Provides translation and formatting services via Clean Architecture ports
 */
interface I18nContextType {
  locale: Locale
  translator: ITranslator
  formatter: ILocaleFormatter
  changeLocale: (newLocale: Locale) => Promise<void>
  isLoading: boolean
}

/**
 * I18n Context
 * Context for accessing i18n services throughout the app
 */
const I18nContext = createContext<I18nContextType | undefined>(undefined)

/**
 * I18n Provider Props
 */
interface I18nProviderProps {
  children: React.ReactNode
  initialLocaleCode?: string
  initialTranslations?: Record<string, any>
}

/**
 * I18n Provider Component
 * 
 * Implements Dependency Injection for i18n services following Clean Architecture.
 * Provides translator and formatter adapters to the React component tree.
 * 
 * @example
 * ```tsx
 * <I18nProvider initialLocaleCode="es" initialTranslations={translations}>
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({ children, initialLocaleCode, initialTranslations }: I18nProviderProps) {
  // Initialize with default locale if not provided
  const defaultLocale = initialLocaleCode 
    ? Locale.fromString(initialLocaleCode)
    : Locale.fromString('es')
  
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [isLoading, setIsLoading] = useState(false) // Changed to false since we have initial translations

  // Dependency Injection: Create adapters (infrastructure layer)
  const [translator] = useState<ITranslator>(() => {
    const adapter = new NextIntlAdapter(defaultLocale, undefined, initialTranslations)
    return adapter
  })
  const [formatter] = useState<ILocaleFormatter>(() => new LocaleFormatter())

  /**
   * Load translations for current locale
   */
  const loadTranslations = useCallback(async (newLocale: Locale) => {
    try {
      setIsLoading(true)
      
      // Load translation file using the adapter
      await translator.loadTranslations(newLocale)
      
      // Sync locale with API client for Accept-Language header
      setApiLocale(newLocale)
      
      // Store locale preference in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('app-locale', newLocale.code)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load translations:', error)
      setIsLoading(false)
    }
  }, [translator])

  /**
   * Change locale (Use Case pattern)
   */
  const changeLocale = useCallback(async (newLocale: Locale) => {
    if (newLocale.code === locale.code) {
      return // Already using this locale
    }

    setLocale(newLocale)
    await loadTranslations(newLocale)
  }, [locale, loadTranslations])

  /**
   * Initialize: Load translations on mount
   */
  useEffect(() => {
    // Ensure we have a valid locale before loading
    if (locale && locale.code) {
      loadTranslations(locale)
    } else {
      console.warn('Locale is invalid on mount, using default')
      const fallbackLocale = Locale.fromString('es')
      setLocale(fallbackLocale)
      loadTranslations(fallbackLocale)
    }
  }, []) // Only on mount, locale is stable from useState

  const contextValue: I18nContextType = {
    locale,
    translator,
    formatter,
    changeLocale,
    isLoading,
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * useI18n Hook
 * 
 * Access i18n context from any component.
 * Provides translator, formatter, and locale management.
 * 
 * @throws Error if used outside I18nProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { translator, locale, changeLocale } = useI18n()
 *   const title = translator.translate('common.loading')
 *   
 *   return <h1>{title}</h1>
 * }
 * ```
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  
  return context
}

/**
 * useTranslation Hook
 * 
 * Simplified hook that returns translate function and locale.
 * Follows the common pattern from i18n libraries.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale } = useTranslation()
 *   
 *   return <h1>{t('app.title')}</h1>
 * }
 * ```
 */
export function useTranslation() {
  const { translator, locale } = useI18n()
  
  const t = useCallback((key: string, params?: Record<string, any>) => {
    return translator.translate(key, params ? { params } : undefined)
  }, [translator])
  
  return { t, locale }
}

/**
 * useFormatter Hook
 * 
 * Simplified hook that returns formatting functions.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { formatDate, formatNumber } = useFormatter()
 *   
 *   return (
 *     <div>
 *       <p>{formatDate(new Date(), 'long')}</p>
 *       <p>{formatNumber(1234567.89)}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useFormatter() {
  const { formatter, locale } = useI18n()
  
  return {
    locale,
    formatDate: formatter.formatDate.bind(formatter),
    formatNumber: formatter.formatNumber.bind(formatter),
    formatPercent: formatter.formatPercent.bind(formatter),
    formatCurrency: formatter.formatCurrency.bind(formatter),
    formatRelativeTime: formatter.formatRelativeTime.bind(formatter),
  }
}
