# Subscription Components

Componentes UI para el sistema de suscripciones premium con integración de Stripe.

## Componentes Disponibles

### 1. PricingCard

Tarjeta de precios para mostrar planes de suscripción.

```tsx
import { PricingCard } from '@/components/subscription'
import { DEFAULT_PLANS } from '@radio-app/app'

function PricingPage() {
  const handleSubscribe = async (planId: string, interval: 'month' | 'year') => {
    // Lógica de suscripción
  }

  return (
    <PricingCard
      plan={DEFAULT_PLANS[1]} // Premium Monthly
      isPopular={true}
      currentPlanId="free" // Plan actual del usuario
      onSubscribe={handleSubscribe}
    />
  )
}
```

**Props:**
- `plan`: Plan a mostrar (SubscriptionPlan)
- `isPopular`: Si es el plan destacado (opcional)
- `currentPlanId`: ID del plan actual del usuario (opcional)
- `onSubscribe`: Callback al suscribirse `(planId, interval) => void`
- `className`: Clases CSS adicionales (opcional)

**Características:**
- Toggle mensual/anual con cálculo de ahorro
- Lista de 9 features con checkmarks
- Badge de "Most Popular"
- Estado deshabilitado para plan actual
- Estado de carga durante suscripción

---

### 2. SubscriptionStatus

Dashboard para gestionar la suscripción activa.

```tsx
import { SubscriptionStatus } from '@/components/subscription'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

function AccountPage() {
  const { subscription, plan } = usePremiumStatus()

  const handleCancel = async () => {
    // Lógica de cancelación
  }

  return (
    <SubscriptionStatus
      subscription={subscription}
      plan={plan}
      onCancel={handleCancel}
      onResume={handleResume}
      onManageBilling={handleManageBilling}
    />
  )
}
```

**Props:**
- `subscription`: Suscripción actual (Subscription)
- `plan`: Plan de la suscripción (SubscriptionPlan | undefined)
- `onCancel`: Callback para cancelar
- `onResume`: Callback para reanudar
- `onManageBilling`: Callback para gestionar facturación
- `className`: Clases CSS adicionales (opcional)

**Características:**
- Badges de estado (8 estados diferentes)
- Muestra precio, intervalo de facturación, próxima fecha
- Días restantes en el período
- Aviso de cancelación
- Indicador de período de prueba
- Botones de acción (Cancelar, Reanudar, Gestionar)

---

### 3. PremiumBadge

Badges visuales para indicar estado premium.

```tsx
import { PremiumBadge, PremiumCrownBadge, PremiumIndicator } from '@/components/subscription'

// Badge con estrella (amarillo)
<PremiumBadge size="md" showText={true} />

// Badge con corona (púrpura-rosa)
<PremiumCrownBadge size="lg" showText={true} />

// Indicador simple (sin fondo)
<PremiumIndicator size="sm" showText={false} />
```

**Props:**
- `size`: Tamaño del badge ('sm' | 'md' | 'lg')
- `showText`: Mostrar texto "Premium" (opcional, default: true)
- `className`: Clases CSS adicionales (opcional)

**Variantes:**
- `PremiumBadge`: Badge con estrella y gradiente amarillo
- `PremiumCrownBadge`: Badge con corona y gradiente púrpura-rosa
- `PremiumIndicator`: Indicador simple con estrella sin fondo

---

### 4. AdContainerWithPremium

Wrapper inteligente que oculta anuncios para usuarios premium.

```tsx
import { AdContainerWithPremium } from '@/components/subscription'

// Drop-in replacement para AdContainer
<AdContainerWithPremium
  placement="home_banner"
  format="banner"
/>

// Si el usuario es premium, no se muestra nada
// Si el usuario es free, se muestra AdContainer normal
```

**Props:**
- Todas las props de `AdContainer`
- Se pasan automáticamente al componente interno

**Comportamiento:**
- Usa el hook `useIsPremium` internamente
- Retorna `null` si el usuario es premium
- Retorna `<AdContainer {...props} />` si el usuario es free
- Reemplazo directo en cualquier lugar que uses `AdContainer`

---

## Hooks

### usePremiumStatus

Hook completo para obtener el estado de suscripción.

```tsx
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

function Component() {
  const {
    isPremium,
    isLoading,
    subscription,
    plan,
    isActive,
    daysRemaining,
    error,
    refresh
  } = usePremiumStatus()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage />

  return (
    <div>
      {isPremium ? (
        <PremiumContent />
      ) : (
        <FreeContent />
      )}
    </div>
  )
}
```

**Retorna:**
- `isPremium`: ¿Es usuario premium? (boolean)
- `isLoading`: ¿Cargando estado? (boolean)
- `subscription`: Suscripción actual (Subscription | null)
- `plan`: Plan de la suscripción (SubscriptionPlan | undefined)
- `isActive`: ¿Suscripción activa? (boolean)
- `daysRemaining`: Días restantes en el período (number | null)
- `error`: Error si lo hay (string | null)
- `refresh`: Función para refrescar estado (() => void)

**Características:**
- Cachea el resultado para evitar llamadas repetidas
- Maneja 401 como usuario free (no autenticado)
- Fallback a free user en caso de error

---

### useIsPremium

Hook simplificado que solo retorna boolean.

```tsx
import { useIsPremium } from '@/hooks/usePremiumStatus'

function Component() {
  const isPremium = useIsPremium()

  return isPremium ? <PremiumFeature /> : <UpgradePrompt />
}
```

