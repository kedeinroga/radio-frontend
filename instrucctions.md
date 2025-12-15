# Frontend Specification: Universal Radio App (Solito)
> **Role:** Fullstack Frontend Engineer (React/TypeScript)  
> **Goal:** Build a production-ready Monorepo sharing 90% of code between Next.js (Web/SEO) and Expo (Mobile) following Clean Architecture principles.  
> **Output:** A scalable, maintainable repo deployed to Vercel (Web) and EAS (Mobile).

---

## 1. Technical Stack (The Universal Stack)

### Core Framework
* **Monorepo Manager:** Turborepo
* **Glue:** Solito (Unifies Navigation between Next.js and React Native)
* **Mobile Runtime:** Expo SDK 51+ (Managed Workflow)
* **Web Runtime:** Next.js 15.1.9+ or 14.2.25+ (App Router) - **CRITICAL: Patched for CVE-2025-55182**
* **Styling:** NativeWind v4 (TailwindCSS for React Native)

### State & Data Management
* **Global State:** Zustand v4 (Lightweight, TypeScript-first)
* **Server State:** TanStack Query (React Query) v5
* **Form Management:** React Hook Form + Zod validation

### Development & Quality
* **Language:** TypeScript 5.3+ (Strict mode enabled)
* **Validation:** Zod (Runtime type validation)
* **Testing:** Jest + React Testing Library + Detox (E2E mobile) + Playwright (E2E web)
* **Code Quality:** ESLint + Prettier + Husky (pre-commit hooks)
* **Documentation:** TSDoc for public APIs

---

## 2. Clean Architecture & Folder Structure

### 2.1 Architecture Layers

We follow **Clean Architecture** with explicit layer separation:

```
┌─────────────────────────────────────┐
│   Presentation (UI Components)      │  ← React Components, Hooks
├─────────────────────────────────────┤
│   Application (Use Cases)           │  ← Business orchestration
├─────────────────────────────────────┤
│   Domain (Entities & Rules)         │  ← Core business logic
├─────────────────────────────────────┤
│   Infrastructure (External)         │  ← API, Storage, Analytics
└─────────────────────────────────────┘
```

**Dependency Rule:** Inner layers NEVER depend on outer layers.

### 2.2 Folder Structure

