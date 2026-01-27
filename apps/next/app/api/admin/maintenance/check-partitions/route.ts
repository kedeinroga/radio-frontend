import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

export const GET = createAdminProxyHandler('/admin/maintenance/check-partitions', 'GET')
