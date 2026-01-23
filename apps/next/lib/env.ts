import { z } from 'zod'

/**
 * Environment Variables Schema
 * 
 * Este schema valida todas las variables de entorno necesarias para la aplicación.
 * Se ejecuta al inicio de la aplicación para garantizar que todas las variables
 * están configuradas correctamente.
 */
const envSchema = z.object({
  // ==========================================
  // Backend API
  // ==========================================
  NEXT_PUBLIC_API_URL: z
    .string()
    .url('NEXT_PUBLIC_API_URL debe ser una URL válida')
    .describe('URL del backend API (ej: http://localhost:8080/api/v1)'),

  // ==========================================
  // Stripe Configuration (NEVER expose secret key to client!)
  // ==========================================
  STRIPE_SECRET_KEY: z
    .string()
    .min(1, 'STRIPE_SECRET_KEY es requerido')
    .startsWith('sk_', 'STRIPE_SECRET_KEY debe comenzar con sk_')
    .describe('Stripe Secret Key (server-side only)'),

  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'STRIPE_WEBHOOK_SECRET es requerido')
    .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET debe comenzar con whsec_')
    .describe('Stripe Webhook Secret para validar webhooks'),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .startsWith('pk_', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY debe comenzar con pk_')
    .describe('Stripe Publishable Key (client-side safe)'),

  STRIPE_PRICE_ID_MONTHLY: z
    .string()
    .startsWith('price_', 'STRIPE_PRICE_ID_MONTHLY debe comenzar con price_')
    .describe('Stripe Price ID para plan mensual'),

  STRIPE_PRICE_ID_YEARLY: z
    .string()
    .startsWith('price_', 'STRIPE_PRICE_ID_YEARLY debe comenzar con price_')
    .describe('Stripe Price ID para plan anual'),

  // ==========================================
  // App Configuration
  // ==========================================
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Ambiente de ejecución'),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL debe ser una URL válida')
    .describe('URL pública de la aplicación'),

  // ==========================================
  // Optional: Analytics & Monitoring
  // ==========================================
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .describe('Sentry DSN para error tracking'),

  NEXT_PUBLIC_GA_MEASUREMENT_ID: z
    .string()
    .optional()
    .describe('Google Analytics Measurement ID'),
})

/**
 * Tipo inferido del schema para type safety
 */
export type Env = z.infer<typeof envSchema>

/**
 * Valida las variables de entorno al inicio de la aplicación
 * 
 * @throws {Error} Si alguna variable de entorno es inválida
 */
export function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env)
    
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Environment validation failed
      // In production, fail immediately
    }
    
    // En producción, fallar de inmediato
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    
    throw error
  }
}

/**
 * Variables de entorno validadas (singleton)
 * 
 * Uso:
 * ```typescript
 * import { env } from '@/lib/env'
 * 
 * const apiUrl = env.NEXT_PUBLIC_API_URL
 * ```
 */
export const env = validateEnv()

/**
 * Utilidad para verificar si estamos en producción
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Utilidad para verificar si estamos en desarrollo
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Utilidad para verificar si estamos en test
 */
export const isTest = env.NODE_ENV === 'test'

/**
 * Utilidad para verificar si Stripe está en modo test
 */
export const isStripeTestMode = env.STRIPE_SECRET_KEY.startsWith('sk_test_')

/**
 * Precios de suscripción (hardcoded para validación de webhooks)
 * IMPORTANTE: Estos valores deben coincidir con los precios en Stripe
 */
export const SUBSCRIPTION_PRICES = {
  monthly: 499, // $4.99 en centavos
  yearly: 4999, // $49.99 en centavos
} as const

/**
 * URLs de retorno de Stripe
 */
export const getStripeReturnUrls = () => ({
  success: `${env.NEXT_PUBLIC_APP_URL}/premium/success`,
  cancel: `${env.NEXT_PUBLIC_APP_URL}/premium/cancel`,
})
