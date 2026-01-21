'use client'

/**
 * AdContainerWithPremium Component
 * 
 * Versión mejorada de AdContainer que automáticamente oculta ads
 * si el usuario es premium.
 * 
 * @example
 * ```tsx
 * <AdContainerWithPremium
 *   placement="home_banner"
 *   format="banner"
 * />
 * ```
 */

import { useIsPremium } from '../../hooks/usePremiumStatus'
import { AdContainer, type AdContainerProps } from '../ads/AdContainer'

export function AdContainerWithPremium(props: AdContainerProps) {
  const isPremium = useIsPremium()

  // Si el usuario es premium, no mostrar ads
  if (isPremium) {
    return null
  }

  // Si es usuario free, mostrar ad normal
  return <AdContainer {...props} />
}

export default AdContainerWithPremium
