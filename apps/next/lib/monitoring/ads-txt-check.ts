/**
 * ads.txt Health Check
 * 
 * Utility para verificar que el archivo ads.txt está disponible y correctamente configurado.
 * Útil para monitoring y healthchecks automáticos.
 */

export interface AdsTxtHealthCheck {
  available: boolean
  url: string
  statusCode?: number
  contentType?: string
  hasContent: boolean
  errors?: string[]
}

/**
 * Check if ads.txt is accessible
 */
export async function checkAdsTxt(siteUrl?: string): Promise<AdsTxtHealthCheck> {
  const baseUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const adsTxtUrl = `${baseUrl}/ads.txt`

  try {
    const response = await fetch(adsTxtUrl, {
      method: 'HEAD',
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type')

    // If HEAD request succeeds, do a GET to check content
    let hasContent = false
    if (response.ok) {
      const getResponse = await fetch(adsTxtUrl, {
        cache: 'no-store',
      })
      const content = await getResponse.text()
      hasContent = content.trim().length > 0
    }

    return {
      available: response.ok,
      url: adsTxtUrl,
      statusCode: response.status,
      contentType: contentType || undefined,
      hasContent,
      errors: !response.ok ? [`HTTP ${response.status}: ${response.statusText}`] : undefined,
    }
  } catch (error) {
    return {
      available: false,
      url: adsTxtUrl,
      hasContent: false,
      errors: [`Failed to fetch: ${String(error)}`],
    }
  }
}

/**
 * Validate ads.txt format
 */
export async function validateAdsTxtFormat(siteUrl?: string): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
}> {
  const baseUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${baseUrl}/api/ads-txt/validate`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return {
        valid: false,
        errors: [`Validation API returned ${response.status}`],
        warnings: [],
      }
    }

    const result = await response.json()

    return {
      valid: result.valid,
      errors: result.errors || [],
      warnings: result.warnings || [],
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`Validation failed: ${String(error)}`],
      warnings: [],
    }
  }
}

/**
 * Complete ads.txt health check (availability + format validation)
 */
export async function fullAdsTxtCheck(siteUrl?: string): Promise<{
  healthy: boolean
  availability: AdsTxtHealthCheck
  validation: {
    valid: boolean
    errors: string[]
    warnings: string[]
  }
}> {
  const [availability, validation] = await Promise.all([
    checkAdsTxt(siteUrl),
    validateAdsTxtFormat(siteUrl),
  ])

  return {
    healthy: availability.available && validation.valid,
    availability,
    validation,
  }
}
