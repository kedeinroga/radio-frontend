import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ locale: string }> | { locale: string }
}

// ISR: Revalidate daily
export const revalidate = 86400

/**
 * Generate metadata for About page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  
  return {
    title: locale === 'es' ? 'Acerca de Rradio | Tu Ventana al Mundo' : 'About Rradio | Your Window to the World',
    description: locale === 'es' 
      ? 'Conoce la historia, misión y tecnología detrás de Rradio. Conectando culturas a través de la radio online desde 2024.'
      : 'Learn about the story, mission, and technology behind Rradio. Connecting cultures through online radio since 2024.',
    robots: {
      index: true,
      follow: true,
    },
  }
}

/**
 * About Page
 * Multi-language, original content for SEO value
 */
export default async function AboutPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  
  // Import translations dynamically
  const t = await import(`@/i18n/locales/${locale}.json`).then(m => m.default)

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <article className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.about?.title || 'Acerca de Rradio'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t.about?.subtitle || 'Tu ventana al mundo a través de la radio online'}
          </p>
        </header>

        {/* Mission */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            {t.about?.mission?.title || 'Nuestra Misión'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {t.about?.mission?.content}
          </p>
        </section>

        {/* Story */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            {t.about?.story?.title || 'Nuestra Historia'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {t.about?.story?.content}
          </p>
        </section>

        {/* Values */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
            {t.about?.values?.title || 'Nuestros Valores'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(t.about?.values?.items || {}).map(([key, value]: [string, any]) => (
              <div key={key} className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            {t.about?.team?.title || 'El Equipo'}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {t.about?.team?.content}
          </p>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-semibold mb-4">
            {t.about?.contact_cta?.title || '¿Tienes Preguntas?'}
          </h2>
          <p className="text-purple-100 mb-6">
            {t.about?.contact_cta?.description || 'Estamos aquí para ayudarte. Contáctanos en cualquier momento.'}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-block px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t.about?.contact_cta?.button || 'Ir a Contacto'}
          </a>
        </section>

        {/* Back Link */}
        <footer className="mt-8 text-center">
          <a
            href={`/${locale}`}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium inline-flex items-center gap-2"
          >
            ← {t.common?.back || 'Volver al inicio'}
          </a>
        </footer>
      </article>
    </main>
  )
}
