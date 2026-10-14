import { headers } from 'next/headers'

const ADSENSE_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID

/**
 * Script de Google AdSense (Auto ads). Solo lo renderizan las páginas con contenido editorial
 * propio (home, blog, hubs, /radio-online): AdSense no permite anuncios en pantallas sin
 * contenido del editor (fichas de emisora, búsqueda, favoritos, errores).
 *
 * La verificación del sitio no depende de esto: el layout raíz publica la meta
 * google-adsense-account en todas las páginas. El consentimiento (EEE/Reino Unido/Suiza) lo
 * gestiona el mensaje de Privacidad y mensajes de Google, que carga este mismo script.
 *
 * React 19 sube el <script async> al <head> y lo deduplica entre páginas.
 */
export async function AdSenseScript() {
  if (!ADSENSE_ID) return null
  // Nonce requerido: la CSP usa 'strict-dynamic'
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
      nonce={nonce}
    />
  )
}
