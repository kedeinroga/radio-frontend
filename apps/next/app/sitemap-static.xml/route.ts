import { getAllBlogPosts } from '@/lib/blog-posts'
import { xmlResponse, type UrlEntry } from '@/lib/sitemap/xml'

export const dynamic = 'force-dynamic'

/**
 * GET /sitemap-static.xml
 * Páginas estáticas (home, search, favorites…) para todos los locales + blog (solo es).
 */
export async function GET(): Promise<Response> {
  const entries: UrlEntry[] = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/radio-online', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/search', priority: 0.8, changeFrequency: 'daily' },
    { path: '/favorites', priority: 0.7, changeFrequency: 'weekly' },
    // Blog: solo español
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly', locales: ['es'] },
    ...getAllBlogPosts().map(
      (post): UrlEntry => ({
        path: `/blog/${post.slug}`,
        priority: 0.7,
        changeFrequency: 'monthly',
        lastModified: new Date(post.updatedAt),
        locales: ['es'],
      })
    ),
  ]

  return xmlResponse(entries)
}
