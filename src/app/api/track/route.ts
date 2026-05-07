import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Logs reel funnel events: view / add_to_cart / whatsapp_click / order
export async function POST(req: Request) {
  const { reelSlug, productId, eventType } = await req.json().catch(() => ({}))
  if (!reelSlug || !eventType) return NextResponse.json({ error: 'reelSlug and eventType required' }, { status: 400 })

  const sb = adminClient()
  const { data: reel } = await sb.from('reels').select('id').eq('slug', reelSlug).maybeSingle()
  if (!reel) return NextResponse.json({ error: 'reel not found' }, { status: 404 })

  await sb.from('reel_events').insert({
    reel_id: reel.id,
    product_id: productId ?? null,
    event_type: eventType,
    session_id: req.headers.get('x-session-id'),
  })

  return NextResponse.json({ ok: true })
}
