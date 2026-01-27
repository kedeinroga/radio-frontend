import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'
import '@/lib/env' // ✅ Validate environment variables at app startup

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

// REMOVED: export const dynamic = 'force-dynamic' 
// This was causing Next.js to try to pre-render ALL pages during build,
// which crashes the build worker. Pages that need dynamic rendering
// should declare it individually, not at root layout level.

// 🔥 Viewport configuration (Next.js 15+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' }
  ],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
