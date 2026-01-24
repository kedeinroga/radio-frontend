# Plan de Migración: De Monorepo a Aplicación Next.js Standalone

## 📋 Resumen Ejecutivo

**Objetivo**: Convertir el monorepo actual en una aplicación Next.js standalone, eliminando la complejidad del workspace y resolviendo los problemas de build en Vercel.

**Tiempo estimado**: 2-4 horas

**Riesgo**: Bajo (proceso reversible, sin pérdida de funcionalidad)

---

## 🎯 Beneficios Esperados

### Problemas que se resuelven:
- ✅ Build crashes en Vercel durante "Collecting page data"
- ✅ Problemas de transpilación de `@radio-app/app`
- ✅ Complejidad de configuración de monorepo
- ✅ Problemas con React Native imports
- ✅ Path alias resolution issues

### Mejoras:
- 🚀 Build más rápido (sin transpilación de packages externos)
- 📦 Deploy más simple y confiable
- 🔧 Configuración más straightforward
- 🐛 Debugging más fácil

---

## 📁 Estructura Actual vs Propuesta

### Actual (Monorepo):
```
radio-front/
├── apps/
│   ├── expo/          # App móvil (se mantiene separada)
│   └── next/          # Web app
├── packages/
│   └── app/           # Código compartido (PROBLEMA)
├── package.json       # Root workspace
└── turbo.json
```

### Propuesta (Standalone con Clean Architecture):
```
radio-front/
├── src/
│   ├── app/                    # Next.js App Router (Presentation Layer)
│   │   ├── [locale]/
│   │   ├── api/
│   │   └── layout.tsx
│   │
│   ├── components/             # UI Components (Presentation Layer)
│   │   ├── atoms/             # Componentes básicos reutilizables
│   │   ├── molecules/         # Composición de atoms
│   │   ├── organisms/         # Composición de molecules
│   │   └── templates/         # Layouts de página
│   │
│   ├── hooks/                  # React Hooks (Presentation Layer)
│   │   ├── useAuth.ts
│   │   ├── usePlayer.ts
│   │   └── ...
│   │
│   ├── lib/                    # Utilities & Helpers (Presentation Layer)
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   └── validators.ts
│   │
│   ├── domain/                 # CORE BUSINESS LOGIC (Clean Architecture)
│   │   ├── entities/          # Entidades de negocio
│   │   │   ├── Station.ts
│   │   │   ├── User.ts
│   │   │   └── Advertisement.ts
│   │   ├── repositories/      # Interfaces (Dependency Inversion)
│   │   │   ├── IStationRepository.ts
│   │   │   └── IUserRepository.ts
│   │   ├── valueObjects/      # Value Objects (DDD)
│   │   │   ├── Locale.ts
│   │   │   └── AdPlacement.ts
│   │   └── errors/            # Domain Errors
│   │       └── DomainErrors.ts
│   │
│   ├── application/            # USE CASES (Clean Architecture)
│   │   ├── useCases/
│   │   │   ├── stations/
│   │   │   │   ├── GetRelatedStations.ts
│   │   │   │   └── SearchStations.ts
│   │   │   ├── auth/
│   │   │   │   ├── Login.ts
│   │   │   │   └── Logout.ts
│   │   │   └── seo/
│   │   │       ├── GetSitemapData.ts
│   │   │       └── GetPopularCountries.ts
│   │   └── ports/             # Interfaces para adaptadores
│   │       ├── ITranslator.ts
│   │       └── ILocaleFormatter.ts
│   │
│   ├── infrastructure/         # ADAPTERS (Clean Architecture)
│   │   ├── api/               # HTTP Repositories (implementan interfaces)
│   │   │   ├── StationApiRepository.ts
│   │   │   ├── SEOApiRepository.ts
│   │   │   └── apiClient.ts
│   │   ├── storage/           # Storage adapters
│   │   │   ├── WebSecureStorage.ts
│   │   │   └── ISecureStorage.ts
│   │   ├── audio/             # Audio player adapters
│   │   │   └── HowlerPlayerAdapter.ts
│   │   ├── i18n/              # Internationalization adapters
│   │   │   ├── NextIntlAdapter.ts
│   │   │   └── LocaleFormatter.ts
│   │   └── logging/           # Logging adapters
│   │       ├── ConsoleLogger.ts
│   │       └── SecurityLogger.ts
│   │
│   ├── stores/                 # State Management (Application Layer)
│   │   ├── playerStore.ts     # Zustand stores
│   │   └── authStore.ts
│   │
│   └── types/                  # TypeScript type definitions
│       └── global.d.ts
│
├── public/                     # Static assets
├── package.json
├── next.config.js
└── tsconfig.json
```

