import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/admin/translations/[stationId]/[lang]
 * Get translation for specific station and language
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { stationId: string; lang: string } }
) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { stationId, lang } = params

    const data = await backendHttpClient.get(
      `/admin/translations/${stationId}/${lang}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to get translation:', error)

    return NextResponse.json(
      {
        error: 'Failed to get translation',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}

/**
 * PUT /api/admin/translations/[stationId]/[lang]
 * Update translation for specific station and language
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { stationId: string; lang: string } }
) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { stationId, lang } = params
    const body = await request.json()

    const data = await backendHttpClient.put(
      `/admin/translations/${stationId}/${lang}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to update translation:', error)

    return NextResponse.json(
      {
        error: 'Failed to update translation',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}

/**
 * DELETE /api/admin/translations/[stationId]/[lang]
 * Delete translation for specific station and language
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { stationId: string; lang: string } }
) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { stationId, lang } = params

    const data = await backendHttpClient.delete(
      `/admin/translations/${stationId}/${lang}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to delete translation:', error)

    return NextResponse.json(
      {
        error: 'Failed to delete translation',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}
