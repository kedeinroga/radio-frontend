import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * Dynamic catch-all admin route
 * 
 * Handles all admin API requests not covered by specific routes.
 * Proxies requests to backend with authentication.
 * 
 * Examples:
 * - /api/admin/users → /admin/users
 * - /api/admin/reports/monthly → /admin/reports/monthly
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleAdminRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleAdminRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleAdminRequest(request, params, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleAdminRequest(request, params, 'DELETE')
}

async function handleAdminRequest(
  request: NextRequest,
  params: { path: string[] },
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Construct backend path from dynamic segments
    // ✅ Next.js 15: params must be awaited
    const { path } = await params
    const backendPath = `/admin/${path.join('/')}`

    // Get query params
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const fullPath = queryString ? `${backendPath}?${queryString}` : backendPath

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    }

    let data: any

    // Handle different HTTP methods
    switch (method) {
      case 'GET':
        data = await backendHttpClient.get(fullPath, { headers })
        break
      case 'POST':
        const postBody = await request.json().catch(() => ({}))
        data = await backendHttpClient.post(backendPath, postBody, { headers })
        break
      case 'PUT':
        const putBody = await request.json().catch(() => ({}))
        data = await backendHttpClient.put(backendPath, putBody, { headers })
        break
      case 'DELETE':
        data = await backendHttpClient.delete(fullPath, { headers })
        break
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error(`Admin API error (${method}):`, error)

    return NextResponse.json(
      {
        error: `Failed to ${method} admin resource`,
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}
