'use client'

/**
 * AdClickHandler Component
 * 
 * Componente especializado para manejar clicks en anuncios con protección CSRF.
 * Proporciona una capa adicional de seguridad y validación antes de registrar clicks.
 * 
 * Características:
 * - Protección CSRF integrada
 * - Validación de URLs antes de redirigir
 * - Tracking de clicks con fraud detection
 * - Manejo de errores graceful
 * - Doble validación de sanitización
 * - Loading states durante tracking
 * 
 * @example
 * ```tsx
 * <AdClickHandler
 *   ad={advertisement}
 *   impressionId="imp-123"
 *   onClickTracked={(result) =>}
 *   onError={(error) =>}
 * >
 *   {(handleClick, isTracking) => (
 *     <button onClick={handleClick} disabled={isTracking}>
 *       Click Me
 *     </button>
 *   )}
 * </AdClickHandler>
 * ```
 */

import { useState, useCallback } from 'react'
import type { Advertisement } from '@radio-app/app'
import { sanitizeAdUrl } from '@radio-app/app'
import { useCSRFToken } from '../../lib/csrf'

/**
 * Resultado del tracking de click
 */
export interface ClickTrackingResult {
  success: boolean
  clickId?: string
  fraudScore?: number
  error?: string
}

/**
 * Props para AdClickHandler
 */
export interface AdClickHandlerProps {
  /** El anuncio que se está clickeando */
  ad: Advertisement
  
  /** ID de la impresión asociada (requerido para tracking) */
  impressionId: string
  
  /** 
   * Callback cuando el click se trackea exitosamente
   * @param result - Resultado del tracking incluyendo clickId y fraudScore
   */
  onClickTracked?: (result: ClickTrackingResult) => void
  
  /** 
   * Callback cuando ocurre un error
   * @param error - Descripción del error
   */
  onError?: (error: string) => void
  
  /**
   * Si debe abrir el link automáticamente después de trackear
   * @default true
   */
  openAfterTracking?: boolean
  
  /**
   * Target para el link (_blank, _self, etc)
   * @default '_blank'
   */
  linkTarget?: string
  
  /**
   * Render prop que recibe la función handleClick y el estado isTracking
   */
  children: (
    handleClick: (e?: React.MouseEvent) => Promise<void>,
    isTracking: boolean
  ) => React.ReactNode
}

/**
 * AdClickHandler Component
 * 
 * Maneja clicks en anuncios con protección CSRF y validación de seguridad.
 */
export function AdClickHandler({
  ad,
  impressionId,
  onClickTracked,
  onError,
  openAfterTracking = true,
  linkTarget = '_blank',
  children,
}: AdClickHandlerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const csrfToken = useCSRFToken()

  /**
   * Maneja el click en el anuncio
   */
  const handleClick = useCallback(async (e?: React.MouseEvent) => {
    // Prevenir navegación por defecto
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // No permitir clicks múltiples mientras se está trackeando
    if (isTracking) {
      return
    }

    // Validación de requisitos
    if (!impressionId) {
      const error = 'Cannot track click without impressionId'

      onError?.(error)
      return
    }

    if (!csrfToken) {
      const error = 'CSRF token not available. Cannot track click.'

      onError?.(error)
      return
    }

    // Doble validación de URL
    const sanitizedUrl = sanitizeAdUrl(ad.clickUrl)
    if (!sanitizedUrl) {
      const error = 'Invalid or unsafe ad URL'

      onError?.(error)
      return
    }

    setIsTracking(true)

    try {
      // Trackear el click con CSRF protection
      const response = await fetch('/api/ads/track/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          advertisementId: ad.id,
          impressionId,
          context: {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            // Datos adicionales para fraud detection
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()

      // Resultado exitoso
      const trackingResult: ClickTrackingResult = {
        success: true,
        clickId: result.clickId,
        fraudScore: result.fraudDetection?.riskScore,
      }

      onClickTracked?.(trackingResult)

      // Abrir el link si está configurado
      if (openAfterTracking && sanitizedUrl) {
        const windowFeatures = linkTarget === '_blank' 
          ? 'noopener,noreferrer' 
          : undefined
        
        window.open(sanitizedUrl, linkTarget, windowFeatures)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      const trackingResult: ClickTrackingResult = {
        success: false,
        error: errorMessage,
      }

      onClickTracked?.(trackingResult)
      onError?.(errorMessage)

      // En caso de error, aún podemos permitir la navegación si el usuario
      // realmente quería ir al link (pero sin tracking)
      if (openAfterTracking && sanitizedUrl) {

        window.open(sanitizedUrl, linkTarget, 'noopener,noreferrer')
      }

    } finally {
      setIsTracking(false)
    }
  }, [
    ad.id,
    ad.clickUrl,
    impressionId,
    csrfToken,
    isTracking,
    onClickTracked,
    onError,
    openAfterTracking,
    linkTarget,
  ])

  return <>{children(handleClick, isTracking)}</>
}

/**
 * Hook simplificado para usar AdClickHandler sin el render prop
 * 
 * @example
 * ```tsx
 * const { handleClick, isTracking } = useAdClickHandler({
 *   ad: advertisement,
 *   impressionId: 'imp-123',
 *   onClickTracked: (result) =>* })
 * 
 * return <button onClick={handleClick} disabled={isTracking}>Click</button>
 * ```
 */
export function useAdClickHandler({
  ad,
  impressionId,
  onClickTracked,
  onError,
  openAfterTracking = true,
  linkTarget = '_blank',
}: Omit<AdClickHandlerProps, 'children'>) {
  const [isTracking, setIsTracking] = useState(false)
  const csrfToken = useCSRFToken()

  const handleClick = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (isTracking) return

    if (!impressionId) {
      const error = 'Cannot track click without impressionId'

      onError?.(error)
      return
    }

    if (!csrfToken) {
      const error = 'CSRF token not available'

      onError?.(error)
      return
    }

    const sanitizedUrl = sanitizeAdUrl(ad.clickUrl)
    if (!sanitizedUrl) {
      const error = 'Invalid or unsafe ad URL'

      onError?.(error)
      return
    }

    setIsTracking(true)

    try {
      const response = await fetch('/api/ads/track/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          advertisementId: ad.id,
          impressionId,
          context: {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()

      const trackingResult: ClickTrackingResult = {
        success: true,
        clickId: result.clickId,
        fraudScore: result.fraudDetection?.riskScore,
      }

      onClickTracked?.(trackingResult)

      if (openAfterTracking && sanitizedUrl) {
        const windowFeatures = linkTarget === '_blank' ? 'noopener,noreferrer' : undefined
        window.open(sanitizedUrl, linkTarget, windowFeatures)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      onClickTracked?.({ success: false, error: errorMessage })
      onError?.(errorMessage)

      if (openAfterTracking && sanitizedUrl) {
        window.open(sanitizedUrl, linkTarget, 'noopener,noreferrer')
      }

    } finally {
      setIsTracking(false)
    }
  }, [
    ad.id,
    ad.clickUrl,
    impressionId,
    csrfToken,
    isTracking,
    onClickTracked,
    onError,
    openAfterTracking,
    linkTarget,
  ])

  return { handleClick, isTracking }
}

export default AdClickHandler