**Principios aplicados:**
- ✅ **Dependency Inversion**: Domain no depende de Infrastructure
- ✅ **Single Responsibility**: Cada capa tiene una responsabilidad clara
- ✅ **Open/Closed**: Fácil extender sin modificar código existente
- ✅ **Interface Segregation**: Interfaces pequeñas y específicas
- ✅ **DRY**: Sin código duplicado
- ✅ **KISS**: Estructura simple y clara

---

## 🔄 Plan de Migración Paso a Paso

### Fase 1: Preparación (15 min)

#### 1.1 Backup
```bash
# Crear backup del estado actual
git checkout -b backup-monorepo
git push origin backup-monorepo

# Volver a main
git checkout main
git checkout -b migration-standalone
```

#### 1.2 Crear nueva estructura base
```bash
cd apps/next
mkdir -p temp-migration
```

---

### Fase 2: Mover código respetando Clean Architecture (60 min)

#### 2.1 Copiar capas en orden correcto

```bash
cd /Users/kedeinroga/Documents/emprende/radio-front

# CAPA 1: Domain (núcleo, sin dependencias)
cp -r packages/app/domain apps/next/src/domain

# CAPA 2: Application (depende solo de domain)
cp -r packages/app/application apps/next/src/application

# CAPA 3: Infrastructure (implementa interfaces de domain/application)
cp -r packages/app/infrastructure apps/next/src/infrastructure

# CAPA 4: Stores (estado de aplicación)
cp -r packages/app/stores apps/next/src/stores
```

#### 2.2 Organizar componentes UI según Atomic Design

```bash
# Crear estructura de componentes
mkdir -p apps/next/src/components/{atoms,molecules,organisms,templates}

# Mover componentes SEO (Next.js específicos)
cp -r packages/app/components/SEO apps/next/src/components/organisms/

# Los componentes React Native NO se copian
# Ya existen equivalentes en apps/next/components/
```

#### 2.3 Verificar independencia de capas

**CRÍTICO**: Asegurar que las dependencias fluyan en una sola dirección:

```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓            ↑           ↑
  (hooks)      (use cases)  (entities)  (adapters)
```

**Reglas:**
- ✅ Domain NO puede importar nada de otras capas
- ✅ Application solo importa de Domain
- ✅ Infrastructure implementa interfaces de Domain/Application
- ✅ Presentation usa Application y puede inyectar Infrastructure

#### 2.4 Crear barrels exports por capa

**Crear**: `apps/next/src/domain/index.ts`
```typescript
// Domain Layer - Entities
export * from './entities/Station'
export * from './entities/User'
export * from './entities/Advertisement'

// Domain Layer - Value Objects
export * from './valueObjects/Locale'
export * from './valueObjects/AdPlacement'

// Domain Layer - Repository Interfaces (NO implementaciones)
export type { IStationRepository } from './repositories/IStationRepository'
export type { IUserRepository } from './repositories/IUserRepository'

// Domain Layer - Errors
export * from './errors/DomainErrors'
```

**Crear**: `apps/next/src/application/index.ts`
```typescript
// Application Layer - Use Cases
export { GetRelatedStations } from './useCases/stations/GetRelatedStations'
export { SearchStations } from './useCases/stations/SearchStations'
export { Login } from './useCases/auth/Login'
export { GetSitemapData } from './useCases/seo/GetSitemapData'

// Application Layer - Ports (interfaces para adapters)
export type { ITranslator } from './ports/ITranslator'
export type { ILocaleFormatter } from './ports/ILocaleFormatter'
```

**Crear**: `apps/next/src/infrastructure/index.ts`
```typescript
// Infrastructure Layer - API Repositories (implementaciones)
export { StationApiRepository } from './api/StationApiRepository'
export { SEOApiRepository } from './api/SEOApiRepository'
export { AuthApiRepository } from './api/AuthApiRepository'

// Infrastructure Layer - Adapters
export { HowlerPlayerAdapter } from './audio/HowlerPlayerAdapter'
export { NextIntlAdapter } from './i18n/NextIntlAdapter'
export { WebSecureStorage } from './storage/WebSecureStorage'

// Infrastructure Layer - Utilities
export { apiClient, initializeApiClient } from './api/apiClient'
```

