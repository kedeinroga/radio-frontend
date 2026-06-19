import { NextRequest, NextResponse } from 'next/server'

/**
 * assertSameOrigin — defensa en profundidad contra scraping del proxy `/api/*`.
 *
 * Las rutas `/api/stations/*` solo deben servir peticiones hechas por el propio sitio desde
 * el navegador del oyente. Un cliente no-navegador (curl, node, axios) no manda los headers de
 * fetch del navegador, así que lo rechazamos con 403.
 *
 * ⚠️ Es spoofeable (un bot puede falsificar `Sec-Fetch-Site`), por eso es solo una capa extra.
 * La protección real vive en el borde (Cloudflare WAF + Bot Fight Mode). Ver BOT_PROTECTION_PLAN.md.
 *
 * Señal principal: `Sec-Fetch-Site`. Los navegadores modernos lo envían en TODA petición fetch/navegación
 * (incluido GET same-origin, donde `Origin` suele omitirse). Valores esperados de la propia app: `same-origin`.
 * Fallback (navegadores legacy sin Sec-Fetch-*): comparar el host de `Origin`/`Referer` con el host servido.
 *
 * @returns `NextResponse` 403 si se debe bloquear, o `null` si la petición es legítima.
 */
export function assertSameOrigin(request: NextRequest): NextResponse | null {
  const secFetchSite = request.headers.get('sec-fetch-site')

  if (secFetchSite) {
    // Petición desde el propio sitio (o un subdominio) → permitir.
    if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
      return null
    }
    // 'cross-site' o 'none' (navegación directa a la URL del API) → no es nuestra app.
    return forbidden(request, `sec-fetch-site=${secFetchSite}`)
  }

  // Sin Sec-Fetch-Site: casi siempre un cliente no-navegador. Aceptar solo si el host de
  // Origin/Referer coincide con el host servido (cubre navegadores legacy raros).
  const selfHost = request.headers.get('host')
  const sourceHost = hostOf(request.headers.get('origin')) ?? hostOf(request.headers.get('referer'))

  if (selfHost && sourceHost && isAllowedHost(sourceHost, selfHost)) {
    return null
  }

  return forbidden(request, 'missing browser fetch headers')
}

/** Hosts propios permitidos en el fallback (apex, www y dominios del proyecto). */
function isAllowedHost(sourceHost: string, selfHost: string): boolean {
  if (sourceHost === selfHost) return true
  return sourceHost === 'rradio.online' || sourceHost.endsWith('.rradio.online')
}

/** Extrae el host de una URL completa; devuelve null si no es parseable. */
function hostOf(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).host
  } catch {
    return null
  }
}

function forbidden(request: NextRequest, reason: string): NextResponse {
  console.warn(`[assertSameOrigin] blocked ${request.nextUrl.pathname} (${reason})`)
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
