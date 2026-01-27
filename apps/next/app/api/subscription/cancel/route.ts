import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * POST /api/subscription/cancel
 * Cancel subscription
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))

    const data = await backendHttpClient.post('/subscription/cancel', body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error)

    return NextResponse.json(
      {
        error: 'Failed to cancel subscription',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}
