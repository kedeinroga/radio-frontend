import { StationApiRepository, Station } from '@radio-app/app'
import { LanguageSelector } from '@/components/LanguageSelector'
import { FAQSection } from '@/components/FAQSection'
import { PopularStations } from '@/components/PopularStations'

// Import translations statically for SSR
import esTranslations from '@/i18n/locales/es.json'
import enTranslations from '@/i18n/locales/en.json'
import frTranslations from '@/i18n/locales/fr.json'
import deTranslations from '@/i18n/locales/de.json'

const stationRepo = new StationApiRepository()

// ISR: Revalidate every hour for fresh content
export const revalidate = 3600

interface PageProps {
  params: Promise<{ locale: string }> | { locale: string }
}

/**
 * Get translations for a given locale
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
 * Get SEO-enhanced title (only element customized for keywords)
 * Everything else comes directly from JSON translations
 */
function getSEOTitle(locale: string): string {
  const seoTitles: Record<string, string> = {
    es: 'Radio Online Gratis - Escucha las Mejores Estaciones en Vivo',
    en: 'Free Online Radio - Listen to the Best Live Stations',
    fr: 'Radio en Ligne Gratuite - Écoutez les Meilleures Stations en Direct',
    de: 'Kostenloses Online-Radio - Hören Sie die Besten Live-Sender',
  }
  
  return seoTitles[locale] || seoTitles.es
}

/**
 * Homepage - Server Component for SEO
 * 
 * Pre-renders popular stations on the server for Google indexing.
 * Uses ISR to keep content fresh without rebuilding on every request.
 * Supports multiple locales using existing translation JSON files.
 */
export default async function HomePage({ params }: PageProps) {
  // Await params for Next.js 15 compatibility
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  
  // Get all translations from JSON
  const t = getTranslations(locale)
  
  // Only H1 title is enhanced for SEO keywords
  const seoTitle = getSEOTitle(locale)
  
  // SSR: Fetch stations on the server for SEO
  let stations: Station[] = []
  try {
    stations = await stationRepo.getPopular(20)
  } catch (error) {
    console.error('[HomePage SSR] Error fetching stations:', error)
    // Fallback to empty array - component will handle error state
    stations = []
  }

  // Serialize Station objects to plain objects for Next.js (can't pass class instances to Client Components)
  const plainStations = stations.map(station => ({
    id: station.id,
    name: station.name,
    streamUrl: station.streamUrl,
    slug: station.slug,
    tags: station.tags,
    seoMetadata: station.seoMetadata,
    imageUrl: station.imageUrl,
    country: station.country,
    genre: station.genre,
    isPremium: station.isPremium,
    description: station.description,
    bitrate: station.bitrate,
    votes: station.votes,
  }))

  return (
    <main id="main-content" className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Language Selector */}
        <header className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              {seoTitle}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {t.app.subtitle}
            </p>
          </div>
          <div className="ml-4">
            <LanguageSelector />
          </div>
        </header>

        {/* Popular Stations - Client Component with SSR data */}
        <PopularStations initialStations={plainStations} />

        {/* SEO Content Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {t.seo.whyChooseUs.title}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <article className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🎵</span> {t.seo.features.variety.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.seo.features.variety.description}
              </p>
            </article>
            
            <article className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🌍</span> {t.seo.features.global.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.seo.features.global.description}
              </p>
            </article>
            
            <article className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span>💯</span> {t.seo.features.free.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.seo.features.free.description}
              </p>
            </article>
            
            <article className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span>📱</span> {t.seo.features.anywhere.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t.seo.features.anywhere.description}
              </p>
            </article>
          </div>

          {/* FAQ Section */}
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {t.seo.faq.title}
          </h2>
          
          <FAQSection />
        </section>
      </div>
    </main>
  )
}
