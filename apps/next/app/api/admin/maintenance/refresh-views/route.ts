import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

export const POST = createAdminProxyHandler('/admin/maintenance/refresh-views', 'POST')
