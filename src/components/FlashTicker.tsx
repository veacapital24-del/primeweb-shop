'use client'

import { useEffect, useState } from 'react'
import { browserClient } from '@/lib/supabase/client'
import type { ProductStock } from '@/types/db'

type Props = { initial: ProductStock[] }

// Marquee strip of low-stock items, refreshed in realtime.
// Drives Mauritian shoppers to act fast — "if I don't go now, it's gone".
export function FlashTicker({ initial }: Props) {
  const [items, setItems] = useState<ProductStock[]>(initial)

  useEffect(() => {
    const sb = browserClient()
    const channel = sb
      .channel(`flash-ticker-${Math.random().toString(36).slice(2, 9)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        async () => {
          const { data } = await sb
            .from('product_stock')
            .select('id, sku, slug, name, image_url, retail_price_mur, wholesale_price_mur, wholesale_min_qty, is_hard_discount, available, low_stock_threshold')
            .lte('available', 10)
            .gt('available', 0)
            .order('available', { ascending: true })
            .limit(20)
          if (data) setItems(data as ProductStock[])
        },
      )
      .subscribe()
    return () => { sb.removeChannel(channel) }
  }, [])

  if (items.length === 0) return null

  const loop = [...items, ...items]

  return (
    <div className="relative overflow-hidden border-y border-ink-900/10 bg-ink-900 text-paper">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-900 to-transparent" />

      <div className="relative flex items-center gap-6 py-3">
        <div className="absolute left-4 z-20 flex shrink-0 items-center gap-2 rounded-full bg-flash-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          Live
        </div>

        <div className="flex shrink-0 gap-8 pl-32 will-change-transform animate-ticker">
          {loop.map((item, i) => (
            <a
              key={`${item.id}-${i}`}
              href={`/p/${item.slug}`}
              className="inline-flex shrink-0 items-center gap-3 text-sm"
            >
              {item.image_url && (
                <img src={item.image_url} alt="" className="h-8 w-8 rounded-md object-cover ring-1 ring-paper/20" />
              )}
              <span className="whitespace-nowrap font-semibold">{item.name}</span>
              <span className="rounded-full bg-flash-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                {item.available} left
              </span>
              <span className="text-paper/40">·</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
