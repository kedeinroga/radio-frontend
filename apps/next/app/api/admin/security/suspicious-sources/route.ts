import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/admin/security/suspicious-sources?period=24h
 * Proxy al backend con forwarding del query param ?period
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const period = request.nextUrl.searchParams.get('period') || '24h'
    const backendPath = `/admin/security/suspicious-sources?period=${period}`

    const data = await backendHttpClient.get(backendPath, {
      headers: { Authorization: `Bearer ${accessToken}` },
      skipSecret: true,
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Admin API error (/admin/security/suspicious-sources):', error)
    return NextResponse.json(
      { error: 'Failed to load suspicious sources', message: error.message },
      { status: error.status || 500 }
    )
  }
}