**Crear**: `apps/next/src/components/index.ts`
```typescript
// Presentation Layer - UI Components
export { StationCard } from './organisms/StationCard'
export { PlayerBar } from './organisms/PlayerBar'
export { LoadingSpinner } from './atoms/LoadingSpinner'
export { EmptyState } from './molecules/EmptyState'
```

---

### Fase 3: Actualizar Imports respetando dependencias (90 min)

#### 3.1 Crear script inteligente de actualización

**Crear**: `apps/next/scripts/update-imports-clean-arch.js`

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapa de reemplazos según capa
const importMappings = {
  // Domain Layer
  'Station': '@/domain/entities/Station',
  'User': '@/domain/entities/User',
  'Advertisement': '@/domain/entities/Advertisement',
  'IStationRepository': '@/domain/repositories/IStationRepository',
  
  // Application Layer  
  'GetRelatedStations': '@/application/useCases/stations/GetRelatedStations',
  'GetSitemapData': '@/application/useCases/seo/GetSitemapData',
  
  // Infrastructure Layer
  'StationApiRepository': '@/infrastructure/api/StationApiRepository',
  'SEOApiRepository': '@/infrastructure/api/SEOApiRepository',
  'apiClient': '@/infrastructure/api/apiClient',
  
  // Stores
  'usePlayerStore': '@/stores/playerStore',
  'useAuthStore': '@/stores/authStore',
};

// Patrón de detección de capa por directorio
const layerPatterns = {
  'src/domain': 'domain',
  'src/application': 'application',
  'src/infrastructure': 'infrastructure',
  'src/components': 'presentation',
  'src/app': 'presentation',
  'src/hooks': 'presentation',
};

function getLayerFromPath(filePath) {
  for (const [pattern, layer] of Object.entries(layerPatterns)) {
    if (filePath.includes(pattern)) return layer;
  }
  return 'unknown';
}

function validateDependency(fromLayer, toLayer, importName, filePath) {
  const validDeps = {
    domain: [],                                    // No dependencies
    application: ['domain'],                       // Only domain
    infrastructure: ['domain', 'application'],     // Domain + Application
    presentation: ['domain', 'application', 'infrastructure'], // All layers
  };
  
  if (!validDeps[fromLayer]?.includes(toLayer) && fromLayer !== toLayer) {
    console.warn(`⚠️  VIOLATION: ${filePath}`);
    console.warn(`   ${fromLayer} → ${toLayer} (importing ${importName})`);
    console.warn(`   Clean Architecture: ${fromLayer} should not depend on ${toLayer}\n`);
    return false;
  }
  return true;
}

// Encuentra todos los archivos
const files = glob.sync('src/**/*.{ts,tsx}', { 
  cwd: process.cwd(),
  ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts']
});

let violations = 0;
let updates = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  const fromLayer = getLayerFromPath(file);
  
  // Reemplazar imports de @radio-app/app
  content = content.replace(
    /import\s+{([^}]+)}\s+from\s+['"]@radio-app\/app['"]/g,
    (match, imports) => {
      const importList = imports.split(',').map(i => i.trim());
      const newImports = [];
      
      importList.forEach(importName => {
        const cleanName = importName.replace(/^type\s+/, '');
        const newPath = importMappings[cleanName];
        
        if (newPath) {
          const toLayer = newPath.split('/')[1]; // Extract layer from path
          
          // Validate Clean Architecture rules
          if (!validateDependency(fromLayer, toLayer, cleanName, file)) {
            violations++;
          }
          
          newImports.push(`import { ${importName} } from '${newPath}'`);
          modified = true;
        } else {
          // Fallback to barrel export
          newImports.push(`import { ${importName} } from '@/lib/shared'`);
        }
      });
      
      return newImports.join('\n');
    }
  );
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    updates++;
    console.log(`✓ Updated: ${file}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✓ ${updates} files updated`);
console.log(`   ⚠️  ${violations} architecture violations detected\n`);

