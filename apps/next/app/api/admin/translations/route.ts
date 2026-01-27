import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

/**
 * GET /api/admin/translations
 * List all translations
 */
export const GET = createAdminProxyHandler('/admin/translations', 'GET')

/**
 * POST /api/admin/translations
 * Create new translation
 */
export const POST = createAdminProxyHandler('/admin/translations', 'POST')
