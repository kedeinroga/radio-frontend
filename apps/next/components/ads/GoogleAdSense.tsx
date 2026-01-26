'use client'

/**
 * Google AdSense Component
 * 
 * Displays Google AdSense advertisements with:
 * - Automatic ad initialization
 * - Responsive sizing
 * - Multiple format support
 * - Error handling
 */

import { useEffect } from 'react'

export interface GoogleAdSenseProps {
  /** Ad slot ID from Google AdSense dashboard */
  adSlot: string
  /** Ad format type */
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  /** Enable full width responsive ads */
  fullWidthResponsive?: boolean
  /** Custom className for styling */
  className?: string
  /** Custom inline styles */
  style?: React.CSSProperties
}

/**
 * Google AdSense ad component
 * 
 * @example
 * ```tsx
 * <GoogleAdSense
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   className="my-8"
 * />
 * ```
 */
export function GoogleAdSense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style = {},
}: GoogleAdSenseProps) {
  useEffect(() => {
    try {
      // Initialize AdSense ad
      // @ts-ignore - adsbygoogle is loaded by the AdSense script
      if (window.adsbygoogle && process.env.NODE_ENV !== 'development') {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  // Don't show ads in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`}
        style={{
          minHeight: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          ...style,
        }}
      >
        <div>
          <p className="text-gray-500 text-sm font-medium">AdSense Ad Placeholder</p>
          <p className="text-gray-400 text-xs mt-1">Slot: {adSlot}</p>
          <p className="text-gray-400 text-xs">Format: {adFormat}</p>
        </div>
      </div>
    )
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{
        display: 'block',
        ...style,
      }}
      data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  )
}

// TypeScript declaration for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[]
  }
}