```text
/
├── .github/
│   └── workflows/              # CI/CD pipelines
│       ├── ci.yml              # Lint, test, build
│       ├── deploy-web.yml      # Vercel deployment
│       └── deploy-mobile.yml   # EAS Build & Submit
│
├── apps/
│   ├── expo/                   # Native entry point
│   │   ├── app/                # Expo Router (file-based navigation)
│   │   ├── app.json            # Expo config
│   │   └── eas.json            # EAS Build config
│   │
│   └── next/                   # Web entry point
│       ├── app/                # Next.js App Router
│       │   ├── layout.tsx      # Root layout (persistent player)
│       │   ├── [locale]/       # i18n routes
│       │   └── api/            # API routes (auth callbacks)
│       ├── public/             # Static assets
│       ├── next.config.js      # Next.js config
│       └── middleware.ts       # Auth + i18n middleware
│
├── packages/
│   └── app/                    # SHARED CORE (90% of code)
│       │
│       ├── domain/             # 🟢 DOMAIN LAYER (Framework-agnostic)
│       │   ├── entities/
│       │   │   ├── Station.ts
│       │   │   ├── User.ts
│       │   │   └── AudioTrack.ts
│       │   ├── repositories/   # Interfaces (Dependency Inversion)
│       │   │   ├── IStationRepository.ts
│       │   │   ├── IUserRepository.ts
│       │   │   └── IPlayerRepository.ts
│       │   ├── services/       # Domain services
│       │   │   └── IAnalyticsService.ts
│       │   └── errors/
│       │       └── DomainErrors.ts
│       │
│       ├── application/        # 🔵 APPLICATION LAYER (Use Cases)
│       │   ├── useCases/
│       │   │   ├── auth/
│       │   │   │   ├── LoginUser.ts
│       │   │   │   └── LogoutUser.ts
│       │   │   ├── stations/
│       │   │   │   ├── SearchStations.ts
│       │   │   │   ├── GetPopularStations.ts
│       │   │   │   └── GetStationById.ts
│       │   │   └── player/
│       │   │       ├── PlayStation.ts
│       │   │       ├── PauseStation.ts
│       │   │       └── TrackListeningSession.ts
│       │   └── ports/          # Output interfaces
│       │       ├── ILogger.ts
│       │       └── ISecretManager.ts
│       │
│       ├── infrastructure/     # 🟠 INFRASTRUCTURE LAYER
│       │   ├── api/
│       │   │   ├── RadioApiClient.ts
│       │   │   ├── StationApiRepository.ts
│       │   │   └── UserApiRepository.ts
│       │   ├── audio/
│       │   │   ├── WebAudioAdapter.ts      # HTML5 Audio
│       │   │   └── NativeAudioAdapter.ts   # react-native-track-player
│       │   ├── storage/
│       │   │   ├── SecureStorage.ts        # expo-secure-store / web crypto
│       │   │   └── LocalStorageService.ts
│       │   ├── analytics/
│       │   │   ├── MixpanelService.ts
│       │   │   └── GoogleAnalyticsService.ts
│       │   ├── logging/
│       │   │   └── SentryLogger.ts
│       │   └── auth/
│       │       └── SupabaseAuthAdapter.ts
│       │
│       └── presentation/       # 🟣 PRESENTATION LAYER
│           ├── components/
│           │   ├── atoms/
│           │   │   ├── Button.tsx
│           │   │   └── StationCard.tsx
│           │   ├── molecules/
│           │   │   ├── PlayerControls.tsx
│           │   │   └── SearchBar.tsx
│           │   └── organisms/
│           │       ├── StationList.tsx
│           │       └── AudioPlayer.tsx
│           ├── hooks/
│           │   ├── useAuth.ts              # Uses LoginUser/LogoutUser
│           │   ├── useStations.ts          # Uses SearchStations
│           │   └── usePlayer.ts            # Uses PlayStation/PauseStation
│           ├── screens/
│           │   ├── HomeScreen.tsx
│           │   ├── StationDetailScreen.tsx
│           │   └── ProfileScreen.tsx
│           ├── providers/
│           │   ├── AuthProvider.tsx
│           │   ├── QueryProvider.tsx
│           │   └── I18nProvider.tsx
│           ├── navigation/
│           │   └── linking.ts              # Solito config
│           └── i18n/
│               ├── locales/
│               │   ├── en.json
│               │   ├── es.json
│               │   └── pt.json
│               └── config.ts
│
├── .env.example                # Template for environment variables
├── .eslintrc.js                # Shared ESLint config
├── .prettierrc                 # Code formatting rules
├── turbo.json                  # Turborepo pipeline config
└── package.json                # Root package.json
```

---

## 3. Authentication Strategy

### 3.1 Provider: Supabase Auth

**Why Supabase:**
- Built-in OAuth providers (Google, Apple, GitHub)
- Row Level Security (RLS) for database
- Works seamlessly on Web and Mobile
- Free tier sufficient for MVP

### 3.2 Implementation

#### Domain Layer
```typescript
// domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly avatarUrl?: string
  ) {}
}

// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  getCurrentUser(): Promise<User | null>
  login(email: string, password: string): Promise<User>
  loginWithOAuth(provider: 'google' | 'apple'): Promise<User>
  logout(): Promise<void>
}
```

#### Application Layer
```typescript
// application/useCases/auth/LoginUser.ts
export class LoginUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private analytics: IAnalyticsService,
    private logger: ILogger
  ) {}

  async execute(email: string, password: string): Promise<User> {
    try {
      const user = await this.userRepo.login(email, password)
      await this.analytics.track('user_logged_in', { userId: user.id })
      this.logger.info('User logged in successfully', { userId: user.id })
      return user
    } catch (error) {
      this.logger.error('Login failed', { email, error })
      throw new AuthenticationError('Invalid credentials')
    }
  }
}
```

#### Infrastructure Layer
```typescript
// infrastructure/auth/SupabaseAuthAdapter.ts
import { createClient } from '@supabase/supabase-js'

export class SupabaseAuthAdapter implements IUserRepository {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser()
    return data.user ? this.mapToUser(data.user) : null
  }

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw new AuthenticationError(error.message)
    return this.mapToUser(data.user)
  }

  async loginWithOAuth(provider: 'google' | 'apple'): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: Platform.OS === 'web' 
          ? `${window.location.origin}/auth/callback`
          : 'radioapp://auth/callback'
      }
    })
    if (error) throw new AuthenticationError(error.message)
    return this.mapToUser(data.user)
  }
}
```

#### Presentation Layer
```typescript
// presentation/hooks/useAuth.ts
export const useAuth = () => {
  const loginUseCase = new LoginUserUseCase(userRepo, analytics, logger)
  
  const login = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      loginUseCase.execute(credentials.email, credentials.password),
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user)
    }
  })

  return { login, logout, user }
}
```

