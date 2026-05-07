'use client'

import { useEffect, useState } from 'react'
import { browserClient } from '@/lib/supabase/client'

type Props = {
  productId: string
  initial: number
  threshold?: number
}

// Subscribes to inventory row changes for this product and renders a live count.
// Driven by `alter publication supabase_realtime add table inventory;` in the migration.
export function FlashStockBadge({ productId, initial, threshold = 5 }: Props) {
  const [available, setAvailable] = useState(initial)
  const [recentlyUpdated, setRecentlyUpdated] = useState(false)

  useEffect(() => {
    const sb = browserClient()
    // Unique suffix per mount so React Strict Mode's double-mount in dev
    // doesn't try to add listeners to an already-subscribed channel.
    const channel = sb
      .channel(`inv-${productId}-${Math.random().toString(36).slice(2, 9)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory', filter: `product_id=eq.${productId}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as { on_hand: number; reserved: number } | null
          if (!row) return
          const next = Math.max(0, (row.on_hand ?? 0) - (row.reserved ?? 0))
          setAvailable(next)
          setRecentlyUpdated(true)
          setTimeout(() => setRecentlyUpdated(false), 1500)
        },
      )
      .subscribe()

    return () => { sb.removeChannel(channel) }
  }, [productId])

  if (available === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-paper backdrop-blur">
        Sold out
      </span>
    )
  }

  if (available <= threshold) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md ${
          recentlyUpdated ? 'animate-pulse-flash' : 'bg-flash-500 shadow-flash-700/30'
        }`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"></span>
        </span>
        Plus que {available}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-paper/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-700 backdrop-blur ring-1 ring-ink-300/60">
      <span className="h-1 w-1 rounded-full bg-mint-500"></span>
      En stock
    </span>
  )
}
