import Link from 'next/link'
import { Metadata } from 'next'
import { getAllBlogPosts } from '@/lib/blog-posts'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ locale: string }> | { locale: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'

  return {
    title: 'Blog sobre Radio Online | Guías, Consejos y Cultura Musical | Rradio',
    description:
      'Artículos, guías y curiosidades sobre radio online. Aprende cómo escuchar radio gratis, los mejores géneros, historia de la radio y mucho más.',
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
    },
    openGraph: {
      title: 'Blog de Rradio – Radio Online, Música y Cultura',
      description:
        'Guías prácticas y artículos sobre radio online gratis. Todo lo que necesitas saber para disfrutar de miles de emisoras del mundo.',
      type: 'website',
      url: `${BASE_URL}/${locale}/blog`,
    },
  }
}

export default async function BlogListPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  const posts = getAllBlogPosts()

  // Group posts by category
  const categories = Array.from(new Set(posts.map((p) => p.category)))

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider mb-3">
            Blog de Rradio
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Guías y Artículos sobre Radio Online
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Todo lo que necesitas saber para aprovechar al máximo las más de 30.000 emisoras de radio del
            mundo disponibles en Rradio.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Category filter */}
        <div className="flex flex-wrap gap-3 mb-10">
          <span className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium">
            Todos
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Posts grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Cover / emoji header */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-8 text-center">
                <span className="text-6xl" role="img" aria-hidden="true">
                  {post.coverEmoji}
                </span>
              </div>

              <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {post.readingTime} min de lectura
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  <Link href={`/${locale}/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                {/* Description */}
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">
                  {post.description}
                </p>

                {/* Read more */}
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Leer artículo
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">¿Listo para escuchar?</h2>
          <p className="text-base mb-6 opacity-90">
            Más de 30.000 emisoras de todo el mundo, gratis y sin registro.
          </p>
          <Link
            href={`/${locale}`}
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
          >
            Explorar estaciones populares
          </Link>
        </section>
      </div>

      {/* Schema.org Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Blog de Rradio',
            description:
              'Guías y artículos sobre radio online, géneros musicales y cultura de la radio.',
            url: `${BASE_URL}/${locale}/blog`,
            publisher: {
              '@type': 'Organization',
              name: 'Rradio',
              logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/icon-512.png`,
              },
            },
            blogPost: posts.map((post) => ({
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              url: `${BASE_URL}/${locale}/blog/${post.slug}`,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              author: {
                '@type': 'Organization',
                name: 'Rradio',
              },
            })),
          }),
        }}
      />
    </main>
  )
}
