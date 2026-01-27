import { NextRequest } from 'next/server'
import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

/**
 * GET /api/admin/security/metrics
 * Get security metrics
 */
export const GET = createAdminProxyHandler('/admin/security/metrics', 'GET')
