'use client'

import { useEffect, useState } from 'react'
import { useCart, useMode, useShop } from '@/lib/cart'
import { buildOrderMessage, whatsappLink } from '@/lib/whatsapp'
import type { ProductStock } from '@/types/db'

type Props = {
  products: ProductStock[]
  reelSlug?: string
  className?: string
  label?: string
}

export function WhatsAppOrderButton({ products, reelSlug, className, label }: Props) {
  const cart = useCart()
  const [mode] = useMode()
  const [shop] = useShop()
  const [href, setHref] = useState('#')

  useEffect(() => {
    const message = buildOrderMessage({
      cart,
      products,
      isWholesale: mode === 'wholesale',
      reelSlug,
      shopName: shop || undefined,
    })
    setHref(whatsappLink(message))
  }, [cart, mode, shop, products, reelSlug])

  const isEmpty = cart.length === 0

  return (
    <a
      href={isEmpty ? '#' : href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        if (isEmpty) { e.preventDefault(); return }
        // Persist order + fire reel event in parallel; do not block the click.
        fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, mode, shop, reelSlug, channel: reelSlug ? 'reel' : 'whatsapp' }),
        }).catch(() => {})
        if (reelSlug) {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reelSlug, eventType: 'whatsapp_click' }),
          }).catch(() => {})
        }
      }}
      className={
        className ??
        `inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-bold transition ${
          isEmpty ? 'cursor-not-allowed bg-ink-100 text-ink-500' : 'bg-emerald-500 text-white hover:bg-emerald-600'
        }`
      }
    >
      <WhatsAppIcon />
      {label ?? (isEmpty ? 'Cart is empty' : 'Order on WhatsApp')}
    </a>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M20.5 3.5A11 11 0 0 0 3.6 17.7L2 22l4.4-1.6A11 11 0 1 0 20.5 3.5Zm-8.5 18a9.4 9.4 0 0 1-4.8-1.3l-.3-.2-2.6 1 1-2.6-.2-.3a9.5 9.5 0 1 1 6.9 3.4Zm5.4-7c-.3-.2-1.7-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7 0a7.7 7.7 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5s0-.4 0-.6l-.9-2.2c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3 3 0 0 0-1 2.3 5.3 5.3 0 0 0 1.1 2.8c.1.2 1.9 3 4.7 4.2 2.8 1.1 2.8.7 3.3.7s1.7-.7 2-1.3.3-1.2.2-1.3l-.6-.3Z"/>
    </svg>
  )
}
