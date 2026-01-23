import { NextRequest, NextResponse } from 'next/server'

/**
 * CSP Violation Reporting Endpoint
 * 
 * Receives and logs Content Security Policy violation reports
 * from browsers when CSP rules are violated.
 * 
 * Useful for:
 * - Monitoring security issues
 * - Debugging CSP configuration
 * - Detecting XSS attempts
 * - Tracking unauthorized resource loading
 */

/**
 * CSP Violation Report Structure
 */
interface CSPViolationReport {
  'csp-report': {
    'document-uri': string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    'disposition': 'enforce' | 'report'
    'blocked-uri': string
    'line-number'?: number
    'column-number'?: number
    'source-file'?: string
    'status-code'?: number
    'script-sample'?: string
    'referrer'?: string
  }
}

/**
 * POST handler for CSP violation reports
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the report
    const report: CSPViolationReport = await request.json()
    
    if (!report || !report['csp-report']) {
      return NextResponse.json(
        { error: 'Invalid CSP report format' },
        { status: 400 }
      )
    }
    
    const cspReport = report['csp-report']
    
    // Extract useful information
    const violationInfo = {
      timestamp: new Date().toISOString(),
      documentUri: cspReport['document-uri'],
      violatedDirective: cspReport['violated-directive'],
      effectiveDirective: cspReport['effective-directive'],
      blockedUri: cspReport['blocked-uri'],
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      scriptSample: cspReport['script-sample'],
      disposition: cspReport.disposition,
      referrer: cspReport.referrer,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {

      if (violationInfo.sourceFile) {

      }
      if (violationInfo.scriptSample) {

      }

    }
    
    // In production, you would send this to your logging service
    // Examples:
    // - Sentry: Sentry.captureException(new Error('CSP Violation'), { extra: violationInfo })
    // - DataDog: logger.error('CSP Violation', violationInfo)
    // - CloudWatch: await cloudwatch.putLogEvents(violationInfo)
    
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service
      // await sendToLoggingService(violationInfo)
      
      // For now, just log to console (will appear in server logs)

    }
    
    // Check for common issues and provide hints
    const hints = analyzeViolation(cspReport)
    if (hints.length > 0 && process.env.NODE_ENV === 'development') {

      hints.forEach(hint =>)

    }
    
    // Always return 204 No Content to browsers
    return new NextResponse(null, { status: 204 })
    
  } catch (error) {

    // Still return 204 to not reveal internal errors
    return new NextResponse(null, { status: 204 })
  }
}

/**
 * Analyze violation and provide helpful hints
 */
function analyzeViolation(report: CSPViolationReport['csp-report']): string[] {
  const hints: string[] = []
  const directive = report['effective-directive']
  const blockedUri = report['blocked-uri']
  
  // Inline script violations
  if (directive === 'script-src' && blockedUri === 'inline') {
    hints.push('Inline script blocked. Use nonce attribute: <script nonce={nonce}>...</script>')
    hints.push('Or move script to external file with proper CSP headers')
  }
  
  // Inline style violations
  if (directive === 'style-src' && blockedUri === 'inline') {
    hints.push('Inline style blocked. Use nonce attribute: <style nonce={nonce}>...</style>')
    hints.push('Or use CSS-in-JS library that supports CSP nonces')
  }
  
  // External resource violations
  if (blockedUri && blockedUri !== 'inline' && blockedUri !== 'eval') {
    const domain = extractDomain(blockedUri)
    if (domain) {
      hints.push(`External resource blocked: ${domain}`)
      hints.push(`Add '${domain}' to TRUSTED_DOMAINS.${guessDomainCategory(directive)} in lib/csp.ts`)
    }
  }
  
  // Eval violations
  if (blockedUri === 'eval') {
    hints.push("'unsafe-eval' is blocked (good for security)")
    hints.push('Avoid using eval(), Function() constructor, or setTimeout with strings')
  }
  
  // Data URI violations
  if (blockedUri.startsWith('data:')) {
    hints.push('Data URI blocked. Add "data:" to the directive if needed')
  }
  
  // Blob URI violations
  if (blockedUri.startsWith('blob:')) {
    hints.push('Blob URI blocked. Add "blob:" to the directive if needed')
  }
  
  return hints
}

/**
 * Extract domain from URI
 */
function extractDomain(uri: string): string | null {
  try {
    const url = new URL(uri)
    return `${url.protocol}//${url.host}`
  } catch {
    return null
  }
}

/**
 * Guess which TRUSTED_DOMAINS category a directive belongs to
 */
function guessDomainCategory(directive: string): string {
  const mapping: Record<string, string> = {
    'script-src': 'analytics or cdn',
    'style-src': 'cdn',
    'img-src': 'imageHosts',
    'connect-src': 'analytics or adServers',
    'media-src': 'audioStreaming',
    'frame-src': 'stripe',
  }
  
  return mapping[directive] || 'appropriate category'
}

/**
 * GET handler - return info about CSP reporting
 */
export async function GET() {
  return NextResponse.json({
    name: 'CSP Violation Reporting Endpoint',
    description: 'Receives and logs Content Security Policy violation reports from browsers',
    status: 'active',
    environment: process.env.NODE_ENV,
    note: 'This endpoint only accepts POST requests with CSP violation reports',
  })
}

// Prevent caching of CSP reports
export const dynamic = 'force-dynamic'

