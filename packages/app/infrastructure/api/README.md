# API Repositories - Actualización basada en Swagger

Este documento describe las mejoras realizadas en los repositorios de API basándose en la especificación Swagger del backend.

## 📋 Resumen de Cambios

### 1. **StationApiRepository** (Mejorado)
- ✅ Manejo de errores HTTP específicos (400, 403, 404, 503)
- ✅ Timeout extendido para búsquedas (60 segundos)
- ✅ Soporte para filtrado por país en `getPopular()`
- ✅ Mensajes de error descriptivos para usuarios

### 2. **FavoritesApiRepository** (Nuevo)
- ✅ Obtener favoritos del usuario autenticado
- ✅ Agregar estación a favoritos
- ✅ Eliminar estación de favoritos
- ✅ Manejo de errores 401, 403, 404, 409

### 3. **AnalyticsApiRepository** (Nuevo)
- ✅ Búsquedas en tendencia (Premium only)
- ✅ Estaciones populares con estadísticas (Premium only)
- ✅ Conteo de usuarios activos (Premium only)
- ✅ Soporte para rangos de tiempo: day, week, month

### 4. **AuthApiRepository** (Nuevo)
- ✅ Registro de nuevos usuarios
- ✅ Login con email y password
- ✅ Refresh de tokens JWT
- ✅ Obtener información del usuario actual

## 🚀 Uso de los Repositorios

### StationApiRepository

```typescript
import { StationApiRepository } from '@radio-app/app'

const stationRepo = new StationApiRepository()

// Buscar estaciones con timeout extendido
try {
  const stations = await stationRepo.search('rock', 20)
} catch (error) {
  // Errores específicos: timeout, 503 (service unavailable), etc.
  console.error(error.message)
}

// Obtener estaciones populares con filtro de país
const popularInSpain = await stationRepo.getPopular(20, 'ES')

// Obtener estación por ID
try {
  const station = await stationRepo.findById('station-123')
} catch (error) {
  // Maneja 403 (Premium only), 404, 503, etc.
}
```

### FavoritesApiRepository

```typescript
import { FavoritesApiRepository } from '@radio-app/app'

const favoritesRepo = new FavoritesApiRepository()

// Obtener todos los favoritos (requiere autenticación)
const favorites = await favoritesRepo.getFavorites()

// Agregar favorito
try {
  await favoritesRepo.addFavorite('station-123')
} catch (error) {
  // Maneja 401 (no autenticado), 403 (Premium only), 404, 409 (ya existe)
  console.error(error.message)
}

// Eliminar favorito
await favoritesRepo.removeFavorite('station-123')
```

### AnalyticsApiRepository (Premium Only)

```typescript
import { AnalyticsApiRepository, TimeRange } from '@radio-app/app'

const analyticsRepo = new AnalyticsApiRepository()

// Obtener búsquedas en tendencia
try {
  const trending = await analyticsRepo.getTrendingSearches('week', 10)
  // trending: [{ term: 'rock', count: 150 }, ...]
} catch (error) {
  // Maneja 401, 403 (no Premium)
  console.error(error.message)
}

// Obtener estaciones populares
const popular = await analyticsRepo.getPopularStations('month', 20)
// popular: [{ station_id: '123', name: 'BBC Radio', play_count: 5000 }, ...]

// Obtener usuarios activos
const activeUsers = await analyticsRepo.getActiveUsers()
// activeUsers: { count: 1234, period: 'current' }
```

### AuthApiRepository

```typescript
import { AuthApiRepository, LoginRequest, RegisterRequest } from '@radio-app/app'

const authRepo = new AuthApiRepository()

// Registrar nuevo usuario
const tokens = await authRepo.register({
  email: 'user@example.com',
  password: 'securepass123'
})
// tokens: { access_token, refresh_token, token_type, expires_in }

// Login
try {
  const tokens = await authRepo.login({
    email: 'user@example.com',
    password: 'securepass123'
  })
} catch (error) {
  // Maneja 401 (credenciales incorrectas)
  console.error(error.message)
}

// Refresh token
const newToken = await authRepo.refreshToken({
  refresh_token: 'existing-refresh-token'
})

// Obtener usuario actual
const user = await authRepo.getCurrentUser()
// user: { id, email, role, is_premium, created_at }
```

## 🔧 Configuración del API Client

El API client incluye interceptores automáticos para:

1. **Agregar JWT automáticamente** a todas las peticiones
2. **Refresh automático** de tokens cuando expiran (401)
3. **Timeout configurables** (30s global, 60s para búsquedas)

```typescript
import { initializeApiClient } from '@radio-app/app'

// Inicializar con storage de tokens
initializeApiClient({
  getAccessToken: async () => localStorage.getItem('access_token'),
  getRefreshToken: async () => localStorage.getItem('refresh_token'),
  setAccessToken: async (token) => localStorage.setItem('access_token', token),
  clearTokens: async () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
})
```

## 📊 Manejo de Errores

Todos los repositorios ahora manejan errores HTTP específicos con mensajes descriptivos:

| Código | Descripción | Ejemplo de Mensaje |
|--------|-------------|-------------------|
| 400 | Bad Request | "Parámetro de búsqueda requerido" |
| 401 | Unauthorized | "Debes iniciar sesión" |
| 403 | Forbidden | "Solo disponible para usuarios Premium" |
| 404 | Not Found | "Estación no encontrada" |
| 409 | Conflict | "Estación ya está en favoritos" |
| 503 | Service Unavailable | "Servicio temporalmente no disponible" |
| Timeout | Request Timeout | "La búsqueda está tardando más de lo esperado" |

## 🔐 Autenticación

Todas las rutas marcadas con 🔒 requieren autenticación JWT:

- `/favorites/*` - Gestión de favoritos
- `/analytics/*` - Analytics (Premium only)
- `/auth/me` - Información del usuario

El API client maneja automáticamente el refresh de tokens cuando expiran.

## 🎯 Circuit Breaker

El backend implementa Circuit Breaker para proteger servicios externos. 
Los endpoints pueden retornar **503** cuando:
- El servicio externo está sobrecargado
- El Circuit Breaker está abierto (demasiados errores)

Todos los repositorios manejan este error con mensajes apropiados.

## 📝 Notas Importantes

1. **Timeout aumentado**: El timeout global es ahora 30s, y 60s para búsquedas
2. **Favoritos**: Ahora usan API en lugar de localStorage (requiere backend)
3. **Analytics**: Solo disponible para usuarios Premium
4. **Filtros**: `getPopular()` ahora acepta filtro de país opcional
