import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * DELETE /api/auth/sessions/[sessionId]
 * Delete a specific session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { sessionId } = params

    await backendHttpClient.delete(`/auth/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    })
  } catch (error: any) {
    console.error('Failed to delete session:', error)

    return NextResponse.json(
      {
        error: 'Failed to delete session',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}
