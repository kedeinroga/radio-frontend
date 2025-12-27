/**
 * JWT Helper Functions
 * Utilities for decoding and validating JWT tokens client-side
 */

export interface JWTPayload {
  sub: string // User ID
  exp: number // Expiration time (Unix timestamp)
  iat: number // Issued at (Unix timestamp)
  jti: string // JWT ID
  email: string
  role: 'admin' | 'user' | 'guest'
  session_id?: string
  iss?: string // Issuer
}

/**
 * Decodes a JWT token without validating the signature
 * WARNING: Only use for reading public claims, never trust without backend validation
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode the payload (second part)
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    
    return JSON.parse(decoded) as JWTPayload
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Checks if a JWT token is expired based on the exp claim
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return true // Consider invalid tokens as expired
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()
  
  return currentTime >= expirationTime
}

/**
 * Gets the expiration time of a token in milliseconds
 */
export function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return null
  }

  return payload.exp * 1000
}

/**
 * Gets the time remaining until token expiration in milliseconds
 */
export function getTimeUntilExpiration(token: string): number | null {
  const expirationTime = getTokenExpiration(token)
  if (!expirationTime) {
    return null
  }

  const remaining = expirationTime - Date.now()
  return remaining > 0 ? remaining : 0
}

/**
 * Checks if a token will expire within the specified minutes
 */
export function willExpireSoon(token: string, withinMinutes: number = 5): boolean {
  const remaining = getTimeUntilExpiration(token)
  if (remaining === null) {
    return true
  }

  const threshold = withinMinutes * 60 * 1000 // Convert minutes to milliseconds
  return remaining <= threshold
}

/**
 * Extracts the user role from a JWT token
 */
export function getTokenRole(token: string): 'admin' | 'user' | 'guest' | null {
  const payload = decodeJWT(token)
  return payload?.role || null
}

/**
 * Extracts the user ID from a JWT token
 */
export function getTokenUserId(token: string): string | null {
  const payload = decodeJWT(token)
  return payload?.sub || null
}

/**
 * Extracts the JWT ID (jti) from a token
 */
export function getTokenId(token: string): string | null {
  const payload = decodeJWT(token)
  return payload?.jti || null
}

/**
 * Extracts the session ID from a token
 */
export function getSessionId(token: string): string | null {
  const payload = decodeJWT(token)
  return payload?.session_id || null
}

/**
 * Validates the basic structure of a JWT token
 */
export function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  // Check that each part is base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/
  return parts.every(part => base64UrlRegex.test(part))
}

/**
 * Checks if a token is valid (not expired and well-formed)
 * NOTE: This does NOT verify the signature - always validate with backend
 */
export function isTokenValid(token: string): boolean {
  if (!isValidJWTFormat(token)) {
    return false
  }

  return !isTokenExpired(token)
}
