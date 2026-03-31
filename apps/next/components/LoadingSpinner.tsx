'use client'

import React from 'react'
import { useAppTranslation } from '@/hooks/useAppTranslation'

export interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  message?: string
}

/**
 * Waveform loader — animated amber bars consistent with the Late Night FM aesthetic.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message,
}) => {
  const { t } = useAppTranslation()
  const displayMessage = message || t('common.loading')

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${size === 'large' ? 'p-8' : 'p-4'}`}
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
    >
      <div
        className={`flex items-end gap-[3px] ${size === 'large' ? 'h-8 w-10' : 'h-4 w-6'}`}
        aria-hidden="true"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="wave-bar flex-1 rounded-[2px] bg-amber-500"
            style={{ height: '100%' }}
          />
        ))}
      </div>

      {displayMessage && (
        <p className="font-broadcast text-[11px] text-neutral-500 text-center tracking-wide">
          {displayMessage}
        </p>
      )}
    </div>
  )
}