### 3.3 Session Management

- **Web:** HTTP-only cookies (handled by Supabase)
- **Mobile:** Secure storage with `expo-secure-store`
- **Token Refresh:** Automatic via Supabase SDK
- **Middleware:** Next.js middleware for protected routes

```typescript
// apps/next/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && req.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return res
}
```

---

## 4. Analytics & Behavior Tracking

### 4.1 Analytics Stack

- **Primary:** Mixpanel (User behavior, funnels, retention)
- **Secondary:** Google Analytics 4 (Web traffic, SEO metrics)
- **Mobile-specific:** Expo Analytics (Crash reports, app performance)

### 4.2 Events to Track

```typescript
// domain/services/IAnalyticsService.ts
export interface IAnalyticsService {
  // User events
  track(event: string, properties?: Record<string, any>): Promise<void>
  identify(userId: string, traits?: Record<string, any>): Promise<void>
  
  // Page/Screen views
  trackPageView(pageName: string, properties?: Record<string, any>): Promise<void>
}

// Key events to implement:
const ANALYTICS_EVENTS = {
  // User lifecycle
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  
  // Station interactions
  STATION_SEARCHED: 'station_searched',
  STATION_VIEWED: 'station_viewed',
  STATION_PLAYED: 'station_played',
  STATION_FAVORITED: 'station_favorited',
  
  // Player events
  PLAYBACK_STARTED: 'playback_started',
  PLAYBACK_PAUSED: 'playback_paused',
  PLAYBACK_DURATION: 'playback_duration', // Track every 30s
  
  // Monetization
  AD_VIEWED: 'ad_viewed',
  AD_CLICKED: 'ad_clicked',
  
  // Errors
  PLAYBACK_ERROR: 'playback_error',
  API_ERROR: 'api_error'
}
```

### 4.3 Implementation

```typescript
// infrastructure/analytics/MixpanelService.ts
import mixpanel from 'mixpanel-browser' // Web
import { Mixpanel } from 'mixpanel-react-native' // Mobile

export class MixpanelService implements IAnalyticsService {
  private client: any

  constructor() {
    if (Platform.OS === 'web') {
      mixpanel.init(process.env.MIXPANEL_TOKEN!)
      this.client = mixpanel
    } else {
      this.client = new Mixpanel(process.env.MIXPANEL_TOKEN!)
    }
  }

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    this.client.track(event, {
      ...properties,
      platform: Platform.OS,
      timestamp: new Date().toISOString()
    })
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    this.client.identify(userId)
    if (traits) {
      this.client.people.set(traits)
    }
  }
}
```

### 4.4 Privacy Compliance

- **GDPR/CCPA:** Implement consent banner using `react-cookie-consent`
- **Opt-out:** Provide settings to disable analytics
- **Data Retention:** Configure 90-day retention in Mixpanel

```typescript
// presentation/components/CookieConsent.tsx
import CookieConsent from 'react-cookie-consent'

export const CookieConsentBanner = () => (
  <CookieConsent
    onAccept={() => {
      analytics.track('cookie_consent_accepted')
    }}
    onDecline={() => {
      analytics.disable()
    }}
  >
    We use cookies to improve your experience and analyze app usage.
  </CookieConsent>
)
```

---

## 5. Logging Strategy

### 5.1 Logging Levels

```typescript
// application/ports/ILogger.ts
export interface ILogger {
  debug(message: string, context?: Record<string, any>): void
  info(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, context?: Record<string, any>): void
  fatal(message: string, context?: Record<string, any>): void
}
```

### 5.2 Implementation: Sentry

```typescript
// infrastructure/logging/SentryLogger.ts
import * as Sentry from '@sentry/react-native'

export class SentryLogger implements ILogger {
  constructor() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      beforeSend(event) {
        // Scrub sensitive data
        if (event.request?.headers) {
          delete event.request.headers['Authorization']
        }
        return event
      }
    })
  }

  error(message: string, context?: Record<string, any>): void {
    Sentry.captureException(new Error(message), {
      extra: context,
      level: 'error'
    })
  }

  info(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, context)
    }
    Sentry.addBreadcrumb({
      message,
      data: context,
      level: 'info'
    })
  }

  // ... other methods
}
```

### 5.3 What to Log

✅ **DO Log:**
- Authentication events (login, logout, token refresh)
- API errors (with sanitized request/response)
- Playback errors (stream URL, error code)
- Performance metrics (API latency, render times)

