/**
 * Content Security Policy (CSP) Configuration
 * 
 * Implementa CSP headers para prevenir:
 * - XSS attacks
 * - Data injection attacks
 * - Clickjacking
 * - Code injection
 * - Unauthorized resource loading
 * 
 * Note: Uses Web Crypto API for Edge Runtime compatibility
 */

/**
 * Environment detection
 */
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

/**
 * Generate cryptographic nonce for inline scripts
 * 
 * Uses Web Crypto API for Edge Runtime compatibility.
 * Falls back to simple random for SSR contexts where crypto is unavailable.
 */
export function generateNonce(): string {
  // Edge Runtime: Use Web Crypto API
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    const array = new Uint8Array(16)
    globalThis.crypto.getRandomValues(array)

    // Convert to base64 without Buffer (Edge Runtime compatible)
    let binary = ''
    for (let i = 0; i < array.length; i++) {
      binary += String.fromCharCode(array[i])
    }

    // Base64 encode using btoa (available in Edge Runtime)
    return btoa(binary)
  }

  // Fallback for build time (should never be used at runtime)
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Trusted domains for external resources
 */
export const TRUSTED_DOMAINS = {
  // Self
  self: "'self'",

  // Stripe (payments)
  stripe: [
    'https://js.stripe.com',
    'https://checkout.stripe.com',
    'https://m.stripe.com',
    'https://q.stripe.com', // Analytics
  ],

  // Analytics & Monitoring
  analytics: [
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://www.googletagmanager.com',
    'https://*.vercel-insights.com',
    'https://*.vercel-analytics.com',
  ],

  // Google AdSense
  adSense: [
    'https://pagead2.googlesyndication.com',
    'https://*.google.com',
    'https://*.doubleclick.net',
    'https://googleads.g.doubleclick.net',
    'https://adservice.google.com',
    'https://partner.googleadservices.com',
    'https://tpc.googlesyndication.com',
    'https://ep1.adtrafficquality.google',
    'https://ep2.adtrafficquality.google',
  ],

  // Ad Servers (VAST/VMAP)
  adServers: [
    // TODO: Add your ad server domains here
    // 'https://ad-server.example.com',
    // 'https://vast.example.com',
  ],

  // CDN & Assets
  cdn: [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],

  // Audio streaming
  audioStreaming: [
    // Radio stream URLs
    'https://*.radiostream.com',
    'http://*.radiostream.com', // Some radio stations use HTTP
  ],

  // Backend API
  backend: [
    'https://api.rradio.online',
  ],

  // Image hosts
  imageHosts: [
    'https://images.unsplash.com',
    'https://*.cloudinary.com',
    'https://*.imgur.com',
  ],
} as const

/**
 * Build CSP directives
 */
export function buildCSPDirectives(nonce: string): Record<string, string[]> {
  return {
    // Default fallback for all resource types
    'default-src': [TRUSTED_DOMAINS.self],

    // Scripts: Allow inline scripts with nonce, trusted domains
    'script-src': [
      TRUSTED_DOMAINS.self,
      `'nonce-${nonce}'`,
      ...TRUSTED_DOMAINS.stripe,
      ...TRUSTED_DOMAINS.analytics,
      ...TRUSTED_DOMAINS.adSense,
      // Allow 'unsafe-eval' only in development for HMR
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      // Strict dynamic for progressive enhancement
      "'strict-dynamic'",
    ],

    // Styles: Allow inline styles with nonce, trusted domains
    // Note: In development, we don't use nonce for styles to avoid blocking Next.js HMR styles
    // In production, 'unsafe-inline' is ignored when nonce is present, which is more secure
    'style-src': [
      TRUSTED_DOMAINS.self,
      // Only add nonce in production for explicit nonce-tagged styles
      ...(isProduction ? [`'nonce-${nonce}'`] : []),
      "'unsafe-inline'", // Required for Next.js, Tailwind, CSS-in-JS libraries, and AdSense
      ...TRUSTED_DOMAINS.stripe,
      ...TRUSTED_DOMAINS.cdn,
    ],

    // Images: Allow data URIs, trusted domains
    // Note: Allowing both http: and https: for legacy radio station assets
    'img-src': [
      TRUSTED_DOMAINS.self,
      'data:', // Data URIs for inline images
      'blob:', // Blob URIs for generated images
      'https:', // Allow all HTTPS images (radio station logos, etc.)
      'http:', // Allow HTTP images (legacy radio station favicons, etc.)
      ...TRUSTED_DOMAINS.stripe,
      ...TRUSTED_DOMAINS.imageHosts,
    ],

    // Fonts: Allow data URIs, trusted domains
    'font-src': [
      TRUSTED_DOMAINS.self,
      'data:',
      ...TRUSTED_DOMAINS.cdn,
    ],

    // AJAX/Fetch requests
    'connect-src': [
      TRUSTED_DOMAINS.self,
      ...TRUSTED_DOMAINS.stripe,
      ...TRUSTED_DOMAINS.analytics,
      ...TRUSTED_DOMAINS.adSense,
      ...TRUSTED_DOMAINS.adServers,
      ...TRUSTED_DOMAINS.audioStreaming,
      ...TRUSTED_DOMAINS.backend,
      // Allow development server
      ...(isDevelopment ? ['ws://localhost:*', 'http://localhost:*'] : []),
    ],

    // Media: Audio and video sources
    'media-src': [
      TRUSTED_DOMAINS.self,
      'data:',
      'blob:',
      'https:', // Radio streams can come from any HTTPS source
      'http:', // Some radio stations still use HTTP
      ...TRUSTED_DOMAINS.audioStreaming,
    ],

    // Workers: Web workers
    'worker-src': [
      TRUSTED_DOMAINS.self,
      'blob:',
    ],

    // Child frames: iframes (Stripe Checkout, AdSense, etc.)
    'frame-src': [
      TRUSTED_DOMAINS.self,
      ...TRUSTED_DOMAINS.stripe,
      ...TRUSTED_DOMAINS.adSense,
    ],

    // Form actions: Where forms can submit to
    'form-action': [
      TRUSTED_DOMAINS.self,
      ...TRUSTED_DOMAINS.stripe,
    ],

    // Frame ancestors: Who can embed this site
    'frame-ancestors': [
      "'none'", // Prevent clickjacking
    ],

    // Base URI: Restrict base tag
    'base-uri': [
      TRUSTED_DOMAINS.self,
    ],

    // Object/Embed
    'object-src': [
      "'none'", // Disable plugins
    ],
  }
}

