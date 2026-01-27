import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/subscription/status
 * Get subscription status
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await backendHttpClient.get('/subscription/status', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to get subscription status:', error)

    return NextResponse.json(
      {
        error: 'Failed to get subscription status',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}
