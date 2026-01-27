import { NextRequest } from 'next/server'
import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

/**
 * GET /api/admin/security/logs
 * Get security logs
 */
export const GET = createAdminProxyHandler('/admin/security/logs', 'GET')
