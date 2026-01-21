import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * GET /api/admin/translations/[stationId]/[lang]
 * 
 * Gets a specific translation
 * Proxies to backend /admin/translations/{stationId}/{lang} endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string; lang: string }> }
) {
  const { stationId, lang } = await params
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMITS.ADMIN)
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('@radio-app:access_token')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Not authenticated' } },
      { status: 401 }
    )
  }
  
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    
    const response = await fetch(`${BACKEND_URL}/admin/translations/${stationId}/${lang}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error getting translation:', error)
    return NextResponse.json(
      { 
        error: { 
          code: 'internal_error', 
          message: error.message || 'Failed to get translation' 
        } 
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/translations/[stationId]/[lang]
 * 
 * Updates a translation
 * Proxies to backend /admin/translations/{stationId}/{lang} endpoint
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string; lang: string }> }
) {
  const { stationId, lang } = await params
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMITS.ADMIN)
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('@radio-app:access_token')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Not authenticated' } },
      { status: 401 }
    )
  }
  
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/admin/translations/${stationId}/${lang}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error updating translation:', error)
    return NextResponse.json(
      { 
        error: { 
          code: 'internal_error', 
          message: error.message || 'Failed to update translation' 
        } 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/translations/[stationId]/[lang]
 * 
 * Deletes a translation
 * Proxies to backend /admin/translations/{stationId}/{lang} endpoint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string; lang: string }> }
) {
  const { stationId, lang } = await params
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMITS.ADMIN)
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('@radio-app:access_token')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Not authenticated' } },
      { status: 401 }
    )
  }
  
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    
    const response = await fetch(`${BACKEND_URL}/admin/translations/${stationId}/${lang}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error deleting translation:', error)
    return NextResponse.json(
      { 
        error: { 
          code: 'internal_error', 
          message: error.message || 'Failed to delete translation' 
        } 
      },
      { status: 500 }
    )
  }
}
