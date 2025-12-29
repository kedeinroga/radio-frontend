import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitStore>()

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  keyPrefix?: string
}

/**
 * Rate Limiting Middleware for API Routes
 * 
 * @param request - Next.js request object
 * @param options - Rate limiting configuration
 * @returns null if allowed, NextResponse with 429 if rate limited
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const { maxRequests, windowMs, keyPrefix = 'global' } = options
  
  // Get client identifier (IP address or user ID from cookie)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip')
    || 'unknown'
  
  const userId = request.cookies.get('@radio-app:user_id')?.value || ''
  const identifier = userId || ip
  
  const key = `${keyPrefix}:${identifier}`
  const now = Date.now()
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, entry)
    return null // Allow request
  }
  
  // Increment count
  entry.count++
  
  if (entry.count > maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    return NextResponse.json(
      { 
        error: { 
          code: 'rate_limit_exceeded', 
          message: 'Too many requests, please try again later',
          retry_after: retryAfter,
        } 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString(),
        }
      }
    )
  }
  
  // Update entry
  rateLimitStore.set(key, entry)
  
  // Add rate limit headers to response (will be added by the route handler)
  return null // Allow request
}

/**
 * Get rate limit headers for a successful request
 */
export function getRateLimitHeaders(
  request: NextRequest,
  options: RateLimitOptions
): Record<string, string> {
  const { maxRequests, keyPrefix = 'global' } = options
  
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip')
    || 'unknown'
  
  const userId = request.cookies.get('@radio-app:user_id')?.value || ''
  const identifier = userId || ip
  const key = `${keyPrefix}:${identifier}`
  
  const entry = rateLimitStore.get(key)
  
  if (!entry) {
    return {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': maxRequests.toString(),
    }
  }
  
  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count).toString(),
    'X-RateLimit-Reset': entry.resetTime.toString(),
  }
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Strict rate limit for authentication endpoints
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'auth',
  },
  
  // Moderate rate limit for refresh token
  REFRESH: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'refresh',
  },
  
  // Lenient rate limit for general API endpoints
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'api',
  },
  
  // Very strict for admin endpoints
  ADMIN: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'admin',
  },
}
