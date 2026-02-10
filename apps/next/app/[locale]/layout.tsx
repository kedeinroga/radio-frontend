import type { Metadata } from 'next'
import { PlayerBar } from '@/components/PlayerBar'
import BottomNav from '@/components/BottomNav'
import { I18nProvider } from '@/components/I18nProvider'
import { CookieConsent } from '@/components/CookieConsent'

// Import translations statically to avoid dynamic imports during build
import esTranslations from '@/i18n/locales/es.json'
import enTranslations from '@/i18n/locales/en.json'
import frTranslations from '@/i18n/locales/fr.json'
import deTranslations from '@/i18n/locales/de.json'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

/**
 * Get translations for a given locale
 * Uses static imports to avoid dynamic loading issues
 */
function getTranslations(locale: string): Record<string, any> {
  const translationsMap: Record<string, any> = {
    es: esTranslations,
    en: enTranslations,
    fr: frTranslations,
    de: deTranslations,
  }
  
  return translationsMap[locale] || esTranslations
}

/**
 * Generate metadata for each locale
 * SEO-optimized with language-specific content
 * Now properly async to await params (Next.js 15 requirement)
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string }
}): Promise<Metadata> {
  const supportedLocales = ['es', 'en', 'fr', 'de']
  // Await params to comply with Next.js 15 requirements
  const resolvedParams = await Promise.resolve(params)
  const locale = supportedLocales.includes(resolvedParams.locale) ? resolvedParams.locale : 'es'

  // Language-specific metadata
  const metadataByLocale: Record<string, any> = {
    es: {
      title: {
        template: '%s | Rradio - Escucha Radio Online',
        default: 'Rradio - Radio Online Gratis - Escucha Música en Vivo',
      },
      description: 'Escucha radio online gratis. Más de 30,000 estaciones de radio en vivo. Música, noticias y deportes. Sin cortes y en alta calidad.',
      keywords: [
        'radio online',
        'radio gratis',
        'radio en vivo',
        'emisoras de radio',
        'escuchar radio',
        'radio por internet',
        'rradio',
        'radio mundial',
        'musica gratis'
      ],
      ogTitle: 'Rradio - Radio Online Gratis',
      ogDescription: 'La mejor forma de escuchar radio online gratis. Más de 30,000 estaciones en vivo.',
    },
    en: {
      title: {
        template: '%s | Rradio - Listen to Radio Online',
        default: 'Rradio - Free Online Radio - Live Music Stations',
      },
      description: 'Listen to free online radio. Over 30,000 live radio stations. Music, news, and sports. Free and high quality streaming.',
      keywords: [
        'online radio',
        'free radio',
        'live radio',
        'radio stations',
        'internet radio',
        'listen to radio',
        'rradio',
        'world radio',
        'free music'
      ],
      ogTitle: 'Rradio - Free Online Radio',
      ogDescription: 'The best way to listen to free online radio. Over 30,000 live stations.',
    },
    fr: {
      title: {
        template: '%s | RadioApp - Écoutez la Radio en Ligne',
        default: 'RadioApp - Radio en Ligne Gratuite - Musique en Direct',
      },
      description: 'Écoutez la radio en ligne gratuitement. Plus de 30 000 stations de radio en direct. Musique, actualités et sports. Gratuit et haute qualité.',
      keywords: [
        'radio en ligne',
        'radio gratuite',
        'radio en direct',
        'stations de radio',
        'radio internet',
        'écouter la radio',
        'rradio',
        'radio mondiale',
        'musique gratuite'
      ],
      ogTitle: 'RadioApp - Radio en Ligne Gratuite',
      ogDescription: 'La meilleure façon d\'écouter la radio en ligne gratuitement. Plus de 30 000 stations en direct.',
    },
    de: {
      title: {
        template: '%s | RadioApp - Radio Online Hören',
        default: 'RadioApp - Kostenloses Online-Radio - Live-Musik',
      },
      description: 'Hören Sie kostenloses Online-Radio. Über 30.000 Live-Radiosender. Musik, Nachrichten und Sport. Kostenlos und in hoher Qualität.',
      keywords: [
        'online radio',
        'kostenloses radio',
        'live radio',
        'radiosender',
        'internet radio',
        'radio hören',
        'rradio',
        'weltradio',
        'kostenlose musik'
      ],
      ogTitle: 'RadioApp - Kostenloses Online-Radio',
      ogDescription: 'Der beste Weg, kostenloses Online-Radio zu hören. Über 30.000 Live-Sender.',
    },
  }

  const localeMetadata = metadataByLocale[locale] || metadataByLocale.es

  // OpenGraph locale mapping
  const ogLocaleMap: Record<string, string> = {
    es: 'es_ES',
    en: 'en_US',
    fr: 'fr_FR',
    de: 'de_DE',
  }

  return {
    metadataBase: new URL(BASE_URL),
    title: localeMetadata.title,
    description: localeMetadata.description,
    keywords: localeMetadata.keywords,
    authors: [{ name: 'Rradio Team' }],
    creator: 'Rradio',
    publisher: 'Rradio',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: '/icon-192.png',
      shortcut: '/icon-192.png',
      apple: '/icon-192.png',
      other: {
        rel: 'apple-touch-icon-precomposed',
        url: '/icon-512.png',
      },
    },
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[locale] || 'es_ES',
      url: `${BASE_URL}/${locale}`,
      siteName: 'Rradio',
      title: localeMetadata.ogTitle,
      description: localeMetadata.ogDescription,
      images: [
        {
          url: `${BASE_URL}/og-image.png`, // Force absolute URL
          width: 1200,
          height: 630,
          alt: 'Rradio - Radio Online Gratis',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@radioapp',
      creator: '@radioapp',
      title: localeMetadata.ogTitle,
      description: localeMetadata.ogDescription,
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
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'es': `${BASE_URL}/es`,
        'en': `${BASE_URL}/en`,
        'fr': `${BASE_URL}/fr`,
        'de': `${BASE_URL}/de`,
        'x-default': `${BASE_URL}/es`,
      },
    },
    manifest: '/manifest.webmanifest',
    category: 'entertainment',
  }
}

/**
 * Locale Layout Component
 * 
 * Wraps the application with I18nProvider for internationalization.
 * Now loads translations via static imports for reliability.
 * Now properly async to await params (Next.js 15 requirement)
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}) {
  // Validate it's a supported locale
  const supportedLocales = ['es', 'en', 'fr', 'de']
  // Await params to comply with Next.js 15 requirements
  const resolvedParams = await Promise.resolve(params)
  const validLocaleCode = supportedLocales.includes(resolvedParams.locale) ? resolvedParams.locale : 'es'

  // Get translations for the current locale
  const translations = getTranslations(validLocaleCode)

  return (
    <I18nProvider initialLocaleCode={validLocaleCode} initialTranslations={translations}>
      {/* Increased padding to accommodate both player bar (80px) and bottom nav (64px) */}
      <div className="pb-36">{children}</div>
      <PlayerBar />
      <BottomNav />
      <CookieConsent />
    </I18nProvider>
  )
}
