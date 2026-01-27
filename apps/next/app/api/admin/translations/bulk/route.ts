import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

export const POST = createAdminProxyHandler('/admin/translations/bulk', 'POST')
