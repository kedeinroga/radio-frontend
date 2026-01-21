# Ad Click Handler - Documentación

Sistema completo de manejo de clicks en anuncios con protección CSRF y fraud detection integrado.

## 📋 Tabla de Contenidos

- [Overview](#overview)
- [Componentes](#componentes)
- [Seguridad](#seguridad)
- [Uso Básico](#uso-básico)
- [Ejemplos Avanzados](#ejemplos-avanzados)
- [API Routes](#api-routes)
- [Testing](#testing)

## 🎯 Overview

El sistema de Ad Click Handler proporciona una capa de seguridad robusta para trackear clicks en anuncios publicitarios. Incluye:

- ✅ **Protección CSRF**: Validación de tokens en cliente y servidor
- ✅ **Fraud Detection**: Integración con sistema de detección de fraude
- ✅ **XSS Protection**: Doble validación de URLs antes de redirigir
- ✅ **Click Tracking**: Registro completo de clicks con metadata
- ✅ **Error Handling**: Manejo graceful de errores con fallbacks
- ✅ **TypeScript**: Tipos completos para mejor DX

## 🧩 Componentes

### 1. AdClickHandler Component

Componente de React que usa render prop pattern para manejar clicks.

```tsx
import { AdClickHandler } from '@/components/ads'

<AdClickHandler
  ad={advertisement}
  impressionId="imp-123"
  onClickTracked={(result) => console.log(result)}
  onError={(error) => console.error(error)}
>
  {(handleClick, isTracking) => (
    <button onClick={handleClick} disabled={isTracking}>
      Click Me
    </button>
  )}
</AdClickHandler>
```

**Props:**
- `ad: Advertisement` - El anuncio que se está clickeando (requerido)
- `impressionId: string` - ID de la impresión asociada (requerido)
- `onClickTracked?: (result: ClickTrackingResult) => void` - Callback al trackear exitosamente
- `onError?: (error: string) => void` - Callback cuando ocurre un error
- `openAfterTracking?: boolean` - Si debe abrir el link automáticamente (default: true)
- `linkTarget?: string` - Target para el link (default: '_blank')
- `children: (handleClick, isTracking) => ReactNode` - Render prop

### 2. useAdClickHandler Hook

Hook simplificado para usar sin render prop.

```tsx
import { useAdClickHandler } from '@/components/ads'

const { handleClick, isTracking } = useAdClickHandler({
  ad: advertisement,
  impressionId: 'imp-123',
  onClickTracked: (result) => console.log(result),
})

return (
  <button onClick={handleClick} disabled={isTracking}>
    Click Me
  </button>
)
```

**Return Value:**
- `handleClick: (e?: React.MouseEvent) => Promise<void>` - Función para manejar el click
- `isTracking: boolean` - Estado de tracking (para loading states)

### 3. ClickTrackingResult Type

```tsx
interface ClickTrackingResult {
  success: boolean
  clickId?: string       // ID único del click (si success)
  fraudScore?: number    // Score de fraude 0-100 (si success)
  error?: string         // Mensaje de error (si !success)
}
```

## 🔒 Seguridad

### CSRF Protection

1. **Cliente**: El hook `useCSRFToken()` genera/obtiene un token CSRF
2. **Request**: El token se envía en el header `X-CSRF-Token`
3. **Servidor**: El API route valida que el token del header coincida con el de la cookie

```typescript
// En AdClickHandler
const csrfToken = useCSRFToken()

// En el fetch
headers: {
  'X-CSRF-Token': csrfToken,
}

// En el servidor (route.ts)
function validateCSRF(request: NextRequest): string | null {
  const headerToken = request.headers.get('x-csrf-token')
  const cookieToken = request.cookies.get('csrf_token')?.value
  
  // Comparación constant-time
  return headerToken === cookieToken ? null : 'Invalid'
}
```

### XSS Protection

Doble validación de URLs:

```typescript
// 1. En AdClickHandler antes de hacer fetch
const sanitizedUrl = sanitizeAdUrl(ad.clickUrl)
if (!sanitizedUrl) {
  console.error('Invalid URL')
  return
}

// 2. Al abrir el link
window.open(sanitizedUrl, '_blank', 'noopener,noreferrer')
```

La función `sanitizeAdUrl` bloquea:
- `javascript:` protocol
- `data:` protocol
- `vbscript:` protocol
- `file:` protocol
- URLs malformadas

### Fraud Detection

Cada click envía metadata para fraud detection:

```typescript
context: {
  timestamp: Date.now(),
  userAgent: navigator.userAgent,
  referrer: document.referrer,
  screenResolution: `${window.screen.width}x${window.screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language,
}
```

El backend analiza estos datos y retorna un `fraudScore` (0-100):
- **0-30**: Click legítimo
- **31-70**: Sospechoso (monitorear)
- **71-100**: Muy probable fraude

## 🚀 Uso Básico

### Ejemplo 1: Banner Clickeable

```tsx
import { useAdClickHandler } from '@/components/ads'

function ClickableBanner({ ad, impressionId }) {
  const { handleClick, isTracking } = useAdClickHandler({
    ad,
    impressionId,
    onClickTracked: (result) => {
      console.log('Click tracked:', result.clickId)
      console.log('Fraud score:', result.fraudScore)
    },
  })

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer ${isTracking ? 'opacity-50' : ''}`}
    >
      <img src={ad.mediaUrl} alt={ad.title} />
      {isTracking && <div className="loading-spinner" />}
    </div>
  )
}
```

### Ejemplo 2: Native Ad Card

```tsx
import { AdClickHandler } from '@/components/ads'

function NativeAdCard({ ad, impressionId }) {
  return (
    <AdClickHandler
      ad={ad}
      impressionId={impressionId}
      onClickTracked={(result) => {
        if (result.fraudScore && result.fraudScore > 70) {
          console.warn('High fraud risk:', result.fraudScore)
        }
      }}
    >
      {(handleClick, isTracking) => (
        <article onClick={handleClick} className="card">
          <img src={ad.mediaUrl} alt={ad.title} />
          <h3>{ad.title}</h3>
          <p>{ad.description}</p>
          <button disabled={isTracking}>
            {isTracking ? 'Processing...' : 'Learn More'}
          </button>
        </article>
      )}
    </AdClickHandler>
  )
}
```

## 🎓 Ejemplos Avanzados

### Custom Navigation (sin abrir automáticamente)

```tsx
const { handleClick, isTracking } = useAdClickHandler({
  ad,
  impressionId,
  openAfterTracking: false, // ⚠️ No abrir automáticamente
  onClickTracked: (result) => {
    if (result.success) {
      // Mostrar modal de confirmación
      showModal('Are you leaving?', () => {
        window.open(ad.clickUrl, '_blank', 'noopener,noreferrer')
      })
    }
  },
})
```

### Error Handling con UI Feedback

```tsx
const [error, setError] = useState<string | null>(null)

const { handleClick, isTracking } = useAdClickHandler({
  ad,
  impressionId,
  onError: (error) => {
    setError(error)
    // Mostrar toast o notificación
    toast.error(`Click tracking failed: ${error}`)
  },
})

return (
  <>
    <button onClick={handleClick} disabled={isTracking}>
      Click Ad
    </button>
    {error && <div className="error">{error}</div>}
  </>
)
```

### Integración con Analytics

```tsx
const { handleClick, isTracking } = useAdClickHandler({
  ad,
  impressionId,
  onClickTracked: (result) => {
    if (result.success) {
      // Google Analytics
      gtag('event', 'ad_click', {
        ad_id: ad.id,
        click_id: result.clickId,
        fraud_score: result.fraudScore,
      })

      // Facebook Pixel
      fbq('track', 'AdClick', {
        content_name: ad.title,
        content_ids: [ad.id],
      })
    }
  },
})
```

## 🔌 API Routes

### POST /api/ads/track/click

Trackea un click en un anuncio.

**Request:**
```typescript
POST /api/ads/track/click
Headers:
  Content-Type: application/json
  X-CSRF-Token: <token>

Body:
{
  advertisementId: string
  impressionId: string
  context: {
    timestamp: number
    userAgent: string
    referrer: string
    screenResolution: string
    timezone: string
    language: string
  }
}
```

**Response Success (200):**
```json
{
  "clickId": "clk-abc123",
  "fraudDetection": {
    "riskScore": 15,
    "flags": []
  }
}
```

**Response Error (403):**
```json
{
  "error": "CSRF validation failed",
  "details": "Missing CSRF token in header"
}
```

**Response Error (400):**
```json
{
  "error": "Missing required fields: advertisementId, impressionId"
}
```

**Response Error (500):**
```json
{
  "error": "Failed to track ad click",
  "message": "Backend error: 502"
}
```

## 🧪 Testing

### Unit Test Example

```typescript
import { renderHook, act } from '@testing-library/react'
import { useAdClickHandler } from '@/components/ads'

describe('useAdClickHandler', () => {
  it('tracks click with CSRF token', async () => {
    const mockAd = {
      id: 'ad-123',
      clickUrl: 'https://example.com',
      // ... otros campos
    }

    const onClickTracked = jest.fn()

    const { result } = renderHook(() =>
      useAdClickHandler({
        ad: mockAd,
        impressionId: 'imp-123',
        onClickTracked,
      })
    )

    await act(async () => {
      await result.current.handleClick()
    })

    expect(onClickTracked).toHaveBeenCalledWith({
      success: true,
      clickId: expect.any(String),
      fraudScore: expect.any(Number),
    })
  })
})
```

### Integration Test Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdClickHandler } from '@/components/ads'

describe('AdClickHandler integration', () => {
  it('tracks click and opens link', async () => {
    const mockAd = { /* ... */ }
    const onClickTracked = jest.fn()

    // Mock window.open
    const mockOpen = jest.fn()
    global.window.open = mockOpen

    render(
      <AdClickHandler
        ad={mockAd}
        impressionId="imp-123"
        onClickTracked={onClickTracked}
      >
        {(handleClick, isTracking) => (
          <button onClick={handleClick} disabled={isTracking}>
            Click Me
          </button>
        )}
      </AdClickHandler>
    )

    const button = screen.getByText('Click Me')
    fireEvent.click(button)

    await waitFor(() => {
      expect(onClickTracked).toHaveBeenCalled()
      expect(mockOpen).toHaveBeenCalledWith(
        mockAd.clickUrl,
        '_blank',
        'noopener,noreferrer'
      )
    })
  })
})
```

## 📊 Monitoring

### Logging

El sistema logea automáticamente:

```typescript
// Click exitoso
console.log('[Ad Click Tracked]', {
  clickId: 'clk-abc123',
  advertisementId: 'ad-123',
  impressionId: 'imp-456',
  fraudScore: 15,
  userIp: '192.168.1.1',
})

// CSRF validation failed
console.warn('[CSRF Validation Failed]', 'Missing CSRF token in header')

// Error general
console.error('[Ad Click Tracking Error]', error)
```

### Métricas Recomendadas

1. **Click-through rate (CTR)**: `clicks / impressions`
2. **Fraud rate**: `clicks with fraudScore > 70 / total clicks`
3. **CSRF failures**: Número de requests bloqueados por CSRF
4. **API errors**: Rate de errores del backend
5. **Average fraud score**: Score promedio de todos los clicks

## 🔧 Configuración

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### CSRF Token Config

```typescript
// lib/csrf.ts
export function useCSRFToken(): string {
  // Token se guarda en cookie con:
  // - Path=/
  // - SameSite=Strict
  // - Secure (en producción)
  // - Max-Age=3600 (1 hora)
}
```

## 🚨 Troubleshooting

### Error: "CSRF validation failed"

**Causa**: Token CSRF no presente o no coincide

**Solución**:
1. Verificar que `useCSRFToken()` se llame en el componente
2. Revisar que la cookie `csrf_token` exista
3. Verificar que el header `X-CSRF-Token` se envíe

### Error: "Cannot track click without impressionId"

**Causa**: No se proporcionó impressionId

**Solución**:
1. Asegurarse de que el ad tenga una impresión registrada primero
2. Pasar el `impressionId` retornado por `trackImpression`

### Error: "Invalid or unsafe ad URL"

**Causa**: URL bloqueada por sanitización XSS

**Solución**:
1. Verificar que la URL use protocolo `http:` o `https:`
2. Revisar que no sea una URL malformada
3. Confirmar que el campo `ad.clickUrl` esté correcto

## 📚 Referencias

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [IAB Viewability Guidelines](https://www.iab.com/guidelines/viewability/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Hooks](https://react.dev/reference/react)

---

**Versión**: 1.0.0  
**Última actualización**: Semana 3 Día 5  
**Autor**: Radio App Team
