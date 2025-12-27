/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@radio-app/app'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // TODO: Restrict to specific domains once image sources are catalogued
    // Recommended: Add specific hostnames like:
    // { protocol: 'https', hostname: 'api.radio-browser.info' },
    // { protocol: 'https', hostname: '*.radio-browser.info' },
    // For now, keeping '**' but adding security headers to mitigate risks
    dangerouslyAllowSVG: false, // Disable SVG to prevent XSS
    contentDispositionType: 'attachment', // Force download for unsafe files
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  },
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Force HTTPS in production
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content Security Policy
          // Note: Using report-only mode initially to avoid breaking functionality
          // Switch to 'Content-Security-Policy' when ready for enforcement
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
              "style-src 'self' 'unsafe-inline'", // Required for styled-components/emotion
              "img-src 'self' data: https: blob:", // Allow images from any HTTPS source
              "font-src 'self' data:",
              "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'),
              "media-src 'self' https: blob:", // Allow audio streaming
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
