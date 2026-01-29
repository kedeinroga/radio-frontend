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
    es: 'Radio Online Gratis',
    en: 'Free Online Radio',
    fr: 'Radio en Ligne Gratuite',
    de: 'Kostenloses Online-Radio',
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

        {/* Schema.org WebPage & Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: seoTitle,
                description: t.app.subtitle,
                url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'}/${locale}`,
                inLanguage: locale,
                isPartOf: {
                  '@type': 'WebSite',
                  name: 'Rradio',
                  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
                }
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Service',
                name: 'Rradio Streaming',
                provider: {
                  '@type': 'Organization',
                  name: 'Rradio',
                  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'
                },
                serviceType: 'Radio Streaming',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock'
                },
                areaServed: 'World'
              }
            ])
          }}
        />
      </div>
      {/* SEO Footer with Internal Links */}

      <footer className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-bold text-lg mb-4 text-neutral-900 dark:text-white">Rradio</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              {t.radioOnline?.description || 'La mejor plataforma de radio online gratis.'}
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-neutral-900 dark:text-white">Explorar</h3>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a href={`/${locale}/radio-online`} className="hover:text-purple-600 transition-colors">
                  {t.radioOnline?.h1 || 'Radio Online'}
                </a>
              </li>
              <li>
                <a href={`/${locale}/search`} className="hover:text-purple-600 transition-colors">
                  {t.navigation?.search || 'Buscar Estaciones'}
                </a>
              </li>
              <li>
                <a href={`/${locale}/genres`} className="hover:text-purple-600 transition-colors">
                  {t.navigation?.genres || 'Géneros'}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-neutral-900 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a href="#" className="hover:text-purple-600 transition-colors">Privacidad</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-600 transition-colors">Términos</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Rradio. All rights reserved.
        </div>
      </footer>
    </main>
  )
}

