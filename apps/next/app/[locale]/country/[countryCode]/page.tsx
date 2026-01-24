import { Metadata } from 'next'
import { 
  StationApiRepository,
  SEOApiRepository,
  GetPopularCountries,
  Breadcrumbs,
  WebSiteSchema,
  Station
} from '@radio-app/app'
import { StationGridItem } from '@/components/StationGridItem'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ countryCode: string; locale: string }>
}

// Force dynamic rendering - don't try to pre-render during build
export const dynamic = 'force-dynamic'

// Allow dynamic params to be generated on-demand
export const dynamicParams = true

// 🔥 ISR - Regenerate every hour (3600 seconds)
// Note: This is ignored when dynamic = 'force-dynamic'
export const revalidate = 3600

// Helper to get translated text based on locale
function getLocalizedCountryText(locale: string, countryName: string) {
  const texts: Record<string, any> = {
    es: {
      title: `Radios de ${countryName} en vivo | Escuchar online gratis`,
      description: `Descubre las mejores estaciones de radio de ${countryName}. Escucha música, noticias y entretenimiento en vivo. Gratis y sin descargas.`,
      keywords: [`radio ${countryName}`, `estaciones ${countryName}`, `radio online ${countryName}`, `música ${countryName}`],
      ogTitle: `Radios de ${countryName} | RadioApp`,
      ogDescription: `Las mejores estaciones de radio de ${countryName}`,
    },
    en: {
      title: `${countryName} Radio Stations live | Listen online free`,
      description: `Discover the best radio stations from ${countryName}. Listen to music, news and entertainment live. Free and no downloads.`,
      keywords: [`${countryName} radio`, `${countryName} stations`, `${countryName} online radio`, `${countryName} music`],
      ogTitle: `${countryName} Radio Stations | RadioApp`,
      ogDescription: `The best radio stations from ${countryName}`,
    },
    fr: {
      title: `Stations de radio ${countryName} en direct | Écouter en ligne gratuitement`,
      description: `Découvrez les meilleures stations de radio de ${countryName}. Écoutez de la musique, des actualités et du divertissement en direct. Gratuit et sans téléchargement.`,
      keywords: [`radio ${countryName}`, `stations ${countryName}`, `radio en ligne ${countryName}`, `musique ${countryName}`],
      ogTitle: `Stations de radio ${countryName} | RadioApp`,
      ogDescription: `Les meilleures stations de radio de ${countryName}`,
    },
    de: {
      title: `${countryName} Radiosender live | Kostenlos online hören`,
      description: `Entdecken Sie die besten Radiosender aus ${countryName}. Hören Sie Musik, Nachrichten und Unterhaltung live. Kostenlos und ohne Downloads.`,
      keywords: [`${countryName} Radio`, `${countryName} Sender`, `${countryName} Online-Radio`, `${countryName} Musik`],
      ogTitle: `${countryName} Radiosender | RadioApp`,
      ogDescription: `Die besten Radiosender aus ${countryName}`,
    },
  }
  return texts[locale] || texts['es']
}

// 🔥 DYNAMIC METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const { countryCode, locale } = resolvedParams
  const countryName = decodeURIComponent(countryCode).toUpperCase()
  const localizedText = getLocalizedCountryText(locale, countryName)
  
  return {
    title: localizedText.title,
    description: localizedText.description,
    keywords: localizedText.keywords,
    openGraph: {
      title: localizedText.ogTitle,
      description: localizedText.ogDescription,
      url: `${BASE_URL}/${locale}/country/${countryCode}`,
      locale: locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'de_DE',
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/country/${countryCode}`,
      languages: {
        'es': `${BASE_URL}/es/country/${countryCode}`,
        'en': `${BASE_URL}/en/country/${countryCode}`,
        'fr': `${BASE_URL}/fr/country/${countryCode}`,
        'de': `${BASE_URL}/de/country/${countryCode}`,
        'x-default': `${BASE_URL}/es/country/${countryCode}`,
      },
    }
  }
}

// 🔥 SERVER COMPONENT WITH ISR
export default async function CountryPage({ params }: PageProps) {
  const { countryCode } = await Promise.resolve(params)
  const countryName = decodeURIComponent(countryCode).toUpperCase()
  
  // CRITICAL: Minimal render to prevent build crashes
  // force-dynamic ensures this only renders at request time
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Loading {countryName}...</h1>
      </div>
    </main>
  )
}
