/**
 * JWT Validation Library
 * 
 * Uses backend /auth/validate endpoint to validate RS256 tokens
 * This is more secure than validating signatures in the frontend
 * as it keeps the private key secure and validates against the backend's state
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// Simple in-memory cache to avoid excessive backend calls
// Cache validation results for 30 seconds
interface ValidationCache {
  [token: string]: {
    isValid: boolean
    payload: any
    timestamp: number
  }
}

const validationCache: ValidationCache = {}
const CACHE_TTL = 30 * 1000 // 30 seconds

/**
 * Verify JWT token by calling backend /auth/validate
 * This validates:
 * - RS256 signature
 * - Expiration time
 * - Token revocation status
 * - Claims validity
 */
export async function verifyJWT(token: string): Promise<any | null> {
  try {
    // Check cache first
    const cached = validationCache[token]
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.isValid ? cached.payload : null
    }

    // Call backend to validate token
    const response = await fetch(`${BACKEND_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      // Token is invalid
      validationCache[token] = {
        isValid: false,
        payload: null,
        timestamp: Date.now(),
      }
      return null
    }

    const data = await response.json()

    // Backend returns validation result
    if (data.valid) {
      // Cache the validation result
      validationCache[token] = {
        isValid: true,
        payload: data.claims || data,
        timestamp: Date.now(),
      }
      return data.claims || data
    }

    // Token is not valid
    validationCache[token] = {
      isValid: false,
      payload: null,
      timestamp: Date.now(),
    }
    return null
  } catch (error) {
    console.error('JWT validation error:', error)
    // On error, consider token invalid
    return null
  }
}

/**
 * Decode JWT without verification (for debugging only)
 * DO NOT use this for security decisions
 */
export function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode payload (middle part)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    )
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Check if JWT is expired based on 'exp' claim
 * This is a quick check without backend validation
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return true
  }

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now()
}

/**
 * Extract user role from JWT payload
 */
export function getTokenRole(token: string): string | null {
  const payload = decodeJWT(token)
  if (!payload) {
    return null
  }

  // Backend may return role in different claim names
  return payload.role || payload.user_type || null
}

/**
 * Clear validation cache (useful after logout)
 */
export function clearValidationCache() {
  Object.keys(validationCache).forEach(key => {
    delete validationCache[key]
  })
}
