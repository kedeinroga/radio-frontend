/**
 * ads.txt Validation API
 * 
 * Valida que el archivo ads.txt existe y es accesible.
 * También parsea el contenido para verificar que tiene el formato correcto.
 * 
 * GET /api/ads-txt/validate
 * 
 * Response:
 * {
 *   valid: boolean
 *   url: string
 *   entries: number
 *   errors?: string[]
 *   warnings?: string[]
 *   content?: string
 * }
 */

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface AdsTxtEntry {
  domain: string
  publisherId: string
  relationship: 'DIRECT' | 'RESELLER'
  certAuthorityId?: string
  lineNumber: number
  raw: string
}

interface AdsTxtValidationResult {
  valid: boolean
  url: string
  entries?: number
  parsedEntries?: AdsTxtEntry[]
  variables?: Record<string, string>
  errors?: string[]
  warnings?: string[]
  content?: string
}

/**
 * Parse ads.txt line
 */
function parseAdsTxtLine(line: string, lineNumber: number): AdsTxtEntry | null {
  // Remove comments and trim
  const cleanLine = line.split('#')[0].trim()
  if (!cleanLine) return null

  const parts = cleanLine.split(',').map(p => p.trim())
  
  if (parts.length < 3) {
    throw new Error(`Line ${lineNumber}: Invalid format. Expected at least 3 fields (domain, publisher_id, relationship)`)
  }

  const [domain, publisherId, relationship, certAuthorityId] = parts

  if (relationship !== 'DIRECT' && relationship !== 'RESELLER') {
    throw new Error(`Line ${lineNumber}: Invalid relationship "${relationship}". Must be DIRECT or RESELLER`)
  }

  return {
    domain,
    publisherId,
    relationship: relationship as 'DIRECT' | 'RESELLER',
    certAuthorityId,
    lineNumber,
    raw: cleanLine,
  }
}

/**
 * Parse ads.txt content
 */
function parseAdsTxt(content: string): {
  entries: AdsTxtEntry[]
  variables: Record<string, string>
  errors: string[]
  warnings: string[]
} {
  const entries: AdsTxtEntry[] = []
  const variables: Record<string, string> = {}
  const errors: string[] = []
  const warnings: string[] = []

  const lines = content.split('\n')

  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmedLine = line.trim()

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return
    }

    try {
      // Check for variables (contact, subdomain, etc.)
      if (trimmedLine.includes('=')) {
        const [key, value] = trimmedLine.split('=').map(s => s.trim())
        variables[key] = value
        return
      }

      // Parse regular entry
      const entry = parseAdsTxtLine(trimmedLine, lineNumber)
      if (entry) {
        entries.push(entry)

        // Validations
        if (!entry.domain.includes('.')) {
          warnings.push(`Line ${lineNumber}: Domain "${entry.domain}" may be invalid`)
        }

        if (entry.relationship === 'DIRECT' && !entry.certAuthorityId) {
          warnings.push(`Line ${lineNumber}: DIRECT relationship without certification authority ID`)
        }
      }
    } catch (error) {
      errors.push(String(error))
    }
  })

  // Check for required contact field
  if (!variables.contact) {
    warnings.push('No contact information found. Consider adding: contact=ads@yourdomain.com')
  }

  return { entries, variables, errors, warnings }
}

/**
 * GET /api/ads-txt/validate
 */
export async function GET() {
  try {
    const adsTxtPath = path.join(process.cwd(), 'public', 'ads.txt')
    
    // Check if file exists
    if (!fs.existsSync(adsTxtPath)) {
      const result: AdsTxtValidationResult = {
        valid: false,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ads.txt`,
        errors: ['ads.txt file not found in public directory'],
      }
      return NextResponse.json(result, { status: 404 })
    }

    // Read file content
    const content = fs.readFileSync(adsTxtPath, 'utf-8')

    // Parse and validate content
    const { entries, variables, errors, warnings } = parseAdsTxt(content)

    // Build response
    const result: AdsTxtValidationResult = {
      valid: errors.length === 0,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ads.txt`,
      entries: entries.length,
      parsedEntries: entries,
      variables,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      content: process.env.NODE_ENV === 'development' ? content : undefined,
    }

    return NextResponse.json(result, { 
      status: errors.length > 0 ? 400 : 200 
    })

  } catch (error) {
    const result: AdsTxtValidationResult = {
      valid: false,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/ads.txt`,
      errors: [`Internal error: ${String(error)}`],
    }
    return NextResponse.json(result, { status: 500 })
  }
}
