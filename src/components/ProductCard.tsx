'use client'

import Link from 'next/link'
import { useState } from 'react'
import { mur } from '@/lib/format'
import { addToCart, useMode } from '@/lib/cart'
import { FlashStockBadge } from './FlashStockBadge'
import type { ProductStock } from '@/types/db'

type Props = {
  product: ProductStock
  reelSlug?: string
}

export function ProductCard({ product, reelSlug }: Props) {
  const [mode] = useMode()
  const [added, setAdded] = useState(false)

  const isWholesale = mode === 'wholesale' && product.wholesale_price_mur != null
  const unit = isWholesale && product.wholesale_price_mur != null
    ? product.wholesale_price_mur
    : product.retail_price_mur
  const discount = isWholesale && product.wholesale_price_mur != null
    ? Math.round(((product.retail_price_mur - product.wholesale_price_mur) / product.retail_price_mur) * 100)
    : 0
  const minQty = isWholesale ? product.wholesale_min_qty : 1
  const isOut = product.available === 0

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-ink-300/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink-900/8 hover:ring-ink-300">
      {/* Stretched link — covers the whole card so any tap (image, title, sku,
          price, white space) navigates to the product detail page. The
          Add-to-cart button sits at z-20 to stay above it. */}
      <Link
        href={`/p/${product.slug}`}
        aria-label={product.name}
        className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-prime-500 focus-visible:ring-offset-2"
      />

      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-ink-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : null}

        {/* gradient wash on hover (non-interactive) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_hard_discount && (
            <span className="inline-flex items-center gap-1 rounded-full bg-prime-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md shadow-prime-900/20">
              <span className="h-1 w-1 rounded-full bg-white"></span>
              Hard discount
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-flash-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md shadow-flash-700/30">
              −{discount}% gros
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute right-3 top-3">
          <FlashStockBadge
            productId={product.id}
            initial={product.available}
            threshold={product.low_stock_threshold}
          />
        </div>

        {/* Quick-view chip (desktop hover hint, no-op on touch) */}
        <span className="pointer-events-none absolute bottom-3 left-3 inline-flex translate-y-2 items-center gap-1 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-900 opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Voir le détail →
        </span>
      </div>

      {/* Info area */}
      <div className="relative flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight text-ink-900">{product.name}</h3>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-500">{product.sku}</div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-black tracking-tight text-ink-900">{mur(unit)}</span>
          {isWholesale && (
            <span className="text-xs text-ink-500 line-through decoration-1">{mur(product.retail_price_mur)}</span>
          )}
        </div>

        {isWholesale && (
          <div className="-mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-prime-50 px-2 py-0.5 text-[11px] font-semibold text-prime-700">
            min. {minQty} unités · gros
          </div>
        )}

        {/* Add-to-cart sits above the stretched link via z-20 */}
        <div className="relative z-20 mt-auto flex gap-2">
          <button
            type="button"
            disabled={isOut}
            onClick={(e) => {
              // Don't trigger navigation when adding to cart
              e.stopPropagation()
              e.preventDefault()
              addToCart(product.id, minQty)
              setAdded(true)
              setTimeout(() => setAdded(false), 1500)
              if (reelSlug) {
                fetch('/api/track', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reelSlug, productId: product.id, eventType: 'add_to_cart' }),
                }).catch(() => {})
              }
            }}
            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              isOut
                ? 'cursor-not-allowed bg-ink-100 text-ink-500'
                : added
                  ? 'bg-mint-500 text-white shadow-md shadow-mint-600/30'
                  : 'bg-ink-900 text-paper hover:bg-prime-600 hover:shadow-md hover:shadow-prime-600/30 active:scale-[0.98]'
            }`}
          >
            {isOut ? 'Sold out' : added ? '✓ Dans le panier' : `Ajouter ${minQty}×`}
          </button>
        </div>
      </div>
    </article>
  )
}