❌ **DON'T Log:**
- Passwords or tokens
- Personal Identifiable Information (PII)
- Full API responses (only status codes)

### 5.4 Log Aggregation

- **Development:** Console logs
- **Staging/Production:** Sentry (errors) + CloudWatch Logs (info/debug)

---

## 6. Code Standardization

### 6.1 TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/domain/*": ["packages/app/domain/*"],
      "@/application/*": ["packages/app/application/*"],
      "@/infrastructure/*": ["packages/app/infrastructure/*"],
      "@/presentation/*": ["packages/app/presentation/*"]
    }
  }
}
```

### 6.2 ESLint Rules

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    // Enforce Clean Architecture
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../../*'],
            message: 'Use absolute imports with @ aliases'
          },
          {
            group: ['@/infrastructure/*'],
            message: 'Domain layer cannot import from infrastructure'
          }
        ]
      }
    ],
    
    // Code quality
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    'prefer-const': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // React best practices
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-no-leaked-render': 'error'
  }
}
```

### 6.3 Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}
```

### 6.4 Naming Conventions

```typescript
// ✅ GOOD
export class PlayStationUseCase { }        // PascalCase for classes
export interface IStationRepository { }    // I prefix for interfaces
export const ANALYTICS_EVENTS = { }        // UPPER_SNAKE_CASE for constants
export const useAuth = () => { }           // camelCase for functions/hooks
export type StationId = string             // PascalCase for types

// ❌ BAD
export class playstation { }               // Wrong case
export interface StationRepository { }     // Missing I prefix
export const analyticsEvents = { }         // Should be UPPER_SNAKE_CASE
```

### 6.5 File Naming

```
// Components: PascalCase
StationCard.tsx
AudioPlayer.tsx

// Hooks: camelCase with 'use' prefix
useAuth.ts
usePlayer.ts

// Use Cases: PascalCase
PlayStation.ts
SearchStations.ts

// Utilities: camelCase
formatDuration.ts
validateUrl.ts

// Tests: Same as file + .test or .spec
StationCard.test.tsx
PlayStation.spec.ts
```

### 6.6 Git Commit Convention

Use **Conventional Commits**:

```bash
feat: add OAuth login with Google
fix: resolve audio playback on iOS
docs: update README with setup instructions
refactor: extract player logic to use case
test: add unit tests for Station entity
chore: update dependencies
```

### 6.7 Pre-commit Hooks (Husky)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ]
  }
}
```

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions Workflows

#### Continuous Integration (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Build packages
        run: npm run build
```

#### Web Deployment (`.github/workflows/deploy-web.yml`)

```yaml
name: Deploy Web to Vercel

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Mobile Deployment (`.github/workflows/deploy-mobile.yml`)

```yaml
name: EAS Build & Submit

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive
      
      - name: Build Android
        run: eas build --platform android --profile production --non-interactive
      
      - name: Submit to App Store
        if: startsWith(github.ref, 'refs/tags/v')
        run: eas submit --platform ios --latest
      
      - name: Submit to Play Store
        if: startsWith(github.ref, 'refs/tags/v')
        run: eas submit --platform android --latest
```

### 7.2 Environments

| Environment | Branch | Deployment | Purpose |
|-------------|--------|------------|---------|
| **Development** | `develop` | Auto (Vercel Preview) | Feature testing |
| **Staging** | `staging` | Auto (Vercel + EAS Preview) | QA testing |
| **Production** | `main` | Auto (Vercel + EAS Production) | Live users |

### 7.3 EAS Configuration

```json
// apps/expo/eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging-api.radioapp.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.radioapp.com"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## 8. Secrets Management

### 8.1 Environment Variables Strategy

```bash
# .env.example (Committed to repo)
# Copy to .env.local and fill with actual values

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Analytics
MIXPANEL_TOKEN=your-mixpanel-token
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Logging
SENTRY_DSN=https://xxx@sentry.io/xxx

# API
NEXT_PUBLIC_API_URL=https://api.radioapp.com

# Monetization
GOOGLE_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx
ADMOB_APP_ID_IOS=ca-app-pub-xxxxx~xxxxx
ADMOB_APP_ID_ANDROID=ca-app-pub-xxxxx~xxxxx
```

### 8.2 Secure Storage

#### Web (Next.js)
```typescript
// infrastructure/storage/SecureStorage.ts
export class WebSecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    // Use Web Crypto API for encryption
    const encrypted = await this.encrypt(value)
    localStorage.setItem(key, encrypted)
  }

  private async encrypt(text: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const key = await this.getEncryptionKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  }
}
```

#### Mobile (Expo)
```typescript
// infrastructure/storage/SecureStorage.ts
import * as SecureStore from 'expo-secure-store'

