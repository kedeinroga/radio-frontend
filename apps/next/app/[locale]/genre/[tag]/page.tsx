import { Metadata } from 'next'
import type { Station } from '@radio-app/app'
import { StationServerRepository } from '@/lib/repositories/StationServerRepository'
import { HubPage } from '@/components/HubPage'
import { getListingTexts } from '@/lib/listingTexts'
import { getGenreHub, isHubIndexable } from '@/lib/editorial'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ tag: string; locale: string }> | { tag: string; locale: string }
}

// Removed: export const dynamic = 'force-dynamic'
// Not needed - page is already dynamic due to [tag] param and runtime data fetching
// ISR below will handle regeneration strategy

// Allow dynamic params to be generated on-demand
export const dynamicParams = true

// 🔥 ISR - Regenerate every hour
// Note: This is ignored when dynamic = 'force-dynamic'
export const revalidate = 3600

// Helper to get translated text based on locale
function getLocalizedGenreText(locale: string, genreName: string, displayName: string) {
  const texts: Record<string, any> = {
    es: {
      title: `Radios de ${displayName} | Escuchar música ${displayName} online gratis`,
      description: `Las mejores estaciones de radio de ${displayName}. Escucha ${displayName} en vivo las 24 horas. Música, programas y más, gratis.`,
      keywords: [`radio ${genreName}`, `música ${genreName}`, `${genreName} online`, `estaciones ${genreName}`],
      ogTitle: `Radios de ${displayName} | Rradio`,
      ogDescription: `Escucha las mejores radios de ${displayName} en vivo`,
    },
    en: {
      title: `${displayName} Radio Stations | Listen to ${displayName} music online free`,
      description: `The best ${displayName} radio stations. Listen to ${displayName} live 24 hours. Music, shows and more, free.`,
      keywords: [`${genreName} radio`, `${genreName} music`, `${genreName} online`, `${genreName} stations`],
      ogTitle: `${displayName} Radio Stations | Rradio`,
      ogDescription: `Listen to the best ${displayName} radio stations live`,
    },
    fr: {
      title: `Stations de radio ${displayName} | Écouter musique ${displayName} en ligne gratuitement`,
      description: `Les meilleures stations de radio ${displayName}. Écoutez ${displayName} en direct 24 heures. Musique, émissions et plus, gratuit.`,
      keywords: [`radio ${genreName}`, `musique ${genreName}`, `${genreName} en ligne`, `stations ${genreName}`],
      ogTitle: `Stations de radio ${displayName} | Rradio`,
      ogDescription: `Écoutez les meilleures stations de radio ${displayName} en direct`,
    },
    de: {
      title: `${displayName} Radiosender | ${displayName} Musik kostenlos online hören`,
      description: `Die besten ${displayName} Radiosender. Hören Sie ${displayName} 24 Stunden live. Musik, Sendungen und mehr, kostenlos.`,
      keywords: [`${genreName} Radio`, `${genreName} Musik`, `${genreName} online`, `${genreName} Sender`],
      ogTitle: `${displayName} Radiosender | Rradio`,
      ogDescription: `Hören Sie die besten ${displayName} Radiosender live`,
    },
  }
  return texts[locale] || texts['es']
}

// 🔥 DYNAMIC METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const { tag, locale } = resolvedParams
  const hub = getGenreHub(tag)
  const slug = hub?.slug ?? tag
  const genreName = decodeURIComponent(tag).replace(/-/g, ' ')
  const displayName = hub?.names[locale as keyof typeof hub.names] ?? genreName.charAt(0).toUpperCase() + genreName.slice(1)
  const localizedText = getLocalizedGenreText(locale, genreName, displayName)
  const url = `${BASE_URL}/${locale}/genre/${slug}`

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
      locale: locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'de_DE',
    },
    alternates: { canonical: url },
  }
}

export default async function GenrePage({ params }: PageProps) {
  const { tag, locale } = await Promise.resolve(params)

  // CRITICAL: Skip rendering during build phase to prevent crashes
  // This prevents API calls during "Collecting page data" in Vercel builds
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    return (
      <main className="min-h-screen p-8">
        <p>Loading genre...</p>
      </main>
    )
  }

  const hub = getGenreHub(tag)
  const slug = hub?.slug ?? tag
  const genreName = decodeURIComponent(tag).replace(/-/g, ' ')
  const displayName = hub?.names[locale as keyof typeof hub.names] ?? genreName.charAt(0).toUpperCase() + genreName.slice(1)
  const texts = getListingTexts(locale)

  let stations: Station[] = []
  try {
    stations = await new StationServerRepository().getByGenre(hub?.tag ?? genreName, 50)
  } catch (error) {
    console.error('[GenrePage] Error fetching stations:', error)
  }

  return (
    <HubPage
      locale={locale}
      emoji={hub?.emoji ?? '🎵'}
      heading={texts.genreHeading(displayName)}
      hub={hub}
      stations={stations}
      texts={texts}
      breadcrumbs={[
        { name: texts.home, url: `${BASE_URL}/${locale}` },
        { name: texts.genres, url: `${BASE_URL}/${locale}/radio-online` },
        { name: displayName, url: `${BASE_URL}/${locale}/genre/${slug}` },
      ]}
    />
  )
}
