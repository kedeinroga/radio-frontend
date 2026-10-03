# Google Consent Mode v2 — pendiente (cumplimiento GDPR para la UE)

## Contexto

Para que Google AdSense pudiera **verificar y aprobar** el sitio, el script de AdSense se cargó de forma **incondicional** en el `<head>` (`apps/next/app/layout.tsx`), reemplazando el antiguo `AdSenseLoader` que solo lo inyectaba tras el consentimiento de cookies.

**Efecto secundario:** ahora el script de AdSense se carga **antes** de que el usuario acepte cookies. Para usuarios del **EEE / Reino Unido**, Google exige desde 2024 **Consent Mode v2** junto con un **CMP (Consent Management Platform) certificado por Google** para poder servir anuncios. Sin esto, los anuncios a usuarios de la UE pueden no servirse (o no cumplir GDPR).

**Esto NO bloquea la aprobación de AdSense**, pero **sí debe implementarse antes de monetizar tráfico de la UE.**

## Estado actual del consentimiento en el repo

- Banner/hook de cookies: `useCookieConsent` → guarda en `localStorage` la clave `rradio_cookie_consent` con la forma `{ advertising: boolean, ... }`.
- El script de AdSense está en `apps/next/app/layout.tsx` (`<head>`, con `nonce` por el `strict-dynamic` de la CSP — ver `apps/next/lib/csp.ts`).
- `apps/next/components/AdSenseLoader.tsx` quedó **sin uso** (se puede borrar o reconvertir en la integración de Consent Mode).

## Qué hay que implementar

### 1. Inicializar Consent Mode en "denied" por defecto (antes del script de AdSense)

En el `<head>` de `app/layout.tsx`, **antes** del `<script>` de `adsbygoogle.js`, añadir el stub de `gtag` con defaults denegados para el EEE. Debe llevar el mismo `nonce`:

```tsx
<script
  nonce={nonce}
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'wait_for_update': 500
      });
    `,
  }}
/>
```

> Opcional: usar `region: ['ES','DE','FR',...]` o aplicar el default global y actualizar según geolocalización. Lo más simple y seguro es default global "denied" y `update` al aceptar.

### 2. Actualizar el consentimiento cuando el usuario acepta/rechaza

En el handler del banner de cookies (donde hoy se escribe `rradio_cookie_consent`), llamar a `gtag('consent','update', ...)`:

```ts
// Al aceptar publicidad
gtag('consent', 'update', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
})

// Al rechazar -> mantener 'denied' (no hace falta llamar, ya es el default)
```

Conviene centralizar esto en `useCookieConsent` para que cada cambio de `advertising` dispare el `update` correspondiente.

### 3. (Obligatorio para EEE) Integrar un CMP certificado por Google

Google exige un **CMP certificado** (lista oficial de Google) para servir anuncios en el EEE, no basta un banner propio. Opciones comunes:
- **Funding Choices / Google's own Privacy & messaging** (gratis, integrado con AdSense — la más directa).
- CMPs de terceros certificados (Cookiebot, Didomi, Osano, etc.).

Funding Choices se activa desde el panel de AdSense (Privacy & messaging → GDPR), genera su propio mensaje y se encarga del Consent Mode. Si se adopta, puede **sustituir** al banner propio actual.

### 4. Consideración de CSP

Todo `<script>` inline nuevo (el stub de `gtag`) **debe** llevar `nonce={nonce}` porque `script-src` usa `'strict-dynamic'` (`apps/next/lib/csp.ts`). Si se añade un CMP de terceros, agregar su dominio a la lista correspondiente en `lib/csp.ts` (sección `adSense`/`analytics`).

## Verificación

1. **Antes de aceptar cookies:** abrir DevTools → la petición a `adsbygoogle.js` debe incluir señales de consentimiento denegado (sin `ad_storage`).
2. **Tras aceptar:** confirmar que se dispara `gtag('consent','update',{ad_storage:'granted',...})`.
3. Usar la extensión **Google Tag Assistant** para ver el estado de Consent Mode (default vs update).
4. En el panel de AdSense → **Privacy & messaging**, verificar que el mensaje GDPR está activo y publicado para el EEE.

## Resumen de prioridad

- ✅ Aprobación de AdSense: **no depende de esto** (el script ya está presente).
- ⚠️ Servir anuncios a tráfico del EEE/UK de forma legal: **sí requiere** Consent Mode v2 + CMP certificado.
- Recomendación: implementar **Funding Choices** desde AdSense (lo más rápido) y conectar el `gtag consent update` al banner existente.
