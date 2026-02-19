import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug, getRelatedPosts, getAllBlogPosts } from '@/lib/blog-posts'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ locale: string; slug: string }> | { locale: string; slug: string }
}

// Pre-generate all known blog slugs at build time for static rendering
export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  const locales = ['es', 'en', 'fr', 'de']
  return locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug }))
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await Promise.resolve(params)
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return { title: 'Artículo no encontrado | Rradio' }
  }

  return {
    title: `${post.title} | Blog de Rradio`,
    description: post.description,
    authors: [{ name: 'Rradio' }],
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `${BASE_URL}/${locale}/blog/${slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ['https://rradio.online'],
      section: post.category,
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await Promise.resolve(params)
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(slug, 3)

  // Format date in Spanish
  const formattedDate = new Date(post.updatedAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* Article hero */}
      <div className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 pt-12 pb-6 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <Link href={`/${locale}`} className="hover:text-purple-600 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href={`/${locale}/blog`} className="hover:text-purple-600 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Category & meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-wide">
              {post.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {post.readingTime} min de lectura
            </span>
            <span className="text-xs text-gray-400">·</span>
            <time
              dateTime={post.updatedAt}
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              Actualizado: {formattedDate}
            </time>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white leading-tight mb-4">
            <span className="mr-3" role="img" aria-hidden="true">
              {post.coverEmoji}
            </span>
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {post.description}
          </p>
        </div>
      </div>

      {/* Article body */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        {post.sections.map((section, i) => (
          <section key={i} className="mb-10">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              {section.heading}
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {section.content.split('\n\n').map((para, j) => (
                <p
                  key={j}
                  className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4"
                  // Render bold (**text**) via simple replacement
                  dangerouslySetInnerHTML={{
                    __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              ))}
            </div>
          </section>
        ))}

        {/* FAQ */}
        {post.faq.length > 0 && (
          <section className="mb-12 bg-gray-50 dark:bg-gray-900 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-5">
              {post.faq.map((item, i) => (
                <div key={i}>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
                    {item.q}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related links */}
        {post.relatedLinks.length > 0 && (
          <div className="mb-12 border-t border-gray-200 dark:border-gray-800 pt-8">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Explorar en Rradio
            </h3>
            <div className="flex flex-wrap gap-3">
              {post.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                >
                  {link.label}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center mb-12">
          <p className="font-bold text-xl mb-2">¿Listo para escuchar?</p>
          <p className="text-sm opacity-90 mb-5">
            30.000+ emisoras de radio del mundo. Gratis y sin registro.
          </p>
          <Link
            href={`/${locale}`}
            className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Explorar emisoras populares
          </Link>
        </section>

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
              También te puede interesar
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/${locale}/blog/${related.slug}`}
                  className="group flex gap-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
                >
                  <span className="text-3xl flex-shrink-0 mt-1">{related.coverEmoji}</span>
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">
                      {related.category}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 leading-snug transition-colors">
                      {related.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Schema.org BlogPosting + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              url: `${BASE_URL}/${locale}/blog/${slug}`,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              author: {
                '@type': 'Organization',
                name: 'Rradio',
                url: BASE_URL,
              },
              publisher: {
                '@type': 'Organization',
                name: 'Rradio',
                logo: {
                  '@type': 'ImageObject',
                  url: `${BASE_URL}/icon-512.png`,
                },
              },
              articleSection: post.category,
              inLanguage: 'es',
              isPartOf: {
                '@type': 'Blog',
                name: 'Blog de Rradio',
                url: `${BASE_URL}/${locale}/blog`,
              },
            },
            ...(post.faq.length > 0
              ? [
                  {
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: post.faq.map((item) => ({
                      '@type': 'Question',
                      name: item.q,
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.a,
                      },
                    })),
                  },
                ]
              : []),
          ]),
        }}
      />
    </main>
  )
}