export class MobileSecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED
    })
  }

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key)
  }
}
```

### 8.3 CI/CD Secrets

**GitHub Secrets to configure:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `EXPO_TOKEN`
- `SENTRY_AUTH_TOKEN`
- `GOOGLE_PLAY_SERVICE_ACCOUNT` (JSON)
- `APPLE_APP_STORE_CONNECT_API_KEY`

**Vercel Environment Variables:**
- Add all `NEXT_PUBLIC_*` and `SUPABASE_*` vars in Vercel dashboard
- Separate values for Preview, Development, and Production

**EAS Secrets:**
```bash
# Set secrets for EAS Build
eas secret:create --scope project --name SUPABASE_URL --value https://...
eas secret:create --scope project --name SENTRY_DSN --value https://...
```

---

## 9. Internationalization (i18n)

### 9.1 Supported Languages (MVP)

- 🇺🇸 English (en) - Default
- 🇪🇸 Spanish (es)
- 🇧🇷 Portuguese (pt-BR)

### 9.2 Implementation: next-intl + i18next

#### Installation
```bash
npm install next-intl i18next react-i18next
```

#### Configuration

```typescript
// packages/app/presentation/i18n/config.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'
import pt from './locales/pt.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
```

#### Translation Files

```json
// packages/app/presentation/i18n/locales/en.json
{
  "common": {
    "play": "Play",
    "pause": "Pause",
    "search": "Search",
    "loading": "Loading..."
  },
  "home": {
    "title": "Discover Radio Stations",
    "popularStations": "Popular Stations"
  },
  "player": {
    "nowPlaying": "Now Playing",
    "buffering": "Buffering..."
  },
  "auth": {
    "login": "Log In",
    "logout": "Log Out",
    "email": "Email",
    "password": "Password"
  }
}
```

```json
// packages/app/presentation/i18n/locales/es.json
{
  "common": {
    "play": "Reproducir",
    "pause": "Pausar",
    "search": "Buscar",
    "loading": "Cargando..."
  },
  "home": {
    "title": "Descubre Estaciones de Radio",
    "popularStations": "Estaciones Populares"
  }
  // ... rest of translations
}
```

#### Usage in Components

```typescript
// presentation/components/PlayerControls.tsx
import { useTranslation } from 'react-i18next'

