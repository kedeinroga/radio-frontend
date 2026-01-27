import { NextRequest } from 'next/server'
import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

/**
 * GET /api/admin/seo/refresh-stats
 * Refresh SEO statistics
 */
export const GET = createAdminProxyHandler('/admin/seo/refresh-stats', 'GET')