**Retorna:**
- `boolean`: true si es premium, false si es free

---

## Páginas de Ejemplo

### PricingPageExample

Página completa de precios con FAQ y trust indicators.

```tsx
// app/pricing/page.tsx
export { default } from '@/components/subscription/PricingPageExample'
```

**Incluye:**
- Grid de 3 planes de precios
- FAQ section
- Trust indicators (secure payments, no hidden fees, 24/7 support)
- Loading overlay durante redirección a Stripe

---

### SubscriptionManagementExample

Dashboard de gestión de suscripción.

```tsx
// app/account/subscription/page.tsx
export { default } from '@/components/subscription/SubscriptionManagementExample'
```

**Incluye:**
- SubscriptionStatus card
- Premium Benefits grid
- Help section
- Manejo de cancelación/reanudación
- Redirección a Stripe Customer Portal

---

## Integración con Sistema de Anuncios

### Reemplazar AdContainer

```tsx
// ANTES
import { AdContainer } from '@/components/ads'

<AdContainer placement="home_banner" format="banner" />

// DESPUÉS
import { AdContainerWithPremium } from '@/components/subscription'

<AdContainerWithPremium placement="home_banner" format="banner" />
```

### Ocultar Anuncios Manualmente

```tsx
import { useIsPremium } from '@/hooks/usePremiumStatus'

function RadioPlayer() {
  const isPremium = useIsPremium()

  return (
    <div>
      <AudioPlayer />
      
      {!isPremium && (
        <AudioAdPlayer placement="pre_roll" />
      )}
    </div>
  )
}
```

---

## Flujo Completo de Suscripción

### 1. Usuario ve planes

```tsx
<PricingPageExample />
```

### 2. Usuario selecciona plan

```tsx
const handleSubscribe = async (planId: string, interval: 'month' | 'year') => {
  const response = await fetch('/api/subscription/checkout', {
    method: 'POST',
    body: JSON.stringify({ planId, billingInterval: interval })
  })
  
  const { checkoutUrl } = await response.json()
  window.location.href = checkoutUrl // Redirige a Stripe
}
```

### 3. Usuario completa pago en Stripe

Stripe redirecciona de vuelta a `success_url` o `cancel_url`.

### 4. Webhook actualiza la base de datos

El webhook de Stripe actualiza el estado de la suscripción en el backend.

### 5. Usuario ve contenido premium

```tsx
const isPremium = useIsPremium()

// Los anuncios se ocultan automáticamente
<AdContainerWithPremium placement="home_banner" format="banner" />
```

### 6. Usuario gestiona suscripción

```tsx
<SubscriptionManagementExample />
```

---

## Estilos

Todos los componentes usan Tailwind CSS y están diseñados para ser responsivos.

### Colores del Sistema

- **Premium Badge**: Gradiente amarillo (`from-yellow-100 to-orange-100`)
- **Premium Crown**: Gradiente púrpura-rosa (`from-purple-100 to-pink-100`)
- **Plan Popular**: Gradiente azul (`from-blue-50 to-indigo-50`)
- **Status Active**: Verde (`bg-green-100 text-green-800`)
- **Status Trial**: Púrpura (`bg-purple-100 text-purple-800`)
- **Status Canceled**: Rojo (`bg-red-100 text-red-800`)

### Personalización

Todos los componentes aceptan `className` para personalizar estilos:

```tsx
<PricingCard
  plan={plan}
  className="shadow-xl hover:scale-105 transition-transform"
/>
```

---

## Testing

### Test de Hooks

```tsx
import { renderHook } from '@testing-library/react'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

test('returns premium status', async () => {
  const { result } = renderHook(() => usePremiumStatus())
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
  
  expect(result.current.isPremium).toBe(true)
})
```

### Test de Componentes

```tsx
import { render, screen } from '@testing-library/react'
import { PricingCard } from '@/components/subscription'

test('displays plan features', () => {
  render(<PricingCard plan={mockPlan} />)
  
  expect(screen.getByText('Premium')).toBeInTheDocument()
  expect(screen.getByText('$9.99/month')).toBeInTheDocument()
})
```

---

## Troubleshooting

### El hook usePremiumStatus siempre retorna free

**Causas posibles:**
1. Usuario no autenticado (401)
2. Backend API no responde
3. Token expirado

**Solución:**
- Verificar que el usuario esté autenticado
- Verificar que el endpoint `/api/subscription/status` funcione
- Revisar headers de autenticación

### Los anuncios aún se muestran para usuarios premium

**Causas posibles:**
1. Usando `AdContainer` en lugar de `AdContainerWithPremium`
2. Cache del hook no actualizado

**Solución:**
- Reemplazar `AdContainer` con `AdContainerWithPremium`
- Llamar a `refresh()` del hook después de suscribirse

### Stripe webhook no actualiza el estado

**Causas posibles:**
1. Signature verification falla
2. Endpoint no accesible públicamente
3. Webhook no configurado en Stripe

**Solución:**
- Verificar `STRIPE_WEBHOOK_SECRET` en `.env`
- Usar ngrok o similar para testing local
- Configurar webhook en Stripe Dashboard

---

## Próximos Pasos

- [ ] Implementar Stripe Customer Portal
- [ ] Agregar notificaciones de trial ending
- [ ] Agregar emails de bienvenida
- [ ] Implementar analytics de conversión
- [ ] Agregar pruebas A/B de precios
