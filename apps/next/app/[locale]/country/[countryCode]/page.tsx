import { Metadata } from 'next'
import type { Station } from '@radio-app/app'
import { StationServerRepository } from '@/lib/repositories/StationServerRepository'
import { HubPage } from '@/components/HubPage'
import { getListingTexts } from '@/lib/listingTexts'
import { formatCountry } from '@/lib/country'
import { getCountryHub, isHubIndexable } from '@/lib/editorial'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ countryCode: string; locale: string }>
}

// Removed: export const dynamic = 'force-dynamic'
// Not needed - page is already dynamic due to [countryCode] param and runtime data fetching
// ISR below will handle regeneration strategy

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
      ogTitle: `Radios de ${countryName} | Rradio`,
      ogDescription: `Las mejores estaciones de radio de ${countryName}`,
    },
    en: {
      title: `${countryName} Radio Stations live | Listen online free`,
      description: `Discover the best radio stations from ${countryName}. Listen to music, news and entertainment live. Free and no downloads.`,
      keywords: [`${countryName} radio`, `${countryName} stations`, `${countryName} online radio`, `${countryName} music`],
      ogTitle: `${countryName} Radio Stations | Rradio`,
      ogDescription: `The best radio stations from ${countryName}`,
    },
    fr: {
      title: `Stations de radio ${countryName} en direct | Écouter en ligne gratuitement`,
      description: `Découvrez les meilleures stations de radio de ${countryName}. Écoutez de la musique, des actualités et du divertissement en direct. Gratuit et sans téléchargement.`,
      keywords: [`radio ${countryName}`, `stations ${countryName}`, `radio en ligne ${countryName}`, `musique ${countryName}`],
      ogTitle: `Stations de radio ${countryName} | Rradio`,
      ogDescription: `Les meilleures stations de radio de ${countryName}`,
    },
    de: {
      title: `${countryName} Radiosender live | Kostenlos online hören`,
      description: `Entdecken Sie die besten Radiosender aus ${countryName}. Hören Sie Musik, Nachrichten und Unterhaltung live. Kostenlos und ohne Downloads.`,
      keywords: [`${countryName} Radio`, `${countryName} Sender`, `${countryName} Online-Radio`, `${countryName} Musik`],
      ogTitle: `${countryName} Radiosender | Rradio`,
      ogDescription: `Die besten Radiosender aus ${countryName}`,
    },
  }
  return texts[locale] || texts['es']
}

// 🔥 DYNAMIC METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { countryCode, locale } = await Promise.resolve(params)
  const hub = getCountryHub(countryCode)
  const code = hub?.slug ?? decodeURIComponent(countryCode).toUpperCase()
  const countryName = formatCountry(code, locale) ?? countryCode
  const localizedText = getLocalizedCountryText(locale, countryName)
  const url = `${BASE_URL}/${locale}/country/${code}`

  // Indexable solo con contenido editorial revisado y en su idioma (es); el resto es una
  // página de navegación con datos de terceros: noindex.
  if (isHubIndexable(hub, locale)) {
    return {
      // absolute: la plantilla del layout alargaría el título a ~90 caracteres
      title: { absolute: `${hub.metaTitle} | Rradio` },
      description: hub.metaDescription,
      robots: { index: true, follow: true },
      openGraph: { title: hub.metaTitle, description: hub.metaDescription, url, locale: 'es_ES' },
      alternates: { canonical: url },
    }
  }

  return {
    title: localizedText.title,
    description: localizedText.description,
    robots: { index: false, follow: true },
    openGraph: {
      title: localizedText.ogTitle,
      description: localizedText.ogDescription,
      url,
    },
    alternates: { canonical: url },
  }
}

export default async function CountryPage({ params }: PageProps) {
  const { countryCode, locale } = await Promise.resolve(params)

  // CRITICAL: Skip rendering during build phase to prevent crashes
  // This prevents API calls during "Collecting page data" in Vercel builds
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    return (
      <main className="min-h-screen p-8">
        <p>Loading country...</p>
      </main>
    )
  }

  const hub = getCountryHub(countryCode)
  const code = hub?.slug ?? decodeURIComponent(countryCode).toUpperCase()
  const countryName = formatCountry(code, locale) ?? countryCode
  const texts = getListingTexts(locale)

  let stations: Station[] = []
  try {
    stations = await new StationServerRepository().getByCountry(code, 50)
  } catch (error) {
    console.error('[CountryPage] Error fetching stations:', error)
  }

  return (
    <HubPage
      locale={locale}
      emoji={hub?.emoji ?? '🌍'}
      heading={texts.countryHeading(countryName)}
      hub={hub}
      stations={stations}
      texts={texts}
      breadcrumbs={[
        { name: texts.home, url: `${BASE_URL}/${locale}` },
        { name: texts.countries, url: `${BASE_URL}/${locale}/radio-online` },
        { name: countryName, url: `${BASE_URL}/${locale}/country/${code}` },
      ]}
    />
  )
}
