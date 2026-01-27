import { createAdminProxyHandler } from '@/lib/api/adminProxyHelper'

export const POST = createAdminProxyHandler('/admin/maintenance/cleanup-partitions', 'POST')
