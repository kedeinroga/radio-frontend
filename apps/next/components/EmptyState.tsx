'use client'

import React from 'react'

export interface EmptyStateProps {
  icon: string
  title: string
  message?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  description,
  actionLabel,
  onAction,
}) => {
  const text = message || description || ''

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Icon container */}
      <div
        className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-5"
        aria-hidden="true"
      >
        <span className="text-2xl" role="img">
          {icon}
        </span>
      </div>

      <h2 className="font-display text-xl font-semibold text-white text-center mb-2">
        {title}
      </h2>

      {text && (
        <p className="font-broadcast text-[11px] text-neutral-500 text-center mb-8 max-w-xs leading-relaxed">
          {text}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-broadcast text-xs font-bold tracking-[0.1em] uppercase rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
