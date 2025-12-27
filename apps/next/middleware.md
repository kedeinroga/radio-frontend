# Middleware Documentation

## 📍 Overview

The Next.js middleware handles automatic locale detection and routing for internationalization (i18n). It ensures all URLs are prefixed with a locale (e.g., `/es/`, `/en/`) and redirects users based on their language preferences.

## 🎯 Responsibilities

1. **Locale Detection** - Automatically detects user's preferred language
2. **URL Redirection** - Redirects `/` to `/es/` (or preferred locale)
3. **Locale Validation** - Ensures only supported locales (`es`, `en`, `fr`, `de`) are used
4. **Cookie Management** - Remembers user's locale preference
5. **Header Injection** - Adds `x-locale` header for server components

## 🔄 Detection Priority

The middleware detects locale in this order:

1. **URL Pathname** - `/es/page` → uses `es`
2. **Cookie** - `app-locale=en` → uses `en`
3. **Accept-Language Header** - Browser setting → uses best match
4. **Default** - Falls back to `es` (Spanish)

## 🛣️ Routing Examples

### Automatic Redirection
```
Request: GET /
Cookie: none
Accept-Language: en-US,en;q=0.9
→ Redirects to: /en/

Request: GET /search
Cookie: app-locale=fr
→ Redirects to: /fr/search

Request: GET /
Cookie: none
Accept-Language: de-DE,de;q=0.9,en;q=0.8
→ Redirects to: /de/
```

### Valid Paths (No Redirect)
```
GET /es/ → ✅ No redirect
GET /en/search → ✅ No redirect
GET /fr/radio/123 → ✅ No redirect
GET /de/admin → ✅ No redirect
```

### Excluded Paths (Bypass Middleware)
```
GET /_next/static/... → ✅ Bypass
GET /api/stations → ✅ Bypass
GET /favicon.ico → ✅ Bypass
GET /robots.txt → ✅ Bypass
GET /image.png → ✅ Bypass
```

## 🍪 Cookie Management

The middleware sets a cookie to remember user preference:

```typescript
Cookie Name: app-locale
Value: es | en | fr | de
Max Age: 1 year
Path: /
SameSite: lax
```

## 📦 Exported Utilities

### `middleware(request: NextRequest)`
Main middleware function that processes all requests.

### `config.matcher`
Defines which paths should be processed by middleware.

## 🧰 Helper Functions (lib/locale.ts)

### `getServerLocale()`
Get locale in Server Components:
```typescript
import { getServerLocale } from '@/lib/locale'

export default async function Page() {
  const locale = await getServerLocale()
  return <h1>Current: {locale.code}</h1>
}
```

### `getLocaleFromParams(params)`
Get locale from dynamic route params:
```typescript
import { getLocaleFromParams } from '@/lib/locale'

export default function Page({ params }: { params: { locale: string } }) {
  const locale = getLocaleFromParams(params)
  return <div>{locale.code}</div>
}
```

### `generateLocaleParams()`
Generate static params for all locales:
```typescript
import { generateLocaleParams } from '@/lib/locale'

export function generateStaticParams() {
  return generateLocaleParams()
  // Returns: [{ locale: 'es' }, { locale: 'en' }, ...]
}
```

## 🏗️ Architecture Integration

```
User Request: GET /
     ↓
[Middleware] middleware.ts
     ├─ Detect locale from cookie/header
     ├─ Redirect to /es/ or /en/
     └─ Set x-locale header
     ↓
[Server Component] app/[locale]/layout.tsx
     ├─ Read locale from header (getServerLocale)
     ├─ Initialize I18nProvider with locale
     └─ Render page
     ↓
[Client Component] Uses useTranslation()
     └─ Access translations from context
```

## 🔒 Type Safety

The middleware uses TypeScript constants for type safety:

```typescript
const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de'] as const
type SupportedLocale = typeof SUPPORTED_LOCALES[number]
```

This ensures:
- ✅ Only valid locales are processed
- ✅ Compile-time validation
- ✅ Consistent with Domain Layer (LocaleCode type)

## 🚀 Performance

- **Zero overhead for static assets** - Images, CSS, JS bypass middleware
- **Cookie caching** - Remembers preference for 1 year
- **Efficient matching** - Regex matcher excludes most paths
- **No database calls** - Pure function with minimal logic

## 🐛 Debugging

To debug middleware behavior, check:

1. **Response headers**: Look for `x-locale` header
2. **Cookies**: Check `app-locale` cookie value
3. **URL redirects**: Verify redirect target
4. **Console logs**: Check for warning messages

## ⚙️ Configuration

To modify middleware behavior:

### Add new locale:
```typescript
// 1. Add to SUPPORTED_LOCALES
const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de', 'pt'] as const

// 2. Add translation file: i18n/locales/pt.json

// 3. Update Domain Layer: domain/valueObjects/Locale.ts
```

### Change default locale:
```typescript
const DEFAULT_LOCALE = 'en' // Change from 'es'
```

### Exclude additional paths:
```typescript
function shouldExcludePath(pathname: string): boolean {
  const excludedPaths = [
    '/_next',
    '/api',
    '/my-custom-path', // Add here
  ]
  // ...
}
```

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────┐
│         User visits /search                 │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│         Middleware intercepts               │
└──────────────────┬──────────────────────────┘
                   ↓
        ┌──────────────────────┐
        │ Has locale in path?  │
        └──────┬───────────────┘
          NO   │       YES
    ┌──────────┴─────────────┐
    ↓                        ↓
┌───────────────┐    ┌──────────────────┐
│ Check cookie  │    │ Set x-locale     │
│ Check header  │    │ Continue         │
│ Redirect to   │    │                  │
│ /es/search    │    └──────────────────┘
└───────────────┘
```

## 🧪 Testing

Test scenarios to verify:

1. ✅ Root path `/` redirects to `/es/`
2. ✅ Locale in URL persists: `/en/page` stays `/en/page`
3. ✅ Cookie preference is respected
4. ✅ Accept-Language header works
5. ✅ Invalid locale falls back to default
6. ✅ Static assets bypass middleware
7. ✅ API routes bypass middleware

## 🔗 Related Files

- `apps/next/middleware.ts` - Main middleware logic
- `apps/next/lib/locale.ts` - Server-side locale helpers
- `apps/next/components/I18nProvider.tsx` - Client-side i18n context
- `packages/app/domain/valueObjects/Locale.ts` - Locale Value Object
