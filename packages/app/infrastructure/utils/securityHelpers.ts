/**
 * Security Helper Functions
 * Utilities for common security operations
 */

/**
 * Validates that a URL is safe for internal redirects
 * Prevents open redirect vulnerabilities
 * 
 * @param url - The URL to validate
 * @returns true if the URL is safe for internal redirect
 */
export function isSafeInternalRedirect(url: string): boolean {
  try {
    // Allow relative paths
    if (url.startsWith('/')) {
      // Ensure it doesn't start with // (protocol-relative URL)
      if (url.startsWith('//')) {
        return false
      }
      return true
    }

    // Parse absolute URLs
    const parsedUrl = new URL(url, window.location.origin)
    
    // Only allow same-origin URLs
    return parsedUrl.origin === window.location.origin
  } catch {
    // Invalid URL
    return false
  }
}

/**
 * Safely redirects to an internal URL
 * Validates the URL before redirecting
 * 
 * @param url - The URL to redirect to
 * @param fallbackUrl - Fallback URL if validation fails (default: '/')
 */
export function safeRedirect(url: string, fallbackUrl: string = '/'): void {
  if (typeof window === 'undefined') return

  const targetUrl = isSafeInternalRedirect(url) ? url : fallbackUrl
  window.location.href = targetUrl
}

/**
 * Sanitizes error messages to prevent information leakage
 * Filters out sensitive technical details while keeping user-friendly messages
 * 
 * @param error - The error object or message
 * @param fallbackMessage - Default message if error is too technical
 * @returns User-safe error message
 */
export function sanitizeErrorMessage(
  error: any,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
): string {
  if (!error) return fallbackMessage

  const errorMessage = typeof error === 'string' ? error : error.message || ''

  // List of safe error patterns that can be shown to users
  const safePatterns = [
    /invalid.*credentials?/i,
    /incorrect.*password/i,
    /email.*not.*found/i,
    /user.*not.*found/i,
    /account.*locked/i,
    /too.*many.*attempts/i,
    /expired.*token/i,
    /session.*expired/i,
    /unauthorized/i,
    /access.*denied/i,
    /permission.*denied/i,
    /invalid.*email/i,
    /password.*required/i,
    /field.*required/i,
    /network.*error/i,
    /connection.*failed/i,
    /timeout/i,
  ]

  // Check if error matches safe patterns
  const isSafeMessage = safePatterns.some(pattern => pattern.test(errorMessage))

  if (isSafeMessage) {
    // Return first sentence only to avoid stack traces
    return errorMessage.split('.')[0] + '.'
  }

  // Filter out technical details
  const technicalPatterns = [
    /stack trace/i,
    /at\s+\w+\s+\(/i,
    /node_modules/i,
    /webpack/i,
    /axios/i,
    /fetch/i,
    /error:\s*\d{3}/i,
  ]

  const hasTechnicalDetails = technicalPatterns.some(pattern => pattern.test(errorMessage))

  if (hasTechnicalDetails) {
    return fallbackMessage
  }

  // Return truncated message (max 150 chars)
  return errorMessage.substring(0, 150)
}

/**
 * Validates email format with comprehensive regex
 * 
 * @param email - Email address to validate
 * @returns true if email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validates password strength
 * 
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  message?: string
} {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' }
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password is too long' }
  }

  // Check for at least one uppercase, one lowercase, and one number
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain uppercase, lowercase, and numbers',
    }
  }

  return { isValid: true }
}

/**
 * Generates a secure random string for CSRF tokens
 * 
 * @param length - Length of the token (default: 32)
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof window === 'undefined' || !window.crypto) {
    // Fallback for non-browser environments
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
