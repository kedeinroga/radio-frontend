import { NextRequest } from 'next/server'
import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

/**
 * GET /api/admin/monitoring/alerts
 * Get system alerts
 */
export const GET = createAdminProxyHandler('/admin/monitoring/alerts', 'GET')