if (violations > 0) {
  console.log('⚠️  Please fix architecture violations before proceeding!\n');
  process.exit(1);
}
```

#### 3.2 Ejecutar validación y actualización
```bash
cd apps/next
node scripts/update-imports-clean-arch.js
```

Si hay violaciones de arquitectura, el script las mostrará y deberás corregirlas manualmente.

#### 3.3 Patrones de import según capa

**En Domain** (entities, repositories, value objects):
```typescript
// ❌ NUNCA importar de otras capas
import { StationApiRepository } from '@/infrastructure/api/StationApiRepository' // WRONG!

// ✅ Solo importar dentro de domain
import { User } from './User'
import type { IUserRepository } from '../repositories/IUserRepository'
```

**En Application** (use cases):
```typescript
// ✅ Importar de Domain (entities, interfaces)
import { Station } from '@/domain/entities/Station'
import type { IStationRepository } from '@/domain/repositories/IStationRepository'

// ❌ NUNCA importar Infrastructure directamente
import { StationApiRepository } from '@/infrastructure/api/StationApiRepository' // WRONG!
```

**En Infrastructure** (repositories, adapters):
```typescript
// ✅ Implementar interfaces de Domain
import type { IStationRepository } from '@/domain/repositories/IStationRepository'
import { Station } from '@/domain/entities/Station'

// ✅ Usar otros adapters de Infrastructure
import { apiClient } from './apiClient'
```

**En Presentation** (components, hooks, pages):
```typescript
// ✅ Usar Use Cases (Application)
import { GetRelatedStations } from '@/application/useCases/stations/GetRelatedStations'

// ✅ Inyectar Infrastructure (Dependency Injection)
import { StationApiRepository } from '@/infrastructure/api/StationApiRepository'

// ✅ Usar Domain entities
import { Station } from '@/domain/entities/Station'

// ✅ Usar stores
import { usePlayerStore } from '@/stores/playerStore'
```

#### 3.4 Dependency Injection Pattern

**Ejemplo correcto en una página Next.js**:

```typescript
// app/[locale]/radio/[id]/page.tsx
import { GetRelatedStations } from '@/application/useCases/stations/GetRelatedStations'
import { StationApiRepository } from '@/infrastructure/api/StationApiRepository'
import type { Station } from '@/domain/entities/Station'

export default async function RadioPage({ params }: { params: { id: string } }) {
  // Inyectar dependencia (Infrastructure) en Use Case (Application)
  const repository = new StationApiRepository()
  const useCase = new GetRelatedStations(repository)
  
  // Ejecutar lógica de negocio
  const station = await repository.findById(params.id)
  const related = await useCase.execute(station, 6)
  
  return <StationDetails station={station} related={related} />
}
```

**Patrón de Factory (opcional pero recomendado)**:

**Crear**: `apps/next/src/lib/factories/UseCaseFactory.ts`
```typescript
import { StationApiRepository } from '@/infrastructure/api/StationApiRepository'
import { SEOApiRepository } from '@/infrastructure/api/SEOApiRepository'
import { GetRelatedStations } from '@/application/useCases/stations/GetRelatedStations'
import { GetSitemapData } from '@/application/useCases/seo/GetSitemapData'

// Factory centralizada para crear use cases con sus dependencias
export class UseCaseFactory {
  private static stationRepo = new StationApiRepository()
  private static seoRepo = new SEOApiRepository()
  
  static createGetRelatedStations() {
    return new GetRelatedStations(this.stationRepo)
  }
  
  static createGetSitemapData() {
    return new GetSitemapData(this.seoRepo)
  }
}

