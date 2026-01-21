'use client'

/**
 * PremiumBadge Component
 * 
 * Badge visual para indicar que el usuario es premium.
 * Puede usarse en el header, perfil, o donde sea necesario.
 * 
 * @example
 * ```tsx
 * <PremiumBadge size="sm" />
 * <PremiumBadge size="lg" showText={true} />
 * ```
 */

export interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function PremiumBadge({
  size = 'md',
  showText = true,
  className = '',
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        bg-gradient-to-r from-yellow-400 to-yellow-500 text-white
        shadow-md
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <svg
        className={iconSizes[size]}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {showText && <span>Premium</span>}
    </span>
  )
}

/**
 * PremiumBadge variant with crown icon
 */
export function PremiumCrownBadge({
  size = 'md',
  showText = true,
  className = '',
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        bg-gradient-to-r from-purple-600 to-pink-600 text-white
        shadow-md
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className={`${iconSizes[size]} flex items-center justify-center`}>
        👑
      </span>
      {showText && <span>Premium</span>}
    </span>
  )
}

/**
 * Simple premium indicator (no background)
 */
export function PremiumIndicator({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-yellow-500 ${className}`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-sm font-medium">Premium</span>
    </span>
  )
}

export default PremiumBadge
