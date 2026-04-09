import { Station } from '@radio-app/app'
import { FAQSection } from '@/components/FAQSection'
import { PopularStations } from '@/components/PopularStations'

// Import translations statically for SSR
import esTranslations from '@/i18n/locales/es.json'
import enTranslations from '@/i18n/locales/en.json'
import frTranslations from '@/i18n/locales/fr.json'
import deTranslations from '@/i18n/locales/de.json'

import { StationServerRepository } from '@/lib/repositories/StationServerRepository'

const stationRepo = new StationServerRepository()

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
    <main id="main-content" className="min-h-screen p-6 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ──────────────────────────────── */}
        <header className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
            {seoTitle}
          </h1>
          <p className="font-broadcast text-xs text-neutral-500 tracking-wide">
            {t.app.subtitle}
          </p>
        </header>

        {/* Popular Stations */}
        <PopularStations initialStations={plainStations} />

        {/* SEO features section */}
        <section className="mt-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.06]" aria-hidden="true" />
            <h2 className="font-broadcast text-[11px] tracking-[0.2em] uppercase text-neutral-500 whitespace-nowrap">
              {t.seo.whyChooseUs.title}
            </h2>
            <div className="flex-1 h-px bg-white/[0.06]" aria-hidden="true" />
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-12">
            {[
              { emoji: '🎵', title: t.seo.features.variety.title, desc: t.seo.features.variety.description },
              { emoji: '🌍', title: t.seo.features.global.title, desc: t.seo.features.global.description },
              { emoji: '💯', title: t.seo.features.free.title, desc: t.seo.features.free.description },
              { emoji: '📱', title: t.seo.features.anywhere.title, desc: t.seo.features.anywhere.description },
            ].map(({ emoji, title, desc }) => (
              <article
                key={title}
                className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.10] transition-colors"
              >
                <h3 className="font-display text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <span aria-hidden="true">{emoji}</span>
                  {title}
                </h3>
                <p className="font-broadcast text-[11px] text-neutral-500 leading-relaxed">
                  {desc}
                </p>
              </article>
            ))}
          </div>

          {/* FAQ */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.06]" aria-hidden="true" />
            <h2 className="font-broadcast text-[11px] tracking-[0.2em] uppercase text-neutral-500 whitespace-nowrap">
              {t.seo.faq.title}
            </h2>
            <div className="flex-1 h-px bg-white/[0.06]" aria-hidden="true" />
          </div>

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

      <footer className="mt-20 border-t border-white/[0.06] pt-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display text-base font-semibold text-white mb-3">Rradio</h3>
            <p className="font-broadcast text-[11px] text-neutral-500 leading-relaxed">
              {t.radioOnline?.description || 'La mejor plataforma de radio online gratis.'}
            </p>
          </div>
          <div>
            <h3 className="font-broadcast text-[10px] tracking-[0.18em] uppercase text-neutral-600 mb-3">Explorar</h3>
            <ul className="space-y-2">
              {[
                { href: `/${locale}/radio-online`, label: t.radioOnline?.h1 || 'Radio Online' },
                { href: `/${locale}/blog`,         label: t.navigation?.blog || 'Blog' },
                { href: `/${locale}/search`,       label: t.navigation?.search || 'Buscar' },
                { href: `/${locale}/genres`,       label: t.navigation?.genres || 'Géneros' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="font-broadcast text-[11px] text-neutral-500 hover:text-amber-400 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-broadcast text-[10px] tracking-[0.18em] uppercase text-neutral-600 mb-3">Legal</h3>
            <ul className="space-y-2">
              {[
                { href: `/${locale}/privacy`, label: t.legal?.privacy || 'Privacidad' },
                { href: `/${locale}/terms`,   label: t.legal?.terms   || 'Términos' },
                { href: `/${locale}/dmca`,    label: 'DMCA' },
                { href: `/${locale}/about`,   label: t.legal?.about   || 'Acerca de' },
                { href: `/${locale}/contact`, label: t.legal?.contact || 'Contacto' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="font-broadcast text-[11px] text-neutral-500 hover:text-amber-400 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/[0.04] text-center font-broadcast text-[10px] text-neutral-700">
          © {new Date().getFullYear()} Rradio. All rights reserved.
        </div>
      </footer>
    </main>
  )
}

