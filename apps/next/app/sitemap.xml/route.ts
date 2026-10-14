import { getAllBlogPosts } from '@/lib/blog-posts'
import { GENRE_HUBS, COUNTRY_HUBS, EDITORIAL_LOCALE, type EditorialHub } from '@/lib/editorial'
import { xmlResponse, type UrlEntry } from '@/lib/sitemap/xml'

export const dynamic = 'force-dynamic'

/**
 * GET /sitemap.xml
 * Páginas indexables: home, hub, legales/institucionales para todos los locales + blog y hubs
 * editoriales revisados (solo es).
 * Es un <urlset> directo: con un solo grupo de URLs no hace falta un <sitemapindex>.
 */
function hubEntries(hubs: EditorialHub[], basePath: string): UrlEntry[] {
  return hubs
    .filter((hub) => hub.reviewed)
    .map((hub) => ({
      path: `${basePath}/${hub.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: new Date(hub.updatedAt),
      locales: [EDITORIAL_LOCALE],
    }))
}

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
    // Hubs de género y país: solo los revisados, en su idioma (ver isHubIndexable)
    ...hubEntries(GENRE_HUBS, '/genre'),
    ...hubEntries(COUNTRY_HUBS, '/country'),
  ]

  return xmlResponse(entries)
}
