'use client'

import { useEffect, useState } from 'react'
import { mur } from '@/lib/format'
import { addToCart, useMode, setMode } from '@/lib/cart'
import { FlashStockBadge } from '@/components/FlashStockBadge'
import { WhatsAppOrderButton } from '@/components/WhatsAppOrderButton'
import type { ProductStock } from '@/types/db'

type Props = {
  product: ProductStock
  description: string | null
}

export function ProductBuyBox({ product, description }: Props) {
  const [mode] = useMode()

  const isWholesale = mode === 'wholesale' && product.wholesale_price_mur != null
  const unit = isWholesale && product.wholesale_price_mur != null
    ? product.wholesale_price_mur
    : product.retail_price_mur
  const minQty = isWholesale ? product.wholesale_min_qty : 1
  const discount = product.wholesale_price_mur != null
    ? Math.round(((product.retail_price_mur - product.wholesale_price_mur) / product.retail_price_mur) * 100)
    : 0
  const isOut = product.available === 0
  const isLow = product.available > 0 && product.available <= product.low_stock_threshold

  const [qty, setQty] = useState(minQty)
  const [added, setAdded] = useState(false)
  useEffect(() => { setQty(minQty) }, [minQty])

  const subtotal = unit * qty

  const onAdd = () => {
    addToCart(product.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        {product.is_hard_discount && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-prime-700 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-paper">
            <span className="h-1 w-1 rounded-full bg-paper" /> Hard discount
          </span>
        )}
        {isWholesale && discount > 0 && (
          <span className="rounded-full bg-flash-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
            −{discount}% gros
          </span>
        )}
        <FlashStockBadge productId={product.id} initial={product.available} threshold={product.low_stock_threshold} />
      </div>

      {/* Title */}
      <header>
        <h1 className="font-display text-3xl font-black leading-tight tracking-tight md:text-4xl">
          {product.name}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-500">
          <span className="font-mono uppercase tracking-wider">SKU {product.sku}</span>
          <span className="text-ink-300">·</span>
          <span>Disponible · {product.available} unité{product.available > 1 ? 's' : ''}</span>
        </div>
      </header>

      {description && (
        <p className="text-base leading-relaxed text-ink-700">{description}</p>
      )}

      {isLow && (
        <div className="flex items-center gap-2 rounded-2xl border border-flash-500/30 bg-flash-50 px-4 py-3 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flash-500 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-flash-500" />
          </span>
          <span className="font-semibold text-flash-700">Plus que {product.available} en stock</span>
          <span className="text-ink-700">— qui s'en va, s'en va.</span>
        </div>
      )}

      {/* Price card */}
      <div className="overflow-hidden rounded-3xl border border-ink-300/60 bg-paper">
        <div className="p-6">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
            {isWholesale ? 'Tarif tabagie' : 'Prix détail'}
          </div>
          <div className="mt-1 flex items-baseline flex-wrap gap-3">
            <span className="font-display text-4xl font-black tracking-tight text-prime-700 md:text-5xl">
              {mur(unit)}
            </span>
            {isWholesale && (
              <>
                <span className="text-base text-ink-500 line-through">{mur(product.retail_price_mur)}</span>
                <span className="rounded-full bg-flash-500 px-2.5 py-1 text-[11px] font-extrabold text-white">
                  économisez {mur(product.retail_price_mur - product.wholesale_price_mur!)}
                </span>
              </>
            )}
          </div>
          {isWholesale && (
            <p className="mt-2 text-sm text-prime-700">
              À partir de <strong>{minQty} unités</strong> · livraison directe en magasin.
            </p>
          )}
        </div>

        {!isWholesale && product.wholesale_price_mur != null && (
          <button
            onClick={() => setMode('wholesale')}
            className="group flex w-full items-center justify-between gap-3 border-t border-ink-300/60 bg-prime-50 px-6 py-3 text-left transition hover:bg-prime-100"
          >
            <div className="text-sm">
              <span className="font-bold text-prime-700">Tabagie ?</span>{' '}
              <span className="text-ink-700">Activez le mode gros pour</span>{' '}
              <span className="font-bold text-prime-700">{mur(product.wholesale_price_mur)}</span>
              <span className="text-ink-700"> dès {product.wholesale_min_qty} unités.</span>
            </div>
            <span className="shrink-0 rounded-full bg-prime-700 px-3 py-1 text-xs font-bold text-paper transition group-hover:bg-prime-800">
              −{discount}% →
            </span>
          </button>
        )}
      </div>

      {/* Quantity + subtotal */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-paper-dim/60 p-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Quantité</div>
          <div className="mt-1.5 inline-flex items-center rounded-xl border border-ink-300 bg-paper">
            <button
              onClick={() => setQty((q) => Math.max(minQty, q - (isWholesale ? minQty : 1)))}
              disabled={qty <= minQty}
              className="px-4 py-2.5 text-lg disabled:text-ink-300"
              aria-label="Diminuer"
            >−</button>
            <input
              type="number"
              value={qty}
              min={minQty}
              onChange={(e) => setQty(Math.max(minQty, Number(e.target.value) || minQty))}
              className="w-14 border-x border-ink-300 bg-paper py-2.5 text-center font-bold focus:outline-none"
            />
            <button
              onClick={() => setQty((q) => q + (isWholesale ? 1 : 1))}
              className="px-4 py-2.5 text-lg"
              aria-label="Augmenter"
            >+</button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Sous-total</div>
          <div className="font-display text-2xl font-black text-ink-900">{mur(subtotal)}</div>
        </div>
      </div>

      {/* CTAs */}
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
        <button
          onClick={onAdd}
          disabled={isOut}
          className={`rounded-2xl px-6 py-4 text-base font-bold transition ${
            isOut
              ? 'cursor-not-allowed bg-ink-100 text-ink-500'
              : added
                ? 'bg-mint-500 text-white shadow-lg shadow-mint-600/30'
                : 'bg-ink-900 text-paper shadow-lg shadow-ink-900/20 hover:-translate-y-0.5 hover:bg-prime-700 hover:shadow-prime-700/30'
          }`}
        >
          {isOut ? 'Sold out' : added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
        </button>
        <WhatsAppOrderButton
          products={[product]}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-mint-600/30 transition hover:-translate-y-0.5 hover:bg-mint-600"
          label="Commander sur WhatsApp"
        />
      </div>

      {/* Specs accordion */}
      <details className="group overflow-hidden rounded-2xl border border-ink-300/60 bg-paper">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-3.5 text-sm font-semibold marker:hidden">
          <span>Caractéristiques & livraison</span>
          <svg className="h-4 w-4 text-ink-500 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>
        <div className="border-t border-ink-300/60 px-5 py-4">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="font-semibold text-ink-500">Référence</dt>
            <dd className="font-mono text-ink-900">{product.sku}</dd>
            <dt className="font-semibold text-ink-500">Catégorie</dt>
            <dd className="text-ink-900">{product.is_hard_discount ? 'Hard discount' : 'Catalogue'}</dd>
            <dt className="font-semibold text-ink-500">Prix détail</dt>
            <dd className="text-ink-900">{mur(product.retail_price_mur)}</dd>
            {product.wholesale_price_mur != null && (
              <>
                <dt className="font-semibold text-ink-500">Prix gros</dt>
                <dd className="text-ink-900">
                  {mur(product.wholesale_price_mur)} <span className="text-ink-500">· dès {product.wholesale_min_qty} unités</span>
                </dd>
              </>
            )}
            <dt className="font-semibold text-ink-500">Livraison</dt>
            <dd className="text-ink-900">24-48h · gratuite dès Rs 1 500</dd>
            <dt className="font-semibold text-ink-500">Paiement</dt>
            <dd className="text-ink-900">MCB Juice · cash à la livraison · WhatsApp</dd>
          </dl>
        </div>
      </details>

      {/* Share strip */}
      <div className="flex items-center gap-3 text-xs text-ink-500">
        <span className="font-semibold">Partager :</span>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${product.name} — ${mur(product.retail_price_mur)} sur Primeweb`)} ${typeof window !== 'undefined' ? window.location.href : ''}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-ink-300/60 px-3 py-1 hover:border-mint-500 hover:text-mint-600"
        >
          WhatsApp
        </a>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="inline-flex items-center gap-1 rounded-full border border-ink-300/60 px-3 py-1 hover:border-prime-700 hover:text-prime-700"
        >
          Copier le lien
        </button>
      </div>
    </div>
  )
}
