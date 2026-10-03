# Plan anti-scraping — Backend y Front (gratis, sin Redis)

> Estado a 2026-06-19. Objetivo: frenar un scraper de Node alojado en AWS (IPs rotativas
> `3.80.207.178`, `44.220.84.97`, user-agent `node`) que cosecha `/stations/*`, `now-playing` y
> `recent-tracks`. Todo con capas gratuitas y **sin Redis**.

---

## Resumen ejecutivo

| # | Acción | Dónde | Estado |
|---|--------|-------|--------|
| 1 | Activar shared secret `API_SECRET_KEY` | GCP / Secret Manager | ✅ Hecho y verificado |
| 2 | Fix bug del search cache (`SQLSTATE 22P02`) | `radio-backend` (código) | ⬜ Pendiente |
| 3A | **Proteger el proxy del front en Cloudflare** | Dashboard Cloudflare | ⬜ Pendiente (este doc) |
| 3B | Validar `Origin`/`Sec-Fetch-Site` en rutas Next | `radio-front` (código) | ⬜ Pendiente |

El **item 1** cierra el acceso **directo** al backend (`api.rradio.online` y la URL `*.run.app` ya devuelven
`401` sin el header `X-Rradio-Secret`). Pero **no** cierra el scraping vía el front: las rutas `/api/stations/*`
de Next son públicas (las usa el navegador) y el servidor de Vercel les adjunta el secret y reenvía al backend.
Comprobado en vivo, sin secret ni navegador, `GET www.rradio.online/api/stations/popular` y
`.../api/stations/{id}/now-playing` devuelven **200 con datos reales**. Ese es el frente que cierra el **item 3**.

**Dato que habilita la solución:** `www.rradio.online` ya está detrás de Cloudflare (`server: cloudflare`,
`cf-ray`, `cf-cache-status: DYNAMIC`). En el edge del front, Cloudflare ve la **IP real** del cliente
(oyentes = residencial, bot = AWS), por lo que **bloquear rangos de datacenter aquí es seguro** — lo contrario
al backend, donde el propio front sale desde IPs de AWS (Vercel) y bloquear AWS rompería el sitio.

---

## Item 3A — Cloudflare paso a paso (lo más importante)

> Plan **Free** de Cloudflare. Dominio: `rradio.online`. Todo se hace en el dashboard, sin tocar código.
> Pre-requisito ya cumplido: el dominio está proxied (nube naranja) según `CLOUDFLARE_SETUP.md`.

### Paso 0 — Entrar al dominio correcto
1. Login en https://dash.cloudflare.com
2. Click en el sitio **`rradio.online`**.
3. Verificar arriba a la derecha que el plan es **Free** (suficiente para todo lo de abajo).

---

### Paso 1 — Bot Fight Mode (1 click, base de todo)
Desafía automáticamente clientes que parecen bots (sin navegador real).

1. Menú lateral: **Security → Bots**.
2. Activar el toggle **"Bot Fight Mode"** → **On**.
3. Guardar (se aplica solo).

> Nota: en plan Free es "Bot Fight Mode" (no el "Super Bot Fight Mode" de planes pagos). Es suficiente para
> frenar scrapers genéricos como uno de Node sobre AWS.

---

### Paso 2 — WAF: bloquear ASNs de datacenter solo en `/api/*`
El núcleo de la defensa. Los oyentes reales nunca llegan desde AWS/GCP/Azure; los scrapers, casi siempre sí.

1. Menú lateral: **Security → WAF → Custom rules**.
2. Click **"Create rule"**.
3. **Rule name:** `Block datacenter ASNs on API`
4. Click en **"Edit expression"** (modo texto) y pegar:
   ```
   (starts_with(http.request.uri.path, "/api/")) and (ip.geoip.asnum in {16509 14618 396982 8075 14061 16276 24940})
   ```
   ASNs incluidos (ningún oyente real debería estar aquí):
   | ASN | Proveedor |
   |-----|-----------|
   | 16509, 14618 | Amazon AWS |
   | 396982 | Google Cloud |
   | 8075 | Microsoft Azure |
   | 14061 | DigitalOcean |
   | 16276 | OVH |
   | 24940 | Hetzner |
