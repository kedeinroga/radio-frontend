import { getAllBlogPosts } from '@/lib/blog-posts'
import { xmlResponse, type UrlEntry } from '@/lib/sitemap/xml'

export const dynamic = 'force-dynamic'

/**
 * GET /sitemap-static.xml
 * Páginas indexables: home, hub, legales/institucionales para todos los locales + blog (solo es).
 */
export async function GET(): Promise<Response> {
  const entries: UrlEntry[] = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/radio-online', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/dmca', priority: 0.3, changeFrequency: 'yearly' },
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