export const PlayerControls = () => {
  const { t } = useTranslation()
  
  return (
    <View>
      <Text>{t('player.nowPlaying')}</Text>
      <Button title={isPlaying ? t('common.pause') : t('common.play')} />
    </View>
  )
}
```

#### Next.js Routing (Web)

```typescript
// apps/next/middleware.ts
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'es', 'pt'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // /es/home or /home (for default)
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}
```

```typescript
// apps/next/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  let messages
  try {
    messages = (await import(`@/presentation/i18n/locales/${locale}.json`)).default
  } catch (error) {
    notFound()
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

#### Mobile Language Detection

```typescript
// presentation/providers/I18nProvider.tsx
import { useEffect } from 'react'
import { getLocales } from 'expo-localization'
import i18n from '../i18n/config'

export const I18nProvider = ({ children }) => {
  useEffect(() => {
    const deviceLocale = getLocales()[0].languageCode
    const supportedLocale = ['en', 'es', 'pt'].includes(deviceLocale)
      ? deviceLocale
      : 'en'
    
    i18n.changeLanguage(supportedLocale)
  }, [])

  return <>{children}</>
}
```

### 9.3 Date & Number Formatting

```typescript
// presentation/utils/formatters.ts
import { format } from 'date-fns'
import { enUS, es, ptBR } from 'date-fns/locale'

const locales = { en: enUS, es, pt: ptBR }

export const formatDate = (date: Date, locale: string): string => {
  return format(date, 'PPP', { locale: locales[locale] })
}

export const formatNumber = (num: number, locale: string): string => {
  return new Intl.NumberFormat(locale).format(num)
}
```

---

## 10. Platform-Specific Implementation

### 10.1 Audio Adapter Pattern

```typescript
// domain/repositories/IPlayerRepository.ts
export interface IPlayerRepository {
  play(streamUrl: string): Promise<void>
  pause(): Promise<void>
  stop(): Promise<void>
  setVolume(volume: number): Promise<void>
  getCurrentTime(): Promise<number>
  onStateChange(callback: (state: PlayerState) => void): void
}
```

```typescript
// infrastructure/audio/WebAudioAdapter.ts
import { Howl } from 'howler'

export class WebAudioAdapter implements IPlayerRepository {
  private player: Howl | null = null

  async play(streamUrl: string): Promise<void> {
    this.player = new Howl({
      src: [streamUrl],
      html5: true,
      format: ['mp3', 'aac']
    })
    this.player.play()
  }

  async pause(): Promise<void> {
    this.player?.pause()
  }
}
```

```typescript
// infrastructure/audio/NativeAudioAdapter.ts
import TrackPlayer, { State } from 'react-native-track-player'

export class NativeAudioAdapter implements IPlayerRepository {
  async play(streamUrl: string): Promise<void> {
    await TrackPlayer.setupPlayer()
    await TrackPlayer.add({
      id: 'live-stream',
      url: streamUrl,
      title: 'Live Radio',
      artist: 'Station Name',
      isLiveStream: true
    })
    await TrackPlayer.play()
  }

  async pause(): Promise<void> {
    await TrackPlayer.pause()
  }
}
```

```typescript
// presentation/hooks/usePlayer.ts
import { Platform } from 'react-native'

const playerAdapter = Platform.OS === 'web'
  ? new WebAudioAdapter()
  : new NativeAudioAdapter()

export const usePlayer = () => {
  const playUseCase = new PlayStationUseCase(playerAdapter, analytics, logger)
  
  const play = useMutation({
    mutationFn: (streamUrl: string) => playUseCase.execute(streamUrl)
  })

  return { play, pause, stop }
}
```

### 10.2 Mobile Background Audio

```json
// apps/expo/app.json
{
  "expo": {
    "plugins": [
      [
        "react-native-track-player",
        {
          "enableBackgroundAudio": true
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "permissions": [
        "android.permission.FOREGROUND_SERVICE"
      ]
    }
  }
}
```

### 10.3 Web Persistent Player

```typescript
// apps/next/app/layout.tsx
import { AudioPlayer } from '@/presentation/components/organisms/AudioPlayer'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            {/* Player persists across navigation */}
            <AudioPlayer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

---

## 11. SEO Strategy (Next.js)

### 11.1 Dynamic Metadata

```typescript
// apps/next/app/[locale]/station/[id]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string; locale: string } 
}): Promise<Metadata> {
  const station = await fetchStationById(params.id)
  
  return {
    title: `${station.name} - Live Radio`,
    description: `Listen to ${station.name} live. ${station.description}`,
    openGraph: {
      title: station.name,
      description: station.description,
      images: [station.imageUrl],
      type: 'music.radio_station'
    },
    twitter: {
      card: 'summary_large_image',
      title: station.name,
      description: station.description,
      images: [station.imageUrl]
    },
    alternates: {
      canonical: `https://radioapp.com/${params.locale}/station/${params.id}`,
      languages: {
        'en': `/en/station/${params.id}`,
        'es': `/es/station/${params.id}`,
        'pt': `/pt/station/${params.id}`
      }
    }
  }
}
```

### 11.2 Structured Data (JSON-LD)

```typescript
// apps/next/app/[locale]/station/[id]/page.tsx
export default async function StationPage({ params }) {
  const station = await fetchStationById(params.id)
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RadioStation',
    name: station.name,
    description: station.description,
    image: station.imageUrl,
    broadcastFrequency: station.frequency,
    url: `https://radioapp.com/station/${station.id}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StationDetailScreen station={station} />
    </>
  )
}
```

### 11.3 Sitemap Generation

```typescript
// apps/next/app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stations = await fetchAllStations()
  
  const stationUrls = stations.flatMap((station) => 
    ['en', 'es', 'pt'].map((locale) => ({
      url: `https://radioapp.com/${locale}/station/${station.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))
  )

  return [
    {
      url: 'https://radioapp.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    ...stationUrls
  ]
}
```

---

## 12. Monetization Strategy

### 12.1 Web Ads (Google AdSense)

```typescript
// apps/next/app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.GOOGLE_ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 12.2 Mobile Ads (AdMob)

```typescript
// presentation/components/AdBanner.tsx
import { Platform } from 'react-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'

export const AdBanner = () => {
  if (Platform.OS === 'web') {
    return (
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.GOOGLE_ADSENSE_ID}
        data-ad-slot="1234567890"
        data-ad-format="auto"
      />
    )
  }

  const adUnitId = Platform.select({
    ios: process.env.ADMOB_BANNER_IOS,
    android: process.env.ADMOB_BANNER_ANDROID
  })

  return (
    <BannerAd
      unitId={adUnitId!}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      onAdLoaded={() => analytics.track('ad_loaded')}
      onAdFailedToLoad={(error) => logger.error('Ad failed to load', { error })}
    />
  )
}
```

