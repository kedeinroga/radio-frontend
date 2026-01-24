import type { Metadata } from 'next'
import { PlayerBar } from '@/components/PlayerBar'
import BottomNav from '@/components/BottomNav'
import { I18nProvider } from '@/components/I18nProvider'
import { generateLocaleParams } from '@/lib/locale'
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

/**
 * Load translations for a given locale from the file system
 * This runs on the server during SSR/SSG
 */
async function loadServerTranslations(locale: string) {
  // SKIP during build phase to prevent worker crashes
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD_TIME === 'true') {
    return {}
  }
  
  try {
    const translationsPath = path.join(process.cwd(), 'i18n', 'locales', `${locale}.json`)
    const translationsContent = fs.readFileSync(translationsPath, 'utf-8')
    return JSON.parse(translationsContent)
  } catch (error) {

    // Fallback to Spanish if locale file doesn't exist
    if (locale !== 'es') {
      return loadServerTranslations('es')
    }
    return {}
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const dynamicParams = true

/**
 * Generate metadata for each locale
 * SEO-optimized with language-specific content
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  // Await params as required by Next.js 15
  const { locale: localeCode } = await params
  
  const supportedLocales = ['es', 'en', 'fr', 'de']
  const locale = supportedLocales.includes(localeCode) ? localeCode : 'es'

  // Language-specific metadata
  const metadataByLocale: Record<string, any> = {
    es: {
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
      ogTitle: 'RadioApp - Radio Online Gratis',
      ogDescription: 'Escucha miles de estaciones de radio en vivo de todo el mundo',
    },
    en: {
      title: {
        template: '%s | RadioApp - Listen to Radio Online',
        default: 'RadioApp - Best Live Radio Stations',
      },
      description: 'Discover and listen to thousands of radio stations from around the world. Rock, Pop, Jazz, News and more. Free and high quality.',
      keywords: [
        'online radio',
        'streaming radio',
        'live music',
        'free radio',
        'radio stations',
        'internet radio',
        'listen radio',
        'world radio'
      ],
      ogTitle: 'RadioApp - Free Online Radio',
      ogDescription: 'Listen to thousands of live radio stations from around the world',
    },
    fr: {
      title: {
        template: '%s | RadioApp - Écoutez la Radio en Ligne',
        default: 'RadioApp - Meilleures Stations de Radio en Direct',
      },
      description: 'Découvrez et écoutez des milliers de stations de radio du monde entier. Rock, Pop, Jazz, Actualités et plus. Gratuit et haute qualité.',
      keywords: [
        'radio en ligne',
        'streaming radio',
        'musique en direct',
        'radio gratuite',
        'stations de radio',
        'radio internet',
        'écouter radio',
        'radio mondiale'
      ],
      ogTitle: 'RadioApp - Radio en Ligne Gratuite',
      ogDescription: 'Écoutez des milliers de stations de radio en direct du monde entier',
    },
    de: {
      title: {
        template: '%s | RadioApp - Radio Online Hören',
        default: 'RadioApp - Beste Live-Radiosender',
      },
      description: 'Entdecken und hören Sie Tausende von Radiosendern aus der ganzen Welt. Rock, Pop, Jazz, Nachrichten und mehr. Kostenlos und in hoher Qualität.',
      keywords: [
        'online radio',
        'streaming radio',
        'live musik',
        'kostenloses radio',
        'radiosender',
        'internet radio',
        'radio hören',
        'weltradio'
      ],
      ogTitle: 'RadioApp - Kostenloses Online-Radio',
      ogDescription: 'Hören Sie Tausende von Live-Radiosendern aus der ganzen Welt',
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
      locale: ogLocaleMap[locale] || 'es_ES',
      url: `${BASE_URL}/${locale}`,
      siteName: 'RadioApp',
      title: localeMetadata.ogTitle,
      description: localeMetadata.ogDescription,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'RadioApp',
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
    category: 'entertainment',
  }
}

/**
 * Locale Layout Component
 * 
 * Wraps the application with I18nProvider for internationalization.
 * Each locale has its own static version of the layout.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Await params as required by Next.js 15
  const { locale: localeCode } = await params
  
  // Validate it's a supported locale
  const supportedLocales = ['es', 'en', 'fr', 'de']
  const validLocaleCode = supportedLocales.includes(localeCode) ? localeCode : 'es'

  // Load translations on the server
  const translations = await loadServerTranslations(validLocaleCode)

  return (
    <I18nProvider initialLocaleCode={validLocaleCode} initialTranslations={translations}>
      {/* Increased padding to accommodate both player bar (80px) and bottom nav (64px) */}
      <div className="pb-36">{children}</div>
      <PlayerBar />
      <BottomNav />
    </I18nProvider>
  )
}
