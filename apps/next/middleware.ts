import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from './middleware/sessionValidator'
import { generateNonce, getSecurityHeaders } from './lib/csp'

/**
 * Supported locales for the application
 * Must match the LocaleCode type in domain layer
 */
const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de'] as const
const DEFAULT_LOCALE = 'es'

type SupportedLocale = typeof SUPPORTED_LOCALES[number]

/**
 * Extracts the locale from the pathname
 * @param pathname - The URL pathname
 * @returns The locale if found, undefined otherwise
 */
function getLocaleFromPathname(pathname: string): SupportedLocale | undefined {
  const segments = pathname.split('/')
  const potentialLocale = segments[1]

  if (SUPPORTED_LOCALES.includes(potentialLocale as SupportedLocale)) {
    return potentialLocale as SupportedLocale
  }

  return undefined
}

/**
 * Detects the preferred locale from Accept-Language header
 * @param request - The Next.js request object
 * @returns The best matching locale or default locale
 */
function detectLocaleFromHeader(request: NextRequest): SupportedLocale {
  const acceptLanguage = request.headers.get('accept-language')

  if (!acceptLanguage) {
    return DEFAULT_LOCALE
  }

  // Parse Accept-Language header
  // Format: "en-US,en;q=0.9,es;q=0.8,fr;q=0.7"
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';')
      const quality = qValue ? parseFloat(qValue.split('=')[1]) : 1.0
      // Extract language code (e.g., "en" from "en-US")
      const code = locale.split('-')[0].toLowerCase()
      return { code, quality }
    })
    .sort((a, b) => b.quality - a.quality)

  // Find the first matching supported locale
  for (const { code } of languages) {
    if (SUPPORTED_LOCALES.includes(code as SupportedLocale)) {
      return code as SupportedLocale
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Checks if a path should be excluded from locale handling
 * @param pathname - The URL pathname
 * @returns true if the path should be excluded
 */
function shouldExcludePath(pathname: string): boolean {
  const excludedPaths = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/ads.txt',        // ads.txt must be served from root without locale prefix
    '/manifest.json',
    '/manifest.webmanifest',  // PWA manifest must be served from root
    '/sw.js',
  ]

  const excludedExtensions = [
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.webp',
    '.webmanifest',  // PWA manifest extension
    '.css',
    '.js',
    '.json',
  ]

  // Check if path starts with any excluded path
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    return true
  }

  // Check if path ends with any excluded extension
  if (excludedExtensions.some(ext => pathname.endsWith(ext))) {
    return true
  }

  return false
}

/**
 * Next.js Middleware for i18n routing and session validation
 * 
 * Responsibilities:
 * 1. Validate authenticated sessions for protected routes
 * 2. Detect locale from URL pathname
 * 3. If no locale found, detect from Accept-Language header or localStorage
 * 4. Redirect to URL with locale prefix: / -> /es/ or /en/
 * 5. Validate that locale in URL is supported
 * 6. Pass locale and user info to components via headers
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Skip middleware for static assets and API routes
  if (shouldExcludePath(pathname)) {
    return NextResponse.next()
  }

  // Generate CSP nonce for this request
  const nonce = generateNonce()

  // Get security headers including CSP
  const securityHeaders = getSecurityHeaders(nonce)

  // 1. FIRST: Validate session for protected routes
  const sessionValidationResult = await validateSession(request)
  if (sessionValidationResult) {
    // Session validation failed - redirect was returned
    return sessionValidationResult
  }

  // 2. SECOND: Handle i18n routing
  // Get locale from pathname
  const localeInPath = getLocaleFromPathname(pathname)

  // If locale is present and valid, continue
  if (localeInPath) {
    const response = NextResponse.next()
    // Add locale to response headers for server components
    response.headers.set('x-locale', localeInPath)
    // Add CSP nonce to response headers
    response.headers.set('x-nonce', nonce)
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // No locale in path - need to redirect

  // 1. Try to get locale from cookie (user preference)
  const cookieLocale = request.cookies.get('app-locale')?.value as SupportedLocale | undefined

  let detectedLocale: SupportedLocale

  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    detectedLocale = cookieLocale
  } else {
    // 2. Detect from Accept-Language header
    detectedLocale = detectLocaleFromHeader(request)
  }

  // Redirect to path with locale prefix
  const newUrl = new URL(`/${detectedLocale}${pathname}${search}`, request.url)

  const response = NextResponse.redirect(newUrl)

  // Set cookie to remember user's locale preference
  response.cookies.set('app-locale', detectedLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  })

  // Add CSP nonce to response headers
  response.headers.set('x-nonce', nonce)

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Middleware configuration
 * Define which paths should be processed by the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - .webmanifest files (PWA manifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|ico|css|js)$).*)',
  ],
}
