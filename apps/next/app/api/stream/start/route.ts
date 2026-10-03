import { NextRequest, NextResponse } from 'next/server'
import { registerStationClick } from '@/lib/radioBrowser/client'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/stream/start
 *
 * Sin backend ya no hay sesiones ni proxy de audio: el cliente reproduce la URL directa de
 * la emisora (Station.streamUrl). Este endpoint solo cuenta el "click" en Radio Browser
 * (alimenta su ranking de popularidad) y responde sin `stream_url`, de modo que el cliente
 * conserva la URL directa.
 *
 * Body: { station_id: string, ad_id?: string | null }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const stationId = body?.station_id

    if (typeof stationId !== 'string' || !UUID_REGEX.test(stationId)) {
      return NextResponse.json({ error: 'Invalid station_id.' }, { status: 400 })
    }

    // Best-effort: no bloquea ni rompe la reproducción
    await registerStationClick(stationId)

    return NextResponse.json(
      { stream_url: null, session_id: null, expires_at: null },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
}