---

## 13. Testing Strategy

### 13.1 Unit Tests (Domain & Application Layers)

```typescript
// domain/entities/__tests__/Station.test.ts
import { Station } from '../Station'

describe('Station Entity', () => {
  it('should create a valid station', () => {
    const station = new Station(
      '123',
      'Rock FM',
      'https://stream.rockfm.com/live.mp3'
    )
    expect(station.id).toBe('123')
    expect(station.name).toBe('Rock FM')
  })

  it('should throw error for invalid stream URL', () => {
    expect(() => new Station('1', 'Test', 'invalid-url'))
      .toThrow('Invalid stream URL')
  })
})
```

```typescript
// application/useCases/__tests__/PlayStation.test.ts
import { PlayStationUseCase } from '../PlayStation'

describe('PlayStationUseCase', () => {
  it('should play station and track analytics', async () => {
    const mockPlayer = { play: jest.fn() }
    const mockAnalytics = { track: jest.fn() }
    const useCase = new PlayStationUseCase(mockPlayer, mockAnalytics)

    await useCase.execute('https://stream.url')

    expect(mockPlayer.play).toHaveBeenCalledWith('https://stream.url')
    expect(mockAnalytics.track).toHaveBeenCalledWith('playback_started', expect.any(Object))
  })
})
```

### 13.2 Integration Tests (Presentation Layer)

```typescript
// presentation/hooks/__tests__/useAuth.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth())

    result.current.login.mutate({
      email: 'test@example.com',
      password: 'password123'
    })

    await waitFor(() => expect(result.current.login.isSuccess).toBe(true))
    expect(result.current.user).toBeDefined()
  })
})
```

### 13.3 E2E Tests

**Web (Playwright):**
```typescript
// apps/next/e2e/station-playback.spec.ts
import { test, expect } from '@playwright/test'

test('should play station when clicked', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="station-card-1"]')
  await expect(page.locator('[data-testid="player-status"]')).toContainText('Playing')
})
```

**Mobile (Detox):**
```typescript
// apps/expo/e2e/station-playback.e2e.ts
describe('Station Playback', () => {
  it('should play station when tapped', async () => {
    await element(by.id('station-card-1')).tap()
    await expect(element(by.id('player-status'))).toHaveText('Playing')
  })
})
```

---

## 14. Deliverables Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Monorepo setup with Turborepo
- [ ] Clean Architecture folder structure
- [ ] TypeScript + ESLint + Prettier configuration
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment variables & secrets management

### Phase 2: Core Features (Week 3-4)
- [ ] Domain entities (Station, User, AudioTrack)
- [ ] Use cases (PlayStation, SearchStations, LoginUser)
- [ ] Audio adapters (Web + Mobile)
- [ ] Authentication with Supabase
- [ ] Basic UI components (StationCard, PlayerControls)

### Phase 3: Platform Integration (Week 5-6)
- [ ] Next.js web app with SSR
- [ ] Expo mobile app with background audio
- [ ] Shared navigation with Solito
- [ ] Persistent player on web
- [ ] Lock screen controls on mobile

### Phase 4: Polish & Launch (Week 7-8)
- [ ] Analytics integration (Mixpanel + GA4)
- [ ] Logging with Sentry
- [ ] Internationalization (en, es, pt)
- [ ] SEO optimization (metadata, sitemap)
- [ ] Ad integration (AdSense + AdMob)
- [ ] E2E tests (Playwright + Detox)
- [ ] Production deployment (Vercel + EAS)

---

## 15. Success Metrics

### Technical Metrics
- **Test Coverage:** >80% for domain/application layers
- **Lighthouse Score:** >90 (Performance, Accessibility, SEO)
- **Bundle Size:** <500KB (web), <20MB (mobile)
- **Error Rate:** <1% (Sentry)

### Business Metrics
- **User Retention:** >40% (Day 7)
- **Session Duration:** >10 minutes average
- **Ad Revenue:** >$0.50 RPM (Revenue per Mille)
- **App Store Rating:** >4.5 stars

---

## 16. Security Considerations

### 🚨 Critical: CVE-2025-55182 (React2Shell)

**Severity:** CRITICAL (CVSS 10.0)  
**Status:** Actively exploited in the wild since December 2025

#### Vulnerability Details