// Uso en páginas:
// const useCase = UseCaseFactory.createGetRelatedStations()
```

---

### Fase 4: Configuración (30 min)

#### 4.1 Actualizar package.json

**Archivo**: `apps/next/package.json`

```json
{
  "name": "radio-app-next",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    // Copiar TODAS las dependencies de packages/app/package.json
    "@stripe/stripe-js": "^8.6.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "howler": "^2.2.4",
    "lucide-react": "^0.561.0",
    "next": "^15.5.9",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-native-web": "^0.21.2",
    "stripe": "^20.1.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "web-vitals": "^5.1.0",
    "zod": "^4.2.1",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/howler": "^2.2.11",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "15.1.9"
  }
}
```

#### 4.2 Actualizar tsconfig.json

**Archivo**: `apps/next/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/domain/*": ["./src/domain/*"],
      "@/application/*": ["./src/application/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/stores/*": ["./src/stores/*"]
    },
    "baseUrl": "."
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 4.3 Simplificar next.config.js

**Archivo**: `apps/next/next.config.js`

```javascript
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // YA NO necesitamos transpilePackages
  reactStrictMode: true,
  
  typescript: {
    ignoreBuildErrors: false, // Ahora podemos habilitar type checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Ahora podemos habilitar linting
  },
  
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  
  // Configuración simplificada de webpack
  webpack: (config, { isServer }) => {
    // Alias @ ya está configurado por Next.js automáticamente
    
    // Excluir React Native en cliente
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-native$': 'react-native-web',
      };
    }
    
    // Externalizar react-native en servidor
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('react-native');
      }
    }
    
    return config;
  },
  
  // Resto de configuración (headers, images, etc.) igual
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  },
  
  // ... resto de headers igual
};

module.exports = nextConfig;
```

#### 4.4 Crear barrel exports (SOLO para conveniencia, NO para romper encapsulación)

**IMPORTANTE**: Los barrel exports son para facilitar imports, NO para exponer todo sin control.

**Crear**: `apps/next/src/lib/shared/index.ts`

```typescript
/**
 * Barrel Export for Shared Code
 * 
 * IMPORTANTE: Solo exportar lo que es público API
 * NO exportar implementaciones internas
 */

// ============================================
// DOMAIN LAYER (Core Business Logic)
// ============================================

// Entities (Business Objects)
export { Station } from '@/domain/entities/Station'
export type { StationDTO, SEOMetadata } from '@/domain/entities/Station'
export { User } from '@/domain/entities/User'
export { PopularCountry } from '@/domain/entities/PopularCountry'
export { PopularTag } from '@/domain/entities/PopularTag'

// Repository Interfaces (Dependency Inversion Principle)
export type { IStationRepository } from '@/domain/repositories/IStationRepository'
export type { IUserRepository } from '@/domain/repositories/IUserRepository'
export type { ISEORepository } from '@/domain/repositories/ISEORepository'

// Value Objects (DDD)
export { Locale } from '@/domain/valueObjects/Locale'
export type { LocaleCode } from '@/domain/valueObjects/Locale'
export type { AdPlacement } from '@/domain/valueObjects/AdPlacement'

// Domain Errors
export * from '@/domain/errors/DomainErrors'

// ============================================
// APPLICATION LAYER (Use Cases)
// ============================================

// Station Use Cases
export { GetRelatedStations } from '@/application/useCases/stations/GetRelatedStations'
export { SearchStations } from '@/application/useCases/stations/SearchStations'

// SEO Use Cases
export { GetSitemapData } from '@/application/useCases/seo/GetSitemapData'
export { GetPopularCountries } from '@/application/useCases/seo/GetPopularCountries'
export { GetPopularTags } from '@/application/useCases/seo/GetPopularTags'

// Auth Use Cases
export { Login } from '@/application/useCases/auth/Login'
export { Logout } from '@/application/useCases/auth/Logout'

// Application Ports (Interfaces)
export type { ITranslator } from '@/application/ports/ITranslator'
export type { ILocaleFormatter } from '@/application/ports/ILocaleFormatter'

// ============================================
// INFRASTRUCTURE LAYER (Adapters)
// ============================================

// API Repositories (Implementations)
export { StationApiRepository } from '@/infrastructure/api/StationApiRepository'
export { SEOApiRepository } from '@/infrastructure/api/SEOApiRepository'
export { AuthApiRepository } from '@/infrastructure/api/AuthApiRepository'
export { AdvertisementApiRepository } from '@/infrastructure/api/AdvertisementApiRepository'

// API Client
export { 
  default as apiClient, 
  initializeApiClient, 
  setApiLocale 
} from '@/infrastructure/api/apiClient'

// Storage Adapters
export { WebSecureStorage } from '@/infrastructure/storage/WebSecureStorage'
export type { ISecureStorage } from '@/infrastructure/storage/ISecureStorage'

// Audio Adapters
export { HowlerPlayerAdapter } from '@/infrastructure/audio/HowlerPlayerAdapter'

// I18n Adapters
export { NextIntlAdapter } from '@/infrastructure/i18n/NextIntlAdapter'
export { LocaleFormatter } from '@/infrastructure/i18n/LocaleFormatter'

// Logging
export { ConsoleLogger } from '@/infrastructure/logging/ConsoleLogger'
export { securityLogger, SecurityLog } from '@/infrastructure/logging/SecurityLogger'

