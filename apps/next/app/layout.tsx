import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PlayerBar } from '@/components/PlayerBar'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Radio App - Stream Radio Stations Worldwide',
  description: 'Listen to thousands of radio stations from around the world. Free, accessible, and easy to use.',
  keywords: ['radio', 'streaming', 'music', 'news', 'podcasts'],
  authors: [{ name: 'Radio App Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
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
