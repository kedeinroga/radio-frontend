import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import '@/lib/env' // ✅ Validate environment variables at app startup
import { WebVitals } from '@/components/WebVitals'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
const ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID

// REMOVED: export const dynamic = 'force-dynamic' 
// This was causing Next.js to try to pre-render ALL pages during build,
// which crashes the build worker. Pages that need dynamic rendering
// should declare it individually, not at root layout level.

// 🔥 Viewport configuration (Next.js 15+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D0D12',
}

/**
 * Root Layout
 * 
 * Minimal root layout that provides HTML structure and global providers.
 * Locale-specific layouts are handled in [locale]/layout.tsx
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Leer headers() mantiene el render dinámico, necesario para que Next aplique el nonce de
  // la CSP ('strict-dynamic') a sus propios scripts. No quitar aunque no se use el valor.
  await headers()

  return (
    <html lang="es" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Verificación de AdSense en todo el sitio. El script de anuncios solo lo cargan las
            páginas con contenido propio (components/AdSenseScript). */}
        {ADSENSE_ID && <meta name="google-adsense-account" content={ADSENSE_ID} />}

        {/* Schema.org Organization & WebSite Global */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Rradio',
                url: BASE_URL,
                logo: `${BASE_URL}/icon-512.png`,
                sameAs: [
                  'https://twitter.com/radioapp',
                  'https://facebook.com/radioapp',
                  'https://instagram.com/radioapp'
                ],
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer support',
                  email: 'support@rradio.online'
                }
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Rradio',
                alternateName: ['Rradio Online', 'RadioApp'],
                url: BASE_URL,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${BASE_URL}/es/search?q={search_term_string}`
                  },
                  'query-input': 'required name=search_term_string'
                }
              }
            ])
          }}
        />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Providers>
          {children}
          <WebVitals />
        </Providers>
      </body>
    </html>
  )
}