// ============================================
// STATE MANAGEMENT
// ============================================

export { usePlayerStore } from '@/stores/playerStore'
export { useAuthStore } from '@/stores/authStore'

// ============================================
// VALIDATION & UTILITIES
// ============================================

export { 
  validateData,
  sanitizeInput,
  sanitizeAdUrl,
  sanitizeAdText
} from '@/infrastructure/validation/sanitization'
```

**Uso correcto**:
```typescript
// ✅ BUENO: Import específico desde barrel
import { Station, StationApiRepository } from '@/lib/shared'

// ✅ MEJOR: Import directo (más explícito)
import { Station } from '@/domain/entities/Station'
import { StationApiRepository } from '@/infrastructure/api/StationApiRepository'

// ❌ MALO: Import de todo
import * as Shared from '@/lib/shared' // Evitar esto
```

---

### Fase 5: Mover archivos de configuración raíz (15 min)

#### 5.1 Mover archivos a apps/next como raíz del proyecto

```bash
# Desde la raíz actual
cd /Users/kedeinroga/Documents/emprende/radio-front

# Mover archivos importantes
mv apps/next nueva-estructura-temp/

# En el futuro, esta será la raíz
```

#### 5.2 Actualizar vercel.json

**Archivo**: `vercel.json` (en la nueva raíz)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate=300"
        }
      ]
    }
  ],
  
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.rradio.online/api/v1/:path*"
    }
  ]
}
```

---

### Fase 6: Testing (30 min)

#### 6.1 Instalar dependencias
```bash
cd apps/next
rm -rf node_modules package-lock.json
npm install
```

#### 6.2 Verificar compilación
```bash
npm run type-check
```

Resolver errores de tipos si hay.

#### 6.3 Build local
```bash
npm run build
```

Debe completar sin errores.

#### 6.4 Test local
```bash
npm run dev
```

Verificar:
- ✅ Aplicación carga correctamente
- ✅ API calls funcionan
- ✅ Páginas se renderizan
- ✅ No hay errores en consola

---

### Fase 7: Reestructurar repositorio (20 min)

#### 7.1 Opción A: Mantener expo separado

Si quieres mantener la app móvil:

```
radio-front/
├── web/              # La app Next.js standalone
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── mobile/           # Renombrar apps/expo
│   └── ...
└── README.md
```

Comandos:
```bash
# Crear estructura
mkdir web mobile
mv apps/next/* web/
mv apps/expo/* mobile/
rm -rf apps packages turbo.json
```

#### 7.2 Opción B: Solo Next.js (recomendado si no usas expo)

```
radio-front/
├── src/
├── public/
├── package.json
└── next.config.js
```

Comandos:
```bash
# Mover todo a raíz
mv apps/next/* ./
rm -rf apps packages turbo.json
```

---

### Fase 8: Limpiar archivos obsoletos (10 min)

#### 8.1 Eliminar configuración de monorepo
```bash
# Ya no necesitas:
rm turbo.json
rm -rf packages/
rm -rf apps/  # Si moviste todo

# Actualizar .gitignore
# Eliminar referencias a workspaces si hay
```

#### 8.2 Actualizar package.json raíz (si mantuviste estructura multi-proyecto)

```json
{
  "name": "radio-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:web": "cd web && npm run dev",
    "build:web": "cd web && npm run build",
    "dev:mobile": "cd mobile && npm start"
  }
}
```

---

### Fase 9: Deploy a Vercel (15 min)

#### 9.1 Actualizar configuración en Vercel

1. **Settings → General**:
   - Root Directory: `web/` (si usaste opción A) o `/` (si opción B)
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. **Settings → Environment Variables**:
   - `NEXT_PUBLIC_API_URL=https://api.rradio.online/api/v1`
   - `NEXT_PUBLIC_BASE_URL=https://rradio.online`
   - Todas las demás variables que necesites

#### 9.2 Trigger deploy
```bash
git add -A
git commit -m "refactor: Migrate from monorepo to standalone Next.js app"
git push origin migration-standalone
```

#### 9.3 Verificar build en Vercel

El build debería:
- ✅ Completar sin errores
- ✅ No tener worker crashes
- ✅ Generar todas las páginas correctamente

---

## 📊 Checklist de Verificación

