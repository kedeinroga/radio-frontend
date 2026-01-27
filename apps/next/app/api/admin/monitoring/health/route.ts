import { NextRequest } from 'next/server'
import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

/**
 * GET /api/admin/monitoring/health
 * Get system health metrics
 */
export const GET = createAdminProxyHandler('/admin/monitoring/health', 'GET')