5. **Choose action:**
   - Recomendado para empezar conservador: **Managed Challenge** (no bloquea del todo; si fuera un humano raro detrás de VPN, puede pasar el reto).
   - Si quieres mano dura (el bot es claramente automatizado): **Block**.
6. **Place at:** dejar el orden por defecto (primero).
7. Click **"Deploy"**.

> Por qué `/api/*` y no todo el sitio: limita el bloqueo a los endpoints de datos. Las páginas HTML/SSR no se ven
> afectadas. Si más adelante quieres, puedes extenderlo, pero `/api/*` es donde está el scraping.

---

### Paso 3 — Rate Limiting sobre `/api/*` (Free incluye 1 regla)
Atrapa abuso desde IPs que NO sean de datacenter (residenciales/móviles que el paso 2 no cubre).

1. Menú lateral: **Security → WAF → Rate limiting rules**.
2. Click **"Create rule"**.
3. **Rule name:** `API rate limit`
4. **If incoming requests match** → "Edit expression":
   ```
   starts_with(http.request.uri.path, "/api/")
   ```
5. **Rate:**
   - **Requests:** `60`
   - **Period:** `1 minute`
   - **Counting characteristics / "with the same":** `IP` (cliente)
6. **Then take action:**
   - **Action:** `Block` (o `Managed Challenge` si prefieres ser amable con humanos rápidos).
   - **Duration / mitigation timeout:** `1 minute`.
7. Click **"Deploy"**.

> Ajusta el `60/min` a tu tráfico real: un oyente normal hace pocas requests/min (el polling de now-playing es
> cada minutos). 60/min deja margen de sobra para un humano y corta a un scraper agresivo.

---

### Paso 4 — Cache de borde para `now-playing` / `popular` (clave para el costo)
Hoy `cf-cache-status: DYNAMIC` → Cloudflare NO cachea (Vercel responde `no-store`). Forzar cache en el edge hace
que, aunque te scrapeen, las respuestas salgan de Cloudflare y **no toquen Vercel ni Cloud Run**.

1. Menú lateral: **Caching → Cache Rules**.
2. Click **"Create rule"**.
3. **Rule name:** `Cache station API (short TTL)`
4. **When incoming requests match** → "Edit expression":
   ```
   (http.request.method eq "GET") and (
     http.request.uri.path eq "/api/stations/popular" or
     ends_with(http.request.uri.path, "/now-playing") or
     ends_with(http.request.uri.path, "/recent-tracks")
   )
   ```
5. **Then (settings):**
   - **Cache eligibility:** `Eligible for cache`.
   - **Edge TTL:** `Override origin` → `60 seconds` (puedes usar 30s para now-playing si quieres más frescura).
   - **Browser TTL:** `Respect origin` (o `30 seconds`).
   - (Opcional) **Cache key:** incluir query string para que `?limit=` distinga variantes.
6. Click **"Deploy"**.

> Seguro porque estos endpoints son **públicos y no personalizados** (datos de estaciones). No cachear nada que
> lleve `Authorization` ni cookies de sesión — estas rutas no las usan.

---

