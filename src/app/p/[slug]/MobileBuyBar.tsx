'use client'

import { useEffect, useState } from 'react'
import { mur } from '@/lib/format'
import { addToCart, useMode } from '@/lib/cart'
import type { ProductStock } from '@/types/db'

// Sticky bottom bar visible only on mobile. Slides in once the user scrolls
// past the in-page buy box so it doesn't double up.
export function MobileBuyBar({ product }: { product: ProductStock }) {
  const [mode] = useMode()
  const [visible, setVisible] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isWholesale = mode === 'wholesale' && product.wholesale_price_mur != null
  const unit = isWholesale && product.wholesale_price_mur != null
    ? product.wholesale_price_mur
    : product.retail_price_mur
  const minQty = isWholesale ? product.wholesale_min_qty : 1
  const isOut = product.available === 0

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-300/80 bg-paper/95 backdrop-blur-xl transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-ink-500">{product.name}</div>
          <div className="font-display text-lg font-black leading-none text-prime-700">{mur(unit)}</div>
        </div>
        <button
          onClick={() => {
            if (isOut) return
            addToCart(product.id, minQty)
            setAdded(true)
            setTimeout(() => setAdded(false), 1500)
          }}
          disabled={isOut}
          className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-bold transition ${
            isOut
              ? 'bg-ink-100 text-ink-500'
              : added
                ? 'bg-mint-500 text-white'
                : 'bg-ink-900 text-paper hover:bg-prime-700'
          }`}
        >
          {isOut ? 'Sold out' : added ? '✓ Ajouté' : `Ajouter ${minQty}×`}
        </button>
      </div>
    </div>
  )
}