/**
 * Convert CSP directives to header string
 */
export function buildCSPHeader(directives: Record<string, string[]>): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

/**
 * Additional security headers
 */
export function getSecurityHeaders(nonce: string): Record<string, string> {
  // Build CSP directives
  const cspDirectives = buildCSPDirectives(nonce)
  const cspHeader = buildCSPHeader(cspDirectives)

  return {
    // Content Security Policy
    'Content-Security-Policy': cspHeader,

    // Report CSP violations (optional, for monitoring)
    ...(isProduction ? {
      'Content-Security-Policy-Report-Only': `${cspHeader}; report-uri /api/csp-report`,
    } : {}),

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS filter in older browsers
    'X-XSS-Protection': '1; mode=block',

    // Prevent clickjacking (SAMEORIGIN allows AdSense iframes)
    'X-Frame-Options': 'SAMEORIGIN',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy (formerly Feature Policy)
    // Note: URLs must be quoted with "url" for Permissions-Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'payment=(self "https://js.stripe.com" "https://checkout.stripe.com")',
      'usb=()',
      'interest-cohort=()', // Disable FLoC
    ].join(', '),

    // Force HTTPS in production
    ...(isProduction ? {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    } : {}),

    // Cross-Origin policies
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups', // Allow Stripe popups
    'Cross-Origin-Resource-Policy': 'same-origin',
  }
}

/**
 * Get CSP nonce from response headers
 */
export function getNonceFromHeaders(headers: Headers): string | null {
  const csp = headers.get('Content-Security-Policy')
  if (!csp) return null

  const nonceMatch = csp.match(/nonce-([a-zA-Z0-9+/=]+)/)
  return nonceMatch ? nonceMatch[1] : null
}

/**
 * Validate CSP configuration
 */
export function validateCSPConfig(): {
  valid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Check for unsafe directives in production
  if (isProduction) {
    const testDirectives = buildCSPDirectives('test-nonce')

    // Check script-src
    if (testDirectives['script-src'].includes("'unsafe-eval'")) {
      errors.push("'unsafe-eval' should not be used in production")
    }

    if (testDirectives['script-src'].includes("'unsafe-inline'")) {
      warnings.push("'unsafe-inline' in script-src reduces security. Use nonces instead.")
    }

    // Check for missing directives
    const requiredDirectives = ['default-src', 'script-src', 'style-src', 'img-src', 'connect-src']
    for (const directive of requiredDirectives) {
      if (!testDirectives[directive]) {
        errors.push(`Missing required directive: ${directive}`)
      }
    }
  }

  // Check for missing Stripe domains
  if (!TRUSTED_DOMAINS.stripe.length) {
    warnings.push('No Stripe domains configured. Stripe Checkout may not work.')
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}

/**
 * Log CSP configuration on startup
 */
export function logCSPConfig(): void {
  if (isDevelopment) {
    // CSP config logging silenced
  }
}