### Paso 5 — Verificar que NO rompiste a los usuarios reales
1. Abrir https://www.rradio.online en un navegador normal → debe cargar estaciones y el now-playing igual que antes.
2. Reproducir una estación y dejar correr el now-playing un par de minutos → debe seguir actualizando.
3. (Opcional) Desde una terminal, simular al bot (request "pelada", sin navegador):
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" "https://www.rradio.online/api/stations/popular?limit=3"
   ```
   Tras el paso 2/3, esto debería devolver **403 / 429** o un reto, ya no `200`.
4. Revisar **Security → Events** en Cloudflare: deberías ver las requests del bot (ASN de AWS) bloqueadas/retadas.

---

### ¿El bot ya está usando el front? Cómo detectarlo
El backend ya **no** distingue bot-vía-front de tráfico legítimo (ambos llegan como IP de Vercel + secret + 200).
Para verlo:
- **Cloudflare → Analytics → Security / Events**, filtrar por `Path contains /api/stations` y mirar ASN/IP.
- **Vercel → Logs** del proyecto, filtrar rutas `/api/stations/*` por IP de AWS (`3.80.x`, `44.220.x`) o
  user-agent `node`.

---

## Item 3B — Validar `Origin` en las rutas proxy de Next (defensa en profundidad, código)

Complementa a Cloudflare. Las rutas `/api/stations/*` solo deberían servir peticiones del propio sitio. Un bot
simple no manda los headers de navegador (`Origin`, `Sec-Fetch-Site`). Es spoofeable, pero sube la barrera y es
barato.

**Archivos:**
- Nuevo helper: `apps/next/lib/api/assertSameOrigin.ts`
- Integrar en: `apps/next/app/api/stations/popular/route.ts`, `.../search/route.ts`,
  `.../[id]/now-playing/route.ts`, `.../[id]/recent-tracks/route.ts`

**Lógica del helper:**
- Hosts permitidos: `rradio.online`, `www.rradio.online`, y `localhost`/`127.0.0.1` en dev.
- Rechazar con `403` si:
  - hay `Origin`/`Referer` y su host **no** está en la lista permitida, **o**
  - `Sec-Fetch-Site` existe y **no** es `same-origin` ni `same-site`.
- Si no hay ninguno de esos headers (cliente no-navegador), también rechazar (un navegador real siempre manda
  `Sec-Fetch-Site` en same-origin fetch).
- Integrarlo al inicio de cada handler, junto al `rateLimit(request, RATE_LIMITS.API)` que ya existe en
  `apps/next/lib/rateLimit.ts`.

> El `rateLimit` actual de Next es in-memory y poco fiable en serverless (cada instancia tiene su contador).
> Por eso la capa real es **3A (Cloudflare)**; 3B es complemento.

---

## Item 1 — Shared secret (✅ hecho, referencia)

`API_SECRET_KEY` vive en el bundle JSON único `app-secrets` de Secret Manager (inyectado como `APP_SECRETS_JSON`,
expandido por `expandSecretsBundle()` en `internal/config/config.go`). Verificado en vivo: el backend devuelve
`401` sin el header, el front sigue a `200`. **El valor del bundle debe ser idéntico al `API_SECRET_KEY` de
Vercel.** Si alguna vez hay que actualizarlo:
```bash
PROJ=radio-485022; REG=us-central1
# Editar secrtes.json (NO se commitea) con API_SECRET_KEY == valor de Vercel, luego:
gcloud secrets versions add app-secrets --data-file=secrtes.json --project=$PROJ
# Forzar revisión nueva para que las instancias recarguen el secret:
gcloud run services update radio-backend --region=$REG --project=$PROJ --update-labels=secret-rotated=$(date +%s)
```

---

## Item 2 — Fix bug del search cache (código backend)

`radio-backend/internal/repositories/postgres/search_cache_repository.go`, método `Save()`: pasa
`queryParamsJSON` como `[]byte` a una columna `query_params JSONB NOT NULL`. `lib/pq` envía `[]byte` como `bytea`
y Postgres no lo parsea como JSON → `invalid input syntax for type json (SQLSTATE 22P02)` en **cada** búsqueda.

**Fix:** pasar `string(queryParamsJSON)` en los args del `ExecContext` (≈ línea 85).

**Verificación:** ejecutar una búsqueda y confirmar en logs `saved search cache` en vez del error;
`go build ./...`, `go vet ./...`, tests del repo.

---

## Orden sugerido
1. **3A (Cloudflare)** — mayor impacto, sin deploy de código. Hacerlo ya.
2. **2 (cache)** y **3B (Origin)** — van en el siguiente build/deploy del repo.

## Notas / deuda anotada
- `radio-backend/cloudrun.yaml` está obsoleto (usa secretos individuales sin `API_SECRET_KEY`); el deploy real usa
  el bundle `APP_SECRETS_JSON`. Conviene alinearlo o borrarlo para evitar confusión.
- En el backend (`api.rradio.online`, hoy directo a Cloud Run sin Cloudflare) **no** se debe bloquear AWS: rompería
  el SSR de Vercel. El secret ya frena el acceso directo y la capa Free de Cloud Run (2M req/mes) absorbe el resto.
- No usar Redis: el `GuestIPRateLimiter`/fraud-detector del backend están atados a Redis (Upstash) y por eso están
  desactivados. Con secret + Cloudflare no se necesitan.
