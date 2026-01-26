import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rradio - Radio Online Gratis',
    short_name: 'Rradio',
    description: 'Escucha miles de estaciones de radio en vivo de todo el mundo. Música, noticias y entretenimiento gratis.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e293b',
    theme_color: '#2563EB',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    categories: ['entertainment', 'music'],
    lang: 'es',
    dir: 'ltr',
    scope: '/',
    id: 'online.rradio.app'
  }
}
