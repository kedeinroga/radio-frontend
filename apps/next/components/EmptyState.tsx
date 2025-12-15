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
    <div className="flex flex-col items-center justify-center p-8">
      <span className="text-6xl mb-4" role="img" aria-label={icon}>
        {icon}
      </span>

      <h2 className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-2">
        {title}
      </h2>

      <p className="text-base text-neutral-600 dark:text-neutral-400 text-center mb-6">
        {text}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