### Pre-migración:
- [ ] Backup del código actual (branch)
- [ ] Lista de todas las funcionalidades actuales
- [ ] Screenshots de la app funcionando
- [ ] Documentar arquitectura actual

### Durante migración:
- [ ] Copiar capas en orden correcto (Domain → Application → Infrastructure)
- [ ] Verificar independencia de Domain (no imports externos)
- [ ] Validar dependencias con script
- [ ] Crear barrel exports solo para público API
- [ ] Implementar factories para Dependency Injection

### Post-migración (Funcionalidad):
- [ ] `npm install` completa sin errores
- [ ] `npm run type-check` pasa
- [ ] `npm run lint` pasa
- [ ] `npm run build` completa exitosamente
- [ ] `npm run dev` funciona localmente
- [ ] Todas las páginas cargan
- [ ] API calls funcionan
- [ ] Autenticación funciona
- [ ] Player de radio funciona
- [ ] Favoritos funcionan
- [ ] Admin panel funciona
- [ ] Deploy en Vercel exitoso
- [ ] App en producción funciona

### Post-migración (Clean Architecture):
- [ ] Domain no tiene imports de otras capas
- [ ] Application solo importa Domain
- [ ] Infrastructure implementa interfaces de Domain
- [ ] Presentation inyecta dependencias correctamente
- [ ] No hay dependencias circulares
- [ ] Use Cases siguen Single Responsibility
- [ ] Repositories implementan interfaces (Dependency Inversion)
- [ ] Value Objects son inmutables
- [ ] Entities contienen lógica de negocio
- [ ] Adapters son intercambiables

### Validación de Principios SOLID:
- [ ] **S**ingle Responsibility: Cada clase tiene una única razón para cambiar
- [ ] **O**pen/Closed: Abierto para extensión, cerrado para modificación
- [ ] **L**iskov Substitution: Implementaciones pueden sustituir interfaces
- [ ] **I**nterface Segregation: Interfaces pequeñas y específicas
- [ ] **D**ependency Inversion: Depender de abstracciones, no de concreciones

---

## 🔧 Troubleshooting

### Problema: Errores de imports
**Solución**: Usar Find & Replace en todo el proyecto:
- Buscar: `from '@radio-app/app'`
- Reemplazar: `from '@/lib/shared'`

### Problema: Tipos no encontrados
**Solución**: Verificar que todos los archivos `.d.ts` estén copiados

### Problema: Build falla con module not found
**Solución**: Verificar `tsconfig.json` paths y que todos los archivos estén copiados

### Problema: Runtime errors
**Solución**: Verificar que todas las dependencias de `packages/app` estén en `apps/next/package.json`

---

## ⏮️ Plan de Rollback

Si algo sale mal:

```bash
# Volver al estado anterior
git checkout main
git branch -D migration-standalone

# O restaurar el backup
git checkout backup-monorepo
git checkout -b main-restored
git push origin main-restored --force
```

---

## 📈 Mejoras Futuras Post-Migración

Una vez migrado exitosamente:

### 1. Re-habilitar validaciones estrictas
```javascript
// next.config.js
typescript: { ignoreBuildErrors: false }
eslint: { ignoreDuringBuilds: false }
```

### 2. Implementar Testing por Capas

**Domain Tests** (lógica de negocio pura):
```typescript
// src/domain/entities/__tests__/Station.test.ts
describe('Station Entity', () => {
  it('should create valid station', () => {
    const station = new Station({...})
    expect(station.isValid()).toBe(true)
  })
})
```

**Application Tests** (use cases con mocks):
```typescript
// src/application/useCases/__tests__/GetRelatedStations.test.ts
describe('GetRelatedStations Use Case', () => {
  it('should return related stations', async () => {
    const mockRepo = createMockRepository()
    const useCase = new GetRelatedStations(mockRepo)
    
    const result = await useCase.execute(station, 6)
    expect(result).toHaveLength(6)
  })
})
```

**Infrastructure Tests** (integration tests):
```typescript
// src/infrastructure/api/__tests__/StationApiRepository.test.ts
describe('StationApiRepository', () => {
  it('should fetch stations from API', async () => {
    const repo = new StationApiRepository()
    const stations = await repo.getPopular(10)
    
    expect(stations).toBeDefined()
    expect(stations[0]).toBeInstanceOf(Station)
  })
})
```

### 3. Optimizar Performance

