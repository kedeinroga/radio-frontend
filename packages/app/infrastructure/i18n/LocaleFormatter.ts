/**
 * Locale Formatter Implementation
 * Implements ILocaleFormatter using date-fns and Intl APIs
 */

import { format, formatDistance, formatDistanceToNow } from 'date-fns'
import { es, enUS, fr, de } from 'date-fns/locale'
import { ILocaleFormatter, DateFormat, NumberFormatOptions, CurrencyFormatOptions } from '../../application/ports/ILocaleFormatter'
import { Locale } from '../../domain/valueObjects/Locale'

export class LocaleFormatter implements ILocaleFormatter {
  private readonly dateFnsLocaleMap = {
    es: es,
    en: enUS,
    fr: fr,
    de: de
  }

  private readonly dateFormatPatterns: Record<string, Record<string, string>> = {
    short: { es: 'd/M/yy', en: 'M/d/yy', fr: 'd/M/yy', de: 'd.M.yy' },
    medium: { es: 'd MMM yyyy', en: 'MMM d, yyyy', fr: 'd MMM yyyy', de: 'd. MMM yyyy' },
    long: { es: "d 'de' MMMM 'de' yyyy", en: 'MMMM d, yyyy', fr: 'd MMMM yyyy', de: 'd. MMMM yyyy' },
    full: { es: "EEEE, d 'de' MMMM 'de' yyyy", en: 'EEEE, MMMM d, yyyy', fr: 'EEEE d MMMM yyyy', de: 'EEEE, d. MMMM yyyy' }
  }

  formatDate(date: Date | string, formatType: DateFormat, locale: Locale): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date: ${date}`)
    }

    const dateFnsLocale = this.dateFnsLocaleMap[locale.code]

    // Handle relative format separately
    if (formatType === 'relative') {
      return this.formatRelativeTime(dateObj, locale)
    }

    // Use predefined patterns or custom format string
    const formatPattern = this.dateFormatPatterns[formatType]?.[locale.code] || formatType

    try {
      return format(dateObj, formatPattern, { locale: dateFnsLocale })
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateObj.toLocaleDateString(locale.code)
    }
  }

  formatRelativeTime(date: Date | string, locale: Locale, baseDate?: Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date: ${date}`)
    }

    const dateFnsLocale = this.dateFnsLocaleMap[locale.code]
    
    try {
      if (baseDate) {
        return formatDistance(dateObj, baseDate, {
          addSuffix: true,
          locale: dateFnsLocale
        })
      }
      
      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: dateFnsLocale
      })
    } catch (error) {
      console.error('Error formatting relative time:', error)
      return dateObj.toLocaleString(locale.code)
    }
  }

  formatNumber(value: number, locale: Locale, options?: NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(locale.code, {
        minimumFractionDigits: options?.minimumFractionDigits,
        maximumFractionDigits: options?.maximumFractionDigits,
        useGrouping: options?.useGrouping !== false
      }).format(value)
    } catch (error) {
      console.error('Error formatting number:', error)
      return value.toString()
    }
  }

  formatPercent(value: number, locale: Locale, options?: NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(locale.code, {
        style: 'percent',
        minimumFractionDigits: options?.minimumFractionDigits ?? 0,
        maximumFractionDigits: options?.maximumFractionDigits ?? 2
      }).format(value)
    } catch (error) {
      console.error('Error formatting percent:', error)
      return `${(value * 100).toFixed(2)}%`
    }
  }

  formatCurrency(
    amount: number,
    currency: string,
    locale: Locale,
    options?: CurrencyFormatOptions
  ): string {
    try {
      return new Intl.NumberFormat(locale.code, {
        style: 'currency',
        currency,
        currencyDisplay: options?.currencyDisplay || 'symbol',
        minimumFractionDigits: options?.minimumFractionDigits ?? 2,
        maximumFractionDigits: options?.maximumFractionDigits ?? 2
      }).format(amount)
    } catch (error) {
      console.error('Error formatting currency:', error)
      return `${currency} ${amount.toFixed(2)}`
    }
  }

  formatDuration(seconds: number, _locale: Locale): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  formatFileSize(bytes: number, locale: Locale): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    const formattedSize = this.formatNumber(size, locale, {
      minimumFractionDigits: unitIndex === 0 ? 0 : 1,
      maximumFractionDigits: unitIndex === 0 ? 0 : 2
    })

    return `${formattedSize} ${units[unitIndex]}`
  }

  getDateFormatPattern(locale: Locale, formatType: DateFormat): string {
    return this.dateFormatPatterns[formatType]?.[locale.code] || formatType
  }

  getDecimalSeparator(locale: Locale): string {
    const formatted = new Intl.NumberFormat(locale.code).format(1.1)
    return formatted.charAt(1) // Get character between 1 and 1
  }

  getThousandsSeparator(locale: Locale): string {
    const formatted = new Intl.NumberFormat(locale.code).format(1000)
    return formatted.charAt(1) // Get character between 1 and 000
  }
}
