import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PlayerBar } from '@/components/PlayerBar'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://radioapp.com'

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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | RadioApp - Escucha Radio Online',
    default: 'RadioApp - Las Mejores Estaciones de Radio en Vivo',
  },
  description: 'Descubre y escucha miles de estaciones de radio de todo el mundo. Rock, Pop, Jazz, Noticias y más. Gratis y en alta calidad.',
  keywords: [
    'radio online',
    'streaming radio',
    'música en vivo',
    'radio gratis',
    'estaciones de radio',
    'radio por internet',
    'escuchar radio',
    'radio mundial'
  ],
  authors: [{ name: 'RadioApp Team' }],
  creator: 'RadioApp',
  publisher: 'RadioApp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'RadioApp',
    title: 'RadioApp - Radio Online Gratis',
    description: 'Escucha miles de estaciones de radio en vivo de todo el mundo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RadioApp - Escucha Radio Online',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@radioapp',
    creator: '@radioapp',
    title: 'RadioApp - Radio Online Gratis',
    description: 'Escucha miles de estaciones de radio en vivo',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: 'entertainment',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Providers>
          {/* Increased padding to accommodate both player bar (80px) and bottom nav (64px) */}
          <div className="pb-36">{children}</div>
          <PlayerBar />
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
