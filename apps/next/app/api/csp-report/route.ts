import { NextRequest, NextResponse } from 'next/server'

/**
 * CSP Violation Report Endpoint
 * 
 * Receives and logs Content Security Policy violations
 * This endpoint helps monitor CSP issues during development and production
 */
export async function POST(request: NextRequest) {
  try {
    const report = await request.json()
    
    // Log CSP violation in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 CSP Violation Report:', JSON.stringify(report, null, 2))
    }
    
    // In production, you might want to send this to a logging service
    // Example: Sentry, LogRocket, or your own analytics service
    // await logToService(report)
    
    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error) {
    console.error('Error processing CSP report:', error)
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 })
  }
}

// Prevent caching of CSP reports
export const dynamic = 'force-dynamic'
