import { z } from 'zod'

/**
 * Login Form Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(254, 'Email is too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Register Form Validation Schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(254, 'Email is too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Translation Form Validation Schema
 */
export const translationSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(200, 'Key is too long')
    .regex(/^[a-z0-9._-]+$/i, 'Key can only contain letters, numbers, dots, hyphens, and underscores')
    .trim(),
  locale: z
    .enum(['es', 'en', 'fr', 'de'], {
      errorMap: () => ({ message: 'Invalid locale' }),
    }),
  value: z
    .string()
    .min(1, 'Translation value is required')
    .max(1000, 'Translation value is too long')
    .trim(),
})

export type TranslationFormData = z.infer<typeof translationSchema>

/**
 * Search Query Validation Schema
 */
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(200, 'Search query is too long')
    .trim()
    .transform((val) => val.replace(/[<>]/g, '')), // Remove potential XSS chars
})

export type SearchFormData = z.infer<typeof searchSchema>

/**
 * Station ID Validation Schema
 */
export const stationIdSchema = z.object({
  id: z
    .string()
    .min(1, 'Station ID is required')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid station ID format'),
})

export type StationIdData = z.infer<typeof stationIdSchema>

/**
 * URL Parameter Validation Schema
 */
export const urlParamSchema = z.object({
  param: z
    .string()
    .min(1, 'Parameter is required')
    .max(100, 'Parameter is too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid parameter format'),
})

export type UrlParamData = z.infer<typeof urlParamSchema>

/**
 * Helper function to safely parse and validate data
 * Returns validation result with typed data or errors
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Transform Zod errors into a more usable format
  const errors: Record<string, string[]> = {}
  result.error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(err.message)
  })

  return { success: false, errors }
}
