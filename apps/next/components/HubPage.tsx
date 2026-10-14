import Link from 'next/link'
import { Breadcrumbs } from '@radio-app/app'
import type { Station } from '@radio-app/app'
import { StationGridItem } from '@/components/StationGridItem'
import { AdSenseScript } from '@/components/AdSenseScript'
import { EDITORIAL_LOCALE, type EditorialHub } from '@/lib/editorial'
import type { ListingTexts } from '@/lib/listingTexts'

interface HubPageProps {
  locale: string
  emoji: string
  heading: string
  /** Contenido editorial; solo se muestra en el locale en que está escrito (es). */
  hub?: EditorialHub
  stations: Station[]
  breadcrumbs: { name: string; url: string }[]
  texts: ListingTexts
}

function Paragraphs({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i} className={className}>
          {paragraph}
        </p>
      ))}
    </>
  )
}

/** Enlace interno con locale; el blog solo existe en español. */
function localizedHref(href: string, locale: string): string {
  return href.startsWith('/blog') ? `/es${href}` : `/${locale}${href}`
}

/**
 * Página hub de género o país: introducción editorial, listado de emisoras de Radio Browser,
 * secciones, preguntas frecuentes y enlaces relacionados.
 */
export function HubPage({ locale, emoji, heading, hub, stations, breadcrumbs, texts }: HubPageProps) {
  const editorial = hub && locale === EDITORIAL_LOCALE ? hub : undefined

  const faqSchema = editorial && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: editorial.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <main id="main-content" className="min-h-screen p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />

        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            <span className="mr-3" aria-hidden="true">{emoji}</span>
            {editorial?.h1 ?? heading}
          </h1>
          {stations.length > 0 && (
            <p className="font-broadcast text-xs text-neutral-500 tracking-wide">
              {texts.stationCount(stations.length)}
            </p>
          )}
        </header>

        {/* Anuncios solo donde hay texto propio (no en los listados en/fr/de) */}
        {editorial && <AdSenseScript />}

        {editorial && (
          <section className="mb-10 space-y-4">
            {editorial.intro.map((paragraph, i) => (
              <p key={i} className="text-neutral-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        )}

        {stations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stations.map((station) => (
              <StationGridItem
                key={station.id}
                station={{
                  id: station.id,
                  name: station.name,
                  slug: station.slug,
                  imageUrl: station.imageUrl,
                  country: station.country,
                  tags: station.tags,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-lg">{texts.noStations}</p>
            <Link
              href={`/${locale}/search`}
              className="mt-4 inline-block text-amber-400 hover:underline"
            >
              {texts.searchOther}
            </Link>
          </div>
        )}

        {editorial && (
          <>
            {editorial.sections.map((section) => (
              <section key={section.heading} className="mt-12">
                <h2 className="font-display text-2xl font-bold text-white mb-4">{section.heading}</h2>
                <div className="space-y-4">
                  <Paragraphs text={section.body} className="text-neutral-300 leading-relaxed" />
                </div>
              </section>
            ))}

            {editorial.faq.length > 0 && (
              <section className="mt-12">
                <h2 className="font-display text-2xl font-bold text-white mb-4">Preguntas frecuentes</h2>
                <div className="space-y-2">
                  {editorial.faq.map((item) => (
                    <details
                      key={item.q}
                      className="group bg-white/[0.04] border border-white/[0.06] open:border-amber-500/20 rounded-xl overflow-hidden"
                    >
                      <summary className="px-5 py-4 cursor-pointer list-none font-display text-sm font-semibold text-neutral-200 group-open:text-amber-400">
                        {item.q}
                      </summary>
                      <p className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {editorial.related.length > 0 && (
              <nav className="mt-12" aria-label="Contenido relacionado">
                <h2 className="font-display text-2xl font-bold text-white mb-4">También te puede interesar</h2>
                <ul className="flex flex-wrap gap-2">
                  {editorial.related.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={localizedHref(link.href, locale)}
                        className="inline-block px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07] text-sm text-neutral-300 hover:text-amber-400 hover:border-amber-500/20 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <p className="mt-10 font-broadcast text-[11px] text-neutral-600">
              Actualizado el{' '}
              <time dateTime={editorial.updatedAt}>
                {new Date(editorial.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </time>
            </p>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
          </>
        )}
      </div>
    </main>
  )
}
