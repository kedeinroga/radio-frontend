/**
 * Build Configuration
 * Checks if we're in a build environment and if API is accessible
 */

export const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
export const hasApiUrl = !!process.env.NEXT_PUBLIC_API_URL

/**
 * Check if we should skip API calls during build
 * Use this in generateStaticParams and data fetching functions
 */
export const shouldSkipApiCalls = (): boolean => {
  // Skip API calls during build if no API URL is configured
  if (isBuildTime && !hasApiUrl) {
    console.log('[Build] Skipping API calls - no API URL configured')
    return true
  }
  return false
}
