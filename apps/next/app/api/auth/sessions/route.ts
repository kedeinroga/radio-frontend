import { NextRequest } from 'next/server'
import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

/**
 * GET /api/auth/sessions
 * List user sessions
 */
export const GET = createAdminProxyHandler('/auth/sessions', 'GET')