CVE-2025-55182 is an **unauthenticated Remote Code Execution (RCE)** vulnerability affecting React Server Components and Next.js. The flaw exists in the "Flight" protocol used for streaming data between client and server, allowing attackers to execute arbitrary code by sending crafted HTTP requests.

#### Affected Versions

**Next.js:**
- ❌ Vulnerable: 15.0.4, 15.1.8, 15.2.5, 15.3.5, 15.4.7, 15.5.6, 16.0.6
- ❌ Vulnerable: All versions ≥14.3.0-canary.77 and <14.2.25
- ✅ **Patched: 15.1.9+, 14.2.25+**

**React Server Components:**
- ❌ Vulnerable: 19.0.0, 19.1.0, 19.1.1, 19.2.0
- ✅ **Patched: 19.0.1+**

#### Immediate Actions Required

1. **Upgrade Immediately:**
```bash
# For Next.js 15.x projects
npm install next@15.1.9 react@19.0.1 react-dom@19.0.1

# For Next.js 14.x projects (LTS)
npm install next@14.2.25 react@18.3.1 react-dom@18.3.1
```

2. **Verify Patched Versions:**
```bash
npm list next react react-dom
```

3. **Rotate Secrets:**
If your application was deployed with vulnerable versions before December 4, 2025:
- Rotate all API keys
- Rotate database credentials
- Rotate authentication secrets
- Review server logs for suspicious activity

4. **Use Automated Fix (Optional):**
```bash
npx fix-react2shell-next
```

#### Additional Related Vulnerabilities

**CVE-2025-55183 (Medium):** Source Code Exposure
- Crafted requests can leak Server Function source code
- **Mitigation:** Upgrade to patched versions

**CVE-2025-55184 & CVE-2025-67779 (High):** Denial of Service
- Crafted requests can cause infinite loops
- **Mitigation:** Upgrade to latest patched versions

#### Prevention in CI/CD

Add security scanning to your GitHub Actions:

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  pull_request:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      - name: Check for vulnerable Next.js versions
        run: |
          NEXT_VERSION=$(npm list next --depth=0 --json | jq -r '.dependencies.next.version')
          if [[ "$NEXT_VERSION" =~ ^15\. ]]; then
            if [[ $(echo "$NEXT_VERSION 15.1.9" | awk '{print ($1 < $2)}') -eq 1 ]]; then
              echo "❌ Vulnerable Next.js version detected: $NEXT_VERSION"
              echo "Please upgrade to 15.1.9 or higher"
              exit 1
            fi
          elif [[ "$NEXT_VERSION" =~ ^14\. ]]; then
            if [[ $(echo "$NEXT_VERSION 14.2.25" | awk '{print ($1 < $2)}') -eq 1 ]]; then
              echo "❌ Vulnerable Next.js version detected: $NEXT_VERSION"
              echo "Please upgrade to 14.2.25 or higher"
              exit 1
            fi
          fi
          echo "✅ Next.js version is secure: $NEXT_VERSION"
      
      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

#### Monitoring & Detection

Add runtime monitoring to detect exploitation attempts:

```typescript
// apps/next/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Detect suspicious Flight protocol requests
  const contentType = request.headers.get('content-type')
  const rscHeader = request.headers.get('rsc')
  
  if (contentType?.includes('text/x-component') || rscHeader) {
    // Log for security monitoring
    console.warn('[Security] RSC request detected', {
      url: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers.get('user-agent')
    })
    
    // Optional: Add rate limiting for RSC endpoints
    // Optional: Send alert to security monitoring service
  }
  
  return NextResponse.next()
}
```

#### Resources

- [Next.js Security Advisory](https://nextjs.org/blog/security-nextjs-server-components-rce)
- [Vercel Security Statement](https://vercel.com/blog/security-update-react-server-components)
- [CVE-2025-55182 Details](https://nvd.nist.gov/vuln/detail/CVE-2025-55182)
- [Google Threat Intelligence Report](https://blog.google/threat-analysis-group/react2shell-exploitation/)

---

## 17. Resources & Documentation

### Official Documentation
- [Solito](https://solito.dev)
- [Next.js 15](https://nextjs.org/docs)
- [Expo SDK 51](https://docs.expo.dev)
- [NativeWind v4](https://www.nativewind.dev)
- [TanStack Query](https://tanstack.com/query/latest)

### Architecture References
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

### Example Repositories
- [Solito Starter](https://github.com/nandorojo/solito)
- [T3 Stack](https://create.t3.gg) (Clean Architecture inspiration)

---

**Last Updated:** 2025-12-14  
**Version:** 2.0.0
