import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple JWT decoder for server-side middleware
 * Does NOT validate signature - only reads public claims
 */
function decodeJWTServer(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * Checks if token is expired
 */
function isTokenExpiredServer(token: string): boolean {
  const payload = decodeJWTServer(token)
  if (!payload || !payload.exp) return true
  
  const expirationTime = payload.exp * 1000
  return Date.now() >= expirationTime
}

/**
 * Protected routes configuration
 */
const PROTECTED_ROUTES = [
  '/admin',
  '/admin/analytics',
  '/admin/translations',
  '/admin/seo',
]

const ADMIN_ONLY_ROUTES = [
  '/admin',
  '/admin/analytics',
  '/admin/translations',
  '/admin/seo',
]

/**
 * Checks if a path is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  // Remove locale prefix if present
  const pathWithoutLocale = pathname.replace(/^\/(es|en|fr|de)/, '')
  
  return PROTECTED_ROUTES.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  )
}

/**
 * Checks if a path requires admin access
 */
export function isAdminRoute(pathname: string): boolean {
  // Remove locale prefix if present
  const pathWithoutLocale = pathname.replace(/^\/(es|en|fr|de)/, '')
  
  return ADMIN_ONLY_ROUTES.some(route => 
    pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  )
}

/**
 * Gets the login redirect URL for a given locale
 */
function getLoginUrl(request: NextRequest, locale: string = 'es'): URL {
  return new URL(`/${locale}/admin/login`, request.url)
}

/**
 * Session validation middleware for Next.js
 * 
 * This middleware:
 * 1. Checks if the route requires authentication
 * 2. Validates the access token from cookies
 * 3. Checks token expiration
 * 4. Validates user role for admin routes
 * 5. Redirects to login if validation fails
 * 
 * @param request - The Next.js request
 * @returns Response or null if validation passed
 */
export async function validateSession(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  
  // Skip validation for login page
  if (pathname.includes('/admin/login')) {
    return null
  }

  // Check if route is protected
  if (!isProtectedRoute(pathname)) {
    return null
  }

  // Get access token from cookies
  const accessToken = request.cookies.get('@radio-app:access_token')?.value
  
  if (!accessToken) {
    // Detect locale from pathname or cookie
    const localeMatch = pathname.match(/^\/(es|en|fr|de)/)
    const locale = localeMatch ? localeMatch[1] : 'es'
    
    return NextResponse.redirect(getLoginUrl(request, locale))
  }

  // Validate token format
  const payload = decodeJWTServer(accessToken)
  if (!payload) {
    const localeMatch = pathname.match(/^\/(es|en|fr|de)/)
    const locale = localeMatch ? localeMatch[1] : 'es'
    
    return NextResponse.redirect(getLoginUrl(request, locale))
  }

  // Check if token is expired
  if (isTokenExpiredServer(accessToken)) {
    const localeMatch = pathname.match(/^\/(es|en|fr|de)/)
    const locale = localeMatch ? localeMatch[1] : 'es'
    
    return NextResponse.redirect(getLoginUrl(request, locale))
  }

  // Check role for admin routes
  if (isAdminRoute(pathname)) {
    const userRole = payload.role
    
    if (userRole !== 'admin') {
      const localeMatch = pathname.match(/^\/(es|en|fr|de)/)
      const locale = localeMatch ? localeMatch[1] : 'es'
      
      // Redirect to home page with error
      const homeUrl = new URL(`/${locale}`, request.url)
      homeUrl.searchParams.set('error', 'unauthorized')
      
      return NextResponse.redirect(homeUrl)
    }
  }

  // Add user info to headers for server components
  const response = NextResponse.next()
  response.headers.set('x-user-id', payload.sub || '')
  response.headers.set('x-user-role', payload.role || 'guest')
  response.headers.set('x-user-email', payload.email || '')
  
  return null // Validation passed, continue
}
