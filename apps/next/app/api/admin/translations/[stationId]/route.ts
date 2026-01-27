import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/admin/translations/[stationId]
 * Get all translations for a specific station
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { stationId: string } }
) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { stationId } = params

    const data = await backendHttpClient.get(`/admin/translations/${stationId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to get translations:', error)

    return NextResponse.json(
      {
        error: 'Failed to get translations',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}
