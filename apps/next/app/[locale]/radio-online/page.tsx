import { Metadata } from 'next'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { GenreGrid } from '@/components/GenreGrid'
import { CountryGrid } from '@/components/CountryGrid'

import esTranslations from '@/i18n/locales/es.json'
import enTranslations from '@/i18n/locales/en.json'
import frTranslations from '@/i18n/locales/fr.json'
import deTranslations from '@/i18n/locales/de.json'

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



interface PageProps {
  params: Promise<{ locale: string }> | { locale: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  const t = getTranslations(locale)
  
  // Fallback to Spanish
  const content = t?.radioOnline || getTranslations('es')?.radioOnline
  if (!content) return {}

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      type: 'article',
    },
    alternates: {
      canonical: `/${locale}/radio-online`,
      languages: {
        'es': '/es/radio-online',
        'en': '/en/radio-online',
        'fr': '/fr/radio-online',
        'de': '/de/radio-online',
      }
    }
  }
}

export default async function RadioOnlinePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  
  const t = getTranslations(locale)
  // Fallback to Spanish if translation is missing for the current locale
  let content = t?.radioOnline

  if (!content) {
    // Try fallback to Spanish
    const tEs = getTranslations('es')
    content = tEs?.radioOnline
  }

  if (!content || t?._error) {
    const debugInfo = {
      error: t?._error,
      stack: t?._stack,
      contentSnippet: t?._debug_snippet, // Show file end content
      cwd: process.cwd(),


      locale,
      pathsTried: [
        path.join(process.cwd(), 'apps/next/i18n/locales', `${locale}.json`),
        path.join(process.cwd(), 'i18n/locales', `${locale}.json`),
        path.join(process.cwd(), 'src/i18n/locales', `${locale}.json`)
      ],
      // @ts-ignore
      fsExists: typeof fs.existsSync === 'function',
      absolutePathAttempt: '/Users/kedeinroga/Documents/emprende/radio-front/apps/next/i18n/locales/es.json',
      absoluteExists: fs.existsSync('/Users/kedeinroga/Documents/emprende/radio-front/apps/next/i18n/locales/es.json')
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black p-8">
        <div className="text-left p-8 bg-white shadow-xl rounded-xl max-w-2xl w-full border border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-600">⚠️ Content Unavailable</h2>
        </div>
      </div>
    )
  }

  // Convert objects to arrays for mapping
  // Safety check for benefits.items
  const benefitItems = content.benefits?.items ? Object.values(content.benefits.items) : []
  const faqItems = content.faq?.items ? Object.values(content.faq.items) : []

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-4">
            {content.h1}
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            {content.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-8 py-12">
        {/* Introduction */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {content.intro.title}
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {content.intro.content.split('\n\n').map((paragraph: string, i: number) => (
              <p key={i} className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            {content.benefits.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefitItems.map((item: any, i: number) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="mb-16 bg-purple-50 dark:bg-gray-800 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {content.how.title}
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {content.how.content.split('\n\n').map((paragraph: string, i: number) => (
              <p key={i} className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Cultural Bridge */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {content.cultural.title}
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {content.cultural.content.split('\n\n').map((paragraph: string, i: number) => (
              <p key={i} className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Genres */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            {content.genres.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {content.genres.description}
          </p>
          <GenreGrid locale={locale} />
        </section>

        {/* Countries */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            {content.countries.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {content.countries.description}
          </p>
          <CountryGrid locale={locale} />
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            {content.faq.title}
          </h2>
          <div className="space-y-6">
            {faqItems.map((item: any, i: number) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  {item.q}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">{content.cta.title}</h2>
          <p className="text-lg mb-8 opacity-90">{content.cta.description}</p>
          <Link
            href={`/${locale}/search`}
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            {content.cta.button}
          </Link>
        </section>
      </article>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": content.h1,
            "description": content.description,
            "author": {
              "@type": "Organization",
              "name": "Rradio"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Rradio",
              "logo": {
                "@type": "ImageObject",
                "url": "https://rradio.online/icon-512.png"
              }
            },
            "datePublished": "2026-01-27",
            "dateModified": "2026-01-27"
          })
        }}
      />
    </main>
  )
}
