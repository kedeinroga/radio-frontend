import { MetadataRoute } from 'next'

// Force dynamic generation - don't generate during build
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

/**
 * Robots.txt Configuration
 * Controls search engine crawling behavior
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Don't index API routes
          '/admin/',         // Don't index admin pages
          '/_next/',         // Don't index Next.js internals
          '/private/',       // Don't index private content
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
        crawlDelay: 0,     // No delay for Google
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
        crawlDelay: 1,     // Slight delay for Bing
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
