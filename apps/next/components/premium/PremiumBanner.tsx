/**
 * Premium Banner Component
 * 
 * Call-to-action banner promoting Premium subscription.
 * Displayed to free users to encourage upgrade.
 * - Highlights key benefits
 * - Links to pricing/subscription page
 * - Dismissible (optional)
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, X, Sparkles, Zap, Music } from 'lucide-react'
import { useAppTranslation } from '@/hooks/useAppTranslation'

export interface PremiumBannerProps {
  /** Placement context for tracking */
  placement?: 'home' | 'player' | 'search' | 'station_list'
  /** Allow user to dismiss banner */
  dismissible?: boolean
  /** Variant style */
  variant?: 'gradient' | 'solid' | 'minimal'
  /** Custom className */
  className?: string
}

export function PremiumBanner({
  placement = 'home',
  dismissible = false,
  variant = 'gradient',
  className = '',
}: PremiumBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const { t } = useAppTranslation()

  if (isDismissed) {
    return null
  }

  const variantClasses = {
    gradient: 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700',
    solid: 'bg-primary-600',
    minimal: 'bg-neutral-100 dark:bg-neutral-800 border border-primary-200 dark:border-primary-800',
  }

  const textColor = variant === 'minimal' 
    ? 'text-neutral-900 dark:text-neutral-100' 
    : 'text-white'

  return (
    <div
      className={`relative rounded-lg p-4 ${variantClasses[variant]} ${className}`}
      role="banner"
      aria-label="Premium subscription promotion"
    >
      {dismissible && (
        <button
          onClick={() => setIsDismissed(true)}
          className={`absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 ${textColor} transition-colors`}
          aria-label={t('premium.banner.dismiss')}
        >
          <X size={16} />
        </button>
      )}

      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon & Info */}
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${variant === 'minimal' ? 'bg-primary-100 dark:bg-primary-900' : 'bg-white/20'}`}>
            <Crown className={variant === 'minimal' ? 'text-primary-600' : 'text-white'} size={24} />
          </div>

          <div className="space-y-1">
            <h3 className={`font-bold text-lg ${textColor}`}>
              {t('premium.upgradeTitle')}
            </h3>
            <p className={`text-sm ${variant === 'minimal' ? 'text-neutral-600 dark:text-neutral-400' : 'text-white/90'}`}>
              {t('premium.upgradeSubtitle')}
            </p>

            {/* Benefits list (optional) */}
            <ul className={`flex flex-wrap gap-3 mt-2 text-xs ${variant === 'minimal' ? 'text-neutral-500 dark:text-neutral-500' : 'text-white/80'}`}>
              <li className="flex items-center gap-1">
                <Sparkles size={14} />
                <span>{t('premium.features.noAds')}</span>
              </li>
              <li className="flex items-center gap-1">
                <Zap size={14} />
                <span>{t('premium.features.superiorQuality')}</span>
              </li>
              <li className="flex items-center gap-1">
                <Music size={14} />
                <span>{t('premium.features.exclusiveStations')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: CTA Button */}
        <Link
          href={`/pricing?from=${placement}`}
          className={`
            shrink-0 px-6 py-2 rounded-full font-semibold transition-all
            ${variant === 'minimal' 
              ? 'bg-primary-600 text-white hover:bg-primary-700' 
              : 'bg-white text-primary-600 hover:bg-neutral-100'
            }
          `}
        >
          {t('premium.tryFree')}
        </Link>
      </div>
    </div>
  )
}

/**
 * Compact version of Premium Banner (for smaller spaces)
 */
export function PremiumBannerCompact({
  placement = 'player',
  className = '',
}: Pick<PremiumBannerProps, 'placement' | 'className'>) {
  const { t } = useAppTranslation()
  
  return (
    <Link
      href={`/pricing?from=${placement}`}
      className={`
        flex items-center justify-between gap-3 p-3 rounded-lg
        bg-gradient-to-r from-primary-500 to-primary-600
        text-white hover:from-primary-600 hover:to-primary-700
        transition-all
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        <Crown size={18} />
        <span className="text-sm font-semibold">
          {t('premium.upgradeTitle')} {t('premium.title')}
        </span>
      </div>
      <span className="text-xs px-2 py-1 bg-white/20 rounded-full whitespace-nowrap">
        {t('premium.tryFree')}
      </span>
    </Link>
  )
}
