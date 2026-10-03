# Cloudflare + Vercel: Protección de Bots y Scraping

Guía para configurar Cloudflare como proxy frente al proyecto desplegado en Vercel (`rradio.online`).

---

## Paso 1 — Agregar el dominio a Cloudflare

1. Crear cuenta en [cloudflare.com](https://cloudflare.com) si no tienes
2. **"Add a site"** → ingresar `rradio.online`
3. Elegir plan **Free**
4. Cloudflare escaneará los DNS actuales y los importará automáticamente

---

## Paso 2 — Cambiar nameservers en el registrador del dominio

Cloudflare asignará dos nameservers, por ejemplo:
```
aiden.ns.cloudflare.com
priya.ns.cloudflare.com
```

Ir al panel del registrador donde se compró el dominio (GoDaddy, Namecheap, etc.) y reemplazar los nameservers actuales por los de Cloudflare.

> La propagación puede tardar hasta 24 horas.

---

## Paso 3 — Configurar DNS en Cloudflare

Vercel usa registros CNAME. La configuración debe quedar así:

| Type | Name | Content | Proxy status |
|---|---|---|---|
| `CNAME` | `rradio.online` (o `@`) | `cname.vercel-dns.com` | **Proxied** (nube naranja) |
| `CNAME` | `www` | `cname.vercel-dns.com` | **Proxied** (nube naranja) |

> La nube naranja activa el proxy de Cloudflare. Sin esto no hay protección de bots ni WAF.

---

## Paso 4 — SSL: modo "Full" (obligatorio)

**SSL/TLS → Overview** → seleccionar **Full** (NO "Full (strict)").

Vercel gestiona sus propios certificados TLS. Usar "Full (strict)" provoca errores 525/526 porque Cloudflare no puede verificar el certificado de Vercel.

---

## Paso 5 — Desactivar "Always Use HTTPS" en Cloudflare

**SSL/TLS → Edge Certificates** → desactivar **"Always Use HTTPS"**.

Vercel ya realiza esta redirección. Tenerla activa en ambos provoca loops de redirección (ERR_TOO_MANY_REDIRECTS).

---

## Protección de bots

### Bot Fight Mode (gratis)

**Security → Bots → Bot Fight Mode** → activar.

Bloquea automáticamente bots conocidos (scrapers, crawlers maliciosos, herramientas de automatización) usando fingerprinting de Cloudflare. Sin configuración adicional.

### Rate Limiting por ruta (gratis: 10k req/mes incluidas)

**Security → WAF → Rate limiting rules → Create rule**

Ejemplo para proteger la búsqueda de estaciones:

```
Field:     URI Path
Operator:  contains
Value:     /api/stations/search

Threshold: 30 requests / 1 minute / IP
Action:    Block  (o Managed Challenge para mostrar CAPTCHA)
```

Regla adicional recomendada para todo el `/api/`:

```
Field:     URI Path
Operator:  starts with
Value:     /api/

Threshold: 200 requests / 1 minute / IP
Action:    Block
```

### Managed Challenge para tráfico sospechoso (gratis)

**Security → WAF → Custom rules → Create rule**

Usar **"Edit expression"** para escribir directamente:

```
Expression:  (cf.threat_score gt 14)
Action:      Managed Challenge
```

Presenta un JS challenge o CAPTCHA a IPs con threat score alto (escala 0–100, umbral 14 = nivel medio).
Ajustar a `gt 9` para más agresividad o `gt 25` para más permisividad.

> ⚠️ `cf.client.bot_score` requiere el add-on Bot Management (plan de pago). En el plan Free usar `cf.threat_score`.

---

## Ajuste en el código (obligatorio con Cloudflare proxiado)

Cuando Cloudflare actúa como proxy, el IP real del cliente llega en el header `CF-Connecting-IP`, no en `x-forwarded-for`. El rate limiter del proyecto debe actualizarse:

**`apps/next/lib/rateLimit.ts`** — en las dos funciones donde se obtiene el IP:

```ts
const ip = request.headers.get('cf-connecting-ip')
  || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  || request.headers.get('x-real-ip')
  || 'unknown'
```

Sin este cambio, todos los requests aparecen con la IP de Cloudflare en vez del IP real del usuario, haciendo inefectivo el rate limiting a nivel de aplicación.

---

## Configuraciones adicionales recomendadas (todas gratis)

| Configuración | Ruta en Cloudflare | Valor recomendado |
|---|---|---|
| Security Level | Security → Settings | **Medium** o **High** |
| Browser Integrity Check | Security → Settings | **On** |
| Hotlink Protection | Scrape Shield → Hotlink Protection | **On** (protege imágenes) |
| Email Address Obfuscation | Scrape Shield | **On** |
| Rocket Loader | Speed → Optimization | **Off** (puede interferir con Next.js) |
| Auto Minify | Speed → Optimization | **Off** (Next.js ya minifica) |

---

## Nota sobre migración a GCP

El proyecto tiene un plan de migración a Cloud Run + Firebase Hosting (`MIGRATION_VERCEL_TO_GCP.md`). Si se ejecuta esa migración, el único cambio en Cloudflare es actualizar el CNAME:

```
cname.vercel-dns.com  →  <firebase-hosting-url>.web.app
```

Toda la configuración de Bot Fight Mode, WAF y SSL permanece igual.

---

## Verificación

Después de activar el proxy de Cloudflare, verificar que:

- [ ] `curl -I https://rradio.online` incluye el header `cf-ray` en la respuesta
- [ ] El sitio carga correctamente (sin errores SSL ni loops de redirect)
- [ ] **Cloudflare → Security → Events** muestra tráfico siendo analizado
- [ ] Bot Fight Mode aparece como **Enabled** en Security → Bots
- [ ] El rate limiter del proyecto usa `cf-connecting-ip` como primera fuente de IP
