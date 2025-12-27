/**
 * ILocaleFormatter Port
 * Abstraction for locale-based formatting (dates, numbers, currency)
 * Allows different implementations (date-fns, Intl API, etc.)
 */

import { Locale } from '../../domain/valueObjects/Locale'

export type DateFormat = 
  | 'short'      // 1/1/24
  | 'medium'     // Jan 1, 2024
  | 'long'       // January 1, 2024
  | 'full'       // Monday, January 1, 2024
  | 'relative'   // 2 days ago
  | string       // Custom format pattern

export interface NumberFormatOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
}

export interface CurrencyFormatOptions extends NumberFormatOptions {
  currencyDisplay?: 'symbol' | 'code' | 'name'
}

export interface ILocaleFormatter {
  /**
   * Formats a date according to locale
   * @param date - Date to format
   * @param format - Format type or custom pattern
   * @param locale - Target locale
   * @returns Formatted date string
   */
  formatDate(date: Date | string, format: DateFormat, locale: Locale): string

  /**
   * Formats relative time (e.g., "2 hours ago", "in 3 days")
   * @param date - Date to format
   * @param locale - Target locale
   * @param baseDate - Optional base date (defaults to now)
   * @returns Relative time string
   */
  formatRelativeTime(date: Date | string, locale: Locale, baseDate?: Date): string

  /**
   * Formats a number according to locale
   * @param value - Number to format
   * @param locale - Target locale
   * @param options - Formatting options
   * @returns Formatted number string
   */
  formatNumber(value: number, locale: Locale, options?: NumberFormatOptions): string

  /**
   * Formats a percentage according to locale
   * @param value - Value to format (e.g., 0.45 for 45%)
   * @param locale - Target locale
   * @param options - Formatting options
   * @returns Formatted percentage string
   */
  formatPercent(value: number, locale: Locale, options?: NumberFormatOptions): string

  /**
   * Formats currency according to locale
   * @param amount - Amount to format
   * @param currency - Currency code (ISO 4217, e.g., 'USD', 'EUR')
   * @param locale - Target locale
   * @param options - Formatting options
   * @returns Formatted currency string
   */
  formatCurrency(
    amount: number, 
    currency: string, 
    locale: Locale, 
    options?: CurrencyFormatOptions
  ): string

  /**
   * Formats a time duration (e.g., "2:34:56")
   * @param seconds - Duration in seconds
   * @param locale - Target locale
   * @returns Formatted duration string
   */
  formatDuration(seconds: number, locale: Locale): string

  /**
   * Formats a file size (e.g., "1.5 MB")
   * @param bytes - Size in bytes
   * @param locale - Target locale
   * @returns Formatted size string
   */
  formatFileSize(bytes: number, locale: Locale): string

  /**
   * Gets the date/time format pattern for a locale
   * Useful for displaying format hints to users
   * @param locale - Target locale
   * @param format - Format type
   * @returns Format pattern (e.g., "MM/DD/YYYY")
   */
  getDateFormatPattern(locale: Locale, format: DateFormat): string

  /**
   * Gets the decimal separator for a locale
   * @param locale - Target locale
   * @returns Decimal separator character
   */
  getDecimalSeparator(locale: Locale): string

  /**
   * Gets the thousands separator for a locale
   * @param locale - Target locale
   * @returns Thousands separator character
   */
  getThousandsSeparator(locale: Locale): string
}
