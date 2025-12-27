/**
 * useAppFormatter Hook
 * 
 * Application-specific formatting hook that wraps the i18n infrastructure.
 * Provides locale-aware formatting for dates, numbers, currency, and more.
 * 
 * This hook abstracts the underlying formatting implementation, following Clean Architecture
 * principles by depending on abstractions rather than concrete implementations.
 */

'use client'

import { useFormatter as useI18nFormatter } from '@/components/I18nProvider'

/**
 * Date format options
 */
export type DateFormatType = 'short' | 'medium' | 'long' | 'full'

/**
 * Hook return type
 */
interface UseAppFormatterReturn {
  /**
   * Current locale code (es, en, fr, de)
   */
  locale: string
  
  /**
   * Format a date according to locale
   * @param date - Date to format
   * @param format - Format type or custom pattern
   * @param timeZone - Optional timezone (default: system)
   */
  formatDate: (date: Date, format?: DateFormatType | string, timeZone?: string) => string
  
  /**
   * Format a number according to locale
   * @param value - Number to format
   * @param options - Optional Intl.NumberFormat options
   */
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  
  /**
   * Format a percentage according to locale
   * @param value - Number to format (0.75 = 75%)
   * @param decimals - Number of decimal places (default: 0)
   */
  formatPercent: (value: number, decimals?: number) => string
  
  /**
   * Format currency according to locale
   * @param value - Amount to format
   * @param currency - Currency code (USD, EUR, etc.)
   */
  formatCurrency: (value: number, currency: string) => string
  
  /**
   * Format relative time (e.g., "2 hours ago")
   * @param date - Date to compare with now
   * @param baseDate - Optional base date (default: now)
   */
  formatRelativeTime: (date: Date, baseDate?: Date) => string
}

/**
 * App Formatter Hook
 * 
 * Use this hook in client components to format dates, numbers, and currency
 * according to the user's locale.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { formatDate, formatNumber, formatCurrency } = useAppFormatter()
 *   
 *   return (
 *     <div>
 *       <p>Date: {formatDate(new Date(), 'long')}</p>
 *       <p>Listeners: {formatNumber(1234567)}</p>
 *       <p>Price: {formatCurrency(29.99, 'USD')}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAppFormatter(): UseAppFormatterReturn {
  const {
    locale,
    formatDate: _formatDate,
    formatNumber: _formatNumber,
    formatPercent: _formatPercent,
    formatCurrency: _formatCurrency,
    formatRelativeTime: _formatRelativeTime,
  } = useI18nFormatter()

  // Wrap formatters to match the app interface (locale is already bound)
  const formatDate = (date: Date, format?: DateFormatType | string, _timeZone?: string): string => {
    return _formatDate(date, format || 'medium', locale)
  }

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    return _formatNumber(value, locale, options as any)
  }

  const formatPercent = (value: number, decimals: number = 0): string => {
    return _formatPercent(value, locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const formatCurrency = (value: number, currency: string): string => {
    return _formatCurrency(value, currency, locale)
  }

  const formatRelativeTime = (date: Date, baseDate?: Date): string => {
    return _formatRelativeTime(date, locale, baseDate)
  }

  return {
    locale: locale.code,
    formatDate,
    formatNumber,
    formatPercent,
    formatCurrency,
    formatRelativeTime,
  }
}

/**
 * Helper to format compact numbers (1.2K, 3.4M, etc.)
 * 
 * @example
 * ```tsx
 * formatCompactNumber(1234, 'es') // "1,2 mil"
 * formatCompactNumber(1234567, 'en') // "1.2M"
 * ```
 */
export function formatCompactNumber(value: number, locale: string): string {
  if (value < 1000) {
    return value.toString()
  }

  const formatter = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  })

  return formatter.format(value)
}

/**
 * Helper to format duration in minutes/hours
 * 
 * @example
 * ```tsx
 * const { t } = useAppTranslation()
 * formatDuration(90, t) // "1 hora 30 minutos"
 * formatDuration(45, t) // "45 minutos"
 * ```
 */
export function formatDuration(
  minutes: number,
  t: (key: string, params?: Record<string, any>) => string
): string {
  if (minutes < 60) {
    return t('time.minutesAgo', { count: minutes })
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return t('time.hoursAgo', { count: hours })
  }

  return `${hours}h ${remainingMinutes}m`
}

/**
 * Helper to format file size
 * 
 * @example
 * ```tsx
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 * ```
 */
export function formatFileSize(bytes: number, locale: string = 'en'): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 2,
  })

  return `${formatter.format(size)} ${units[unitIndex]}`
}

/**
 * Helper to format bitrate (for audio streams)
 * 
 * @example
 * ```tsx
 * formatBitrate(128) // "128 kbps"
 * formatBitrate(320) // "320 kbps"
 * ```
 */
export function formatBitrate(kbps: number): string {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`
  }
  return `${kbps} kbps`
}

/**
 * Helper to format list of items according to locale
 * 
 * @example
 * ```tsx
 * formatList(['Rock', 'Pop', 'Jazz'], 'en') // "Rock, Pop, and Jazz"
 * formatList(['Rock', 'Pop', 'Jazz'], 'es') // "Rock, Pop y Jazz"
 * ```
 */
export function formatList(items: string[], locale: string, type: 'conjunction' | 'disjunction' = 'conjunction'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]

  const formatter = new Intl.ListFormat(locale, { 
    style: 'long', 
    type 
  })

  return formatter.format(items)
}
