# Implementación: "Sonando ahora" + preparación AdSense (frontend)

## Contexto

El sitio es rechazado por Google AdSense por *"contenido sin valor / no original"*: listados agregados de radio-browser + texto SEO plantilla en `genre/[tag]` y `country/[countryCode]`. La solución, **sin blog y manteniendo la estética minimalista**, tiene dos frentes:

1. **Now Playing** — mostrar la canción que suena (datos únicos capturados por el backend desde el metadata ICY de los streams; ver `radio-backend/NOW_PLAYING_IMPLEMENTATION.md`), presentada como una lista limpia estilo Last.fm. Convierte las páginas de estación en contenido propio e indexable.
2. **Preparación AdSense** — `noindex` a las páginas plantilla y consolidación de la ruta de estación client-side en la canónica server-rendered.

## Convenciones a respetar
Ruta canónica server-rendered `app/[locale]/radio/[id]` (la client-side `app/[locale]/stations/[id]` está deprecada y sin enlaces). Capa de datos doble: `StationServerRepository` (SSR, vía `backendHttpClient` con `X-Rradio-Secret`) y `StationApiRepository` (cliente, vía rutas proxy `/api/*`). Entidades/interfaces en `packages/app` (`@radio-app/app`). Tailwind dark minimalista (acento ámbar `#F5A30A`, fuente `Space Mono` para metadata). i18n en `i18n/locales/{es,en,fr,de}.json`.

---

## A. Now Playing (display)

### 1. Shared package `packages/app`
- Entidad/DTO `StationTrack` (`artist`, `title`, `rawTitle`, `playedAt`) en `domain/entities/`.
- Extender `IStationRepository` con:
  - `getNowPlaying(stationId: string): Promise<StationTrack | null>`
  - `getRecentTracks(stationId: string, limit: number): Promise<StationTrack[]>`
- Implementar en **ambos** repos:
  - `StationApiRepository` → rutas `/api/stations/[id]/now-playing` y `/recent-tracks`.
  - `StationServerRepository` → `backendHttpClient.get('/stations/${id}/now-playing')` etc., mapeando `snake_case → camelCase` como en `mapToStation`.

### 2. Rutas proxy Next.js (camino cliente)
- `app/api/stations/[id]/now-playing/route.ts`
- `app/api/stations/[id]/recent-tracks/route.ts`

  → usan `backendHttpClient`, con `rateLimit()` y validación de `limit`, siguiendo el patrón de `app/api/stations/*`.

### 3. Componente `components/NowPlaying.tsx`
- Datos iniciales server-rendered (props desde la página) + refresco en cliente con React Query (`refetchInterval` ~25s, **pausado con `document.hidden`**) solo para la línea "sonando ahora". *(Hallazgo #5.)*
- Minimalista: una línea `● {artist} — {title}` (acento ámbar, `Space Mono`) + lista pequeña "Sonó antes" (hora + pista).
- **Estado vacío = no renderizar nada** (evita ruido visual y thin-content visible).

### 4. Integración en `app/[locale]/radio/[id]/page.tsx`
- Fetch server de now-playing + recent en paralelo con la estación (`Promise.all`) vía `StationServerRepository`.
- Renderizar `<NowPlaying .../>` dentro del área de `StationDetails`.
- Añadir JSON-LD `MusicRecording` / `BroadcastEvent` para la pista actual (contenido estructurado único, mejora rich results).

### 5. i18n
- Añadir claves a los 4 JSON: `nowPlaying.live`, `nowPlaying.recentlyPlayed`, `nowPlaying.empty`. `player.nowPlaying` ya existe.

---

## B. Preparación AdSense

### 6. `noindex` a páginas plantilla
- En `generateMetadata` de `app/[locale]/genre/[tag]/page.tsx` y `app/[locale]/country/[countryCode]/page.tsx`: añadir `robots: { index: false, follow: true }` (sigue pasando link-equity). Retira el contenido escalado de la vista de Google.
- Documentar que pueden re-indexarse cuando muestren datos únicos (p.ej. "pistas en tendencia en {género}" derivadas del nuevo historial de tracks).

### 7. Consolidar/deprecar la ruta client-side `stations/[id]`
- Está client-rendered (Googlebot ve un spinner) y **no está enlazada** desde ningún componente/sitemap; la canónica es `radio/[id]`.
- Implementar **redirect 301** `stations/[id] → radio/[id]` en `next.config.js` (`redirects()`) o `middleware.ts`. Elimina el agujero SEO y unifica una sola ruta server-rendered.

---

## Hallazgos por resolver (frontend)
1. **Dos rutas de estación** (`stations/[id]` client vs `radio/[id]` server) — consolidadas vía §7.
2. **`radio/[id]` es `force-dynamic`** — cada rastreo golpea el backend; evaluar `revalidate` (ISR) para TTFB/coste de crawl.
3. **Texto SEO plantilla en genre/country** — riesgo scaled content; mitigado con `noindex` (§6).
4. **`AdSenseLoader`** carga el script solo tras consentimiento (ya correcto); asegurar que no se monte en páginas `noindex`.
5. **Coste del polling live** — intervalo conservador + pausa en pestaña oculta (§3).
6. **Schema de música** — `MusicRecording`/`BroadcastEvent` (incluido en §4).

## Verificación
- `npm run build`, `npm run type-check`, `npm run lint` (turbo).
- Backend + front en local: abrir `/es/radio/<id>`; **view-source** debe mostrar la pista en el HTML (no un spinner).
- Confirmar `<meta name="robots" content="noindex">` en genre/country.
- Confirmar `/es/stations/<id>` → 301 → `/es/radio/<id>`.
- Google Rich Results Test sobre el JSON-LD de la pista.

## Dependencia
Requiere los endpoints del backend (`/stations/:id/now-playing`, `/stations/:id/recent-tracks`) descritos en `radio-backend/NOW_PLAYING_IMPLEMENTATION.md`. El historial se puebla con el job de sondeo; conviene dejarlo correr antes de validar las páginas y re-aplicar a AdSense.
