import React, { forwardRef } from 'react'
import { Pressable, Text, View, ActivityIndicator } from 'react-native'

export interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  accessibilityLabel: string
  accessibilityHint?: string
  className?: string
}

/**
 * Accessible Button Component
 * Follows WCAG 2.1 AA guidelines with proper touch targets and labels
 */
export const Button = forwardRef<View, ButtonProps>(
  (
    {
      children,
      onPress,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      accessibilityLabel,
      accessibilityHint,
      className = '',
    },
    ref
  ) => {
    const baseClasses = 'rounded-lg flex-row items-center justify-center'

    const variantClasses = {
      primary: 'bg-primary-500 active:bg-primary-600',
      secondary: 'bg-neutral-700 active:bg-neutral-800',
      outline: 'border-2 border-primary-500 bg-transparent active:bg-primary-50',
      ghost: 'bg-transparent active:bg-neutral-100',
    }

    const sizeClasses = {
      sm: 'px-4 py-2 min-h-[36px]',
      md: 'px-6 py-3 min-h-[44px]', // 44px = iOS minimum touch target
      lg: 'px-8 py-4 min-h-[52px]',
    }

    const textColorClasses = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary-500',
      ghost: 'text-neutral-900',
    }

    const textSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }

    const isDisabled = disabled || loading

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={isDisabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${isDisabled ? 'opacity-50' : ''}
          ${className}
        `}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? '#0ea5e9' : '#ffffff'}
            size="small"
          />
        ) : (
          <Text
            className={`font-semibold ${textColorClasses[variant]} ${textSizeClasses[size]}`}
          >
            {children}
          </Text>
        )}
      </Pressable>
    )
  }
)

Button.displayName = 'Button'
