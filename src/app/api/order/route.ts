import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CartLine } from '@/types/db'

// Public order endpoint. RLS on `orders` and `order_items` permits anon INSERT
// (`with check (true)`), so we use the anon key here instead of the service-role
// key — that key isn't available to the storefront project anyway.
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

type Body = {
  cart: CartLine[]
  mode: 'retail' | 'wholesale'
  shop?: string
  reelSlug?: string
  channel: 'web' | 'whatsapp' | 'reel'
  customerName?: string
  whatsappPhone?: string
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null
  if (!body || !Array.isArray(body.cart) || body.cart.length === 0) {
    return NextResponse.json({ error: 'empty cart' }, { status: 400 })
  }

  const sb = publicClient()

  // Look up live prices server-side — never trust client totals
  const ids = body.cart.map((l) => l.product_id)
  const { data: products, error: prodErr } = await sb
    .from('products')
    .select('id, retail_price_mur, wholesale_price_mur')
    .in('id', ids)
  if (prodErr || !products) {
    console.error('[order] product lookup failed', prodErr)
    return NextResponse.json({ error: prodErr?.message ?? 'products lookup failed' }, { status: 500 })
  }

  const isWholesale = body.mode === 'wholesale'
  const items = body.cart.map((line) => {
    const p = products.find((x) => x.id === line.product_id)
    if (!p) return null
    const unit = isWholesale && p.wholesale_price_mur != null
      ? Number(p.wholesale_price_mur)
      : Number(p.retail_price_mur)
    return { product_id: line.product_id, qty: line.qty, unit_price_mur: unit }
  }).filter(Boolean) as Array<{ product_id: string; qty: number; unit_price_mur: number }>

  const subtotal = items.reduce((s, i) => s + i.unit_price_mur * i.qty, 0)

  let reelId: string | null = null
  if (body.reelSlug) {
    const { data: r } = await sb.from('reels').select('id').eq('slug', body.reelSlug).maybeSingle()
    reelId = r?.id ?? null
  }

  const { data: order, error: orderErr } = await sb
    .from('orders')
    .insert({
      channel: body.channel,
      reel_id: reelId,
      is_wholesale: isWholesale,
      subtotal_mur: subtotal,
      whatsapp_phone: body.whatsappPhone ?? null,
      customer_name: body.customerName ?? null,
      notes: body.shop ? `Shop: ${body.shop}` : null,
    })
    .select('id, order_number')
    .single()

  if (orderErr || !order) {
    console.error('[order] order insert failed', orderErr)
    return NextResponse.json({ error: orderErr?.message ?? 'order insert failed' }, { status: 500 })
  }

  const { error: itemsErr } = await sb.from('order_items').insert(items.map((i) => ({ ...i, order_id: order.id })))
  if (itemsErr) console.error('[order] order_items insert failed', itemsErr)

  if (reelId) {
    await sb.from('reel_events').insert({
      reel_id: reelId,
      event_type: 'order',
      session_id: req.headers.get('x-session-id'),
    })
  }

  return NextResponse.json({ ok: true, orderId: order.id, orderNumber: order.order_number })
}