**ISR para páginas dinámicas**:
```typescript
// Ahora debería funcionar sin problemas
export const revalidate = 3600 // 1 hour

export async function generateStaticParams() {
  const data = await fetchPopularStations()
  return data.map(item => ({ id: item.id }))
}
```

**Edge Runtime para API routes críticas**:
```typescript
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
```

### 4. Implementar Patrones Avanzados

**Repository Pattern con Cache**:
```typescript
// src/infrastructure/api/CachedStationRepository.ts
export class CachedStationRepository implements IStationRepository {
  private cache = new Map()
  
  constructor(private repository: IStationRepository) {}
  
  async findById(id: string): Promise<Station> {
    if (this.cache.has(id)) {
      return this.cache.get(id)
    }
    
    const station = await this.repository.findById(id)
    this.cache.set(id, station)
    return station
  }
}
```

**Strategy Pattern para adapters intercambiables**:
```typescript
// src/infrastructure/audio/AudioPlayerStrategy.ts
interface IAudioPlayer {
  play(url: string): void
  pause(): void
  stop(): void
}

// Implementaciones intercambiables
export class HowlerPlayer implements IAudioPlayer { }
export class HTMLAudioPlayer implements IAudioPlayer { }
export class WebAudioPlayer implements IAudioPlayer { }
```

**Observer Pattern para events**:
```typescript
// src/domain/events/DomainEventPublisher.ts
export class DomainEventPublisher {
  private subscribers = new Map()
  
  subscribe(event: string, handler: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [])
    }
    this.subscribers.get(event).push(handler)
  }
  
  publish(event: string, data: any) {
    this.subscribers.get(event)?.forEach(handler => handler(data))
  }
}
```

### 5. Mejorar Separation of Concerns

**Command Pattern para acciones de usuario**:
```typescript
// src/application/commands/PlayStationCommand.ts
export class PlayStationCommand {
  constructor(
    private playerRepository: IPlayerRepository,
    private analyticsService: IAnalyticsService
  ) {}
  
  async execute(stationId: string): Promise<void> {
    // Lógica de negocio centralizada
    await this.playerRepository.play(stationId)
    await this.analyticsService.trackPlay(stationId)
  }
}
```

**Query Pattern para lecturas**:
```typescript
// src/application/queries/GetStationByIdQuery.ts
export class GetStationByIdQuery {
  constructor(private repository: IStationRepository) {}
  
  async execute(id: string): Promise<StationDTO> {
    const station = await this.repository.findById(id)
    return station.toDTO() // Separar entity de DTO
  }
}
```

### 6. Documentar Arquitectura

**Crear**: `docs/ARCHITECTURE.md`
```markdown
# Architecture Documentation

## Clean Architecture Layers

### 1. Domain Layer (Core Business Logic)
- No dependencies on external libraries
- Contains business rules and entities
- Independent of frameworks

### 2. Application Layer (Use Cases)
- Orchestrates domain entities
- Implements business use cases
- Depends only on domain layer

### 3. Infrastructure Layer (Technical Details)
- Implements interfaces from domain/application
- Contains adapters for external services
- Database, API, Storage implementations

### 4. Presentation Layer (UI/UX)
- Next.js components and pages
- React hooks for UI state
- Depends on all layers through DI

## Dependency Flow
Presentation → Application → Domain ← Infrastructure
```

---

## 💡 Consideraciones Importantes

### Ventajas de la migración:
- ✅ Build confiable en Vercel
- ✅ Configuración más simple
- ✅ Debugging más fácil
- ✅ Deploy más rápido
- ✅ Sin problemas de transpilación

### Desventajas:
- ❌ Código duplicado si mantienes expo
- ❌ No puedes compartir lógica fácilmente entre web/mobile
- ❌ Más difícil mantener consistencia

### Solución para compartir código (si necesitas):
- Crear una librería npm privada
- Usar git submodules
- Publicar package en npm registry privado

---

## ✅ Conclusión

Este plan te permite:
1. Eliminar la complejidad del monorepo
2. Resolver definitivamente los problemas de build en Vercel
3. Mantener TODA la funcionalidad actual
4. Tener un proyecto más mantenible

**Tiempo total estimado: 2-4 horas**

**Riesgo: Bajo** (proceso completamente reversible)

**Recomendación**: Hazlo en un branch separado primero, prueba todo, y solo entonces mergea a main.
