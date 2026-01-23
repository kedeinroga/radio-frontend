import { headers } from 'next/headers'
import { Locale } from '@radio-app/app'

/**
 * Get current locale in Server Components
 * 
 * This function reads the locale from the middleware-injected header.
 * Use this in Server Components, layouts, and generateMetadata functions.
 * 
 * @returns The current Locale value object
 * 
 * @example
 * ```tsx
 * // In a Server Component or Layout
 * export default async function Page() {
 *   const locale = await getServerLocale()
 *   return <div>Current locale: {locale.code}</div>
 * }
 * 
 * // In generateMetadata
 * export async function generateMetadata() {
 *   const locale = await getServerLocale()
 *   return {
 *     title: locale.code === 'es' ? 'Título' : 'Title'
 *   }
 * }
 * ```
 */
export async function getServerLocale(): Promise<Locale> {
  const headersList = await headers()
  const localeHeader = headersList.get('x-locale')
  
  if (localeHeader) {
    try {
      return Locale.fromString(localeHeader)
    } catch (error) {
      // Invalid locale, use default
    }
  }
  
  // Fallback to default
  return Locale.fromString('es')
}

/**
 * Get locale from URL params (for dynamic routes)
 * 
 * Use this in [locale] dynamic route segments.
 * 
 * @param params - The route params object
 * @returns The Locale value object
 * 
 * @example
 * ```tsx
 * // In app/[locale]/page.tsx
 * export default function Page({ params }: { params: { locale: string } }) {
 *   const locale = getLocaleFromParams(params)
 *   return <div>Locale: {locale.code}</div>
 * }
 * ```
 */
export function getLocaleFromParams(params: { locale?: string }): Locale {
  if (params.locale) {
    try {
      return Locale.fromString(params.locale)
    } catch (error) {
      // Invalid locale, use default
    }
  }
  
  // Fallback to default
  return Locale.fromString('es')
}

/**
 * Supported locales constant for use in static generation
 */
export const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de'] as const

/**
 * Generate static params for [locale] routes
 * 
 * Use this in any route with [locale] segment to enable static generation.
 * 
 * @example
 * ```tsx
 * // In app/[locale]/page.tsx
 * export function generateStaticParams() {
 *   return generateLocaleParams()
 * }
 * ```
 */
export function generateLocaleParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
  }))
}
