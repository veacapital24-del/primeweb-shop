'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { browserClient } from '@/lib/supabase/client'
import { mur } from '@/lib/format'
import {
  useCart,
  useMode,
  useShop,
  setQty,
  removeFromCart,
  clearCart,
  setMode,
} from '@/lib/cart'
import { WhatsAppOrderButton } from '@/components/WhatsAppOrderButton'
import { FlashStockBadge } from '@/components/FlashStockBadge'
import type { ProductStock } from '@/types/db'

const FREE_SHIPPING_THRESHOLD = 1500
const DELIVERY_FEE_MUR = 100

export default function CartPage() {
  const cart = useCart()
  const [mode] = useMode()
  const [shop] = useShop()
  const [products, setProducts] = useState<ProductStock[]>([])
  const [loading, setLoading] = useState(true)

  // Refetch products whenever the cart contents change
  useEffect(() => {
    if (cart.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    const ids = cart.map((l) => l.product_id)
    browserClient()
      .from('product_stock')
      .select('*')
      .in('id', ids)
      .returns<ProductStock[]>()
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [cart.length, cart.map((l) => l.product_id).join(',')])

  const isWholesale = mode === 'wholesale'

  type Line = {
    line: { product_id: string; qty: number }
    product: ProductStock
    unit: number
    lineTotal: number
    retailLineTotal: number
    wholesaleAvailable: boolean
    minQty: number
    overStock: boolean
    underMinQty: boolean
  }

  const lines: Line[] = useMemo(() => {
    const out: Line[] = []
    for (const line of cart) {
      const product = products.find((p) => p.id === line.product_id)
      if (!product) continue
      const wholesaleAvailable = product.wholesale_price_mur != null
      const unit = isWholesale && wholesaleAvailable
        ? product.wholesale_price_mur!
        : product.retail_price_mur
      out.push({
        line,
        product,
        unit,
        lineTotal: unit * line.qty,
        retailLineTotal: product.retail_price_mur * line.qty,
        wholesaleAvailable,
        minQty: isWholesale && wholesaleAvailable ? product.wholesale_min_qty : 1,
        overStock: line.qty > product.available,
        underMinQty: isWholesale && wholesaleAvailable && line.qty < product.wholesale_min_qty,
      })
    }
    return out
  }, [cart, products, isWholesale])

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const retailSubtotal = lines.reduce((s, l) => s + l.retailLineTotal, 0)
  const wholesaleSavings = retailSubtotal - subtotal
  const itemCount = lines.reduce((s, l) => s + l.line.qty, 0)

  // Wholesale upsell — items priced eligibly but mode is retail
  const wholesaleEligibleSavings = useMemo(() => {
    if (isWholesale) return 0
    return lines.reduce((s, l) => {
      if (!l.product.wholesale_price_mur) return s
      const drop = l.product.retail_price_mur - l.product.wholesale_price_mur
      const minQty = l.product.wholesale_min_qty
      // Only count if their current qty would already meet the wholesale min
      if (l.line.qty >= minQty) return s + drop * l.line.qty
      return s
    }, 0)
  }, [lines, isWholesale])

  const deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE_MUR
  const total = subtotal + deliveryFee
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <PageHeader itemCount={itemCount} />

      {loading && cart.length > 0 ? (
        <Skeleton />
      ) : cart.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          {/* ── Items column ── */}
          <div className="space-y-4">
            <ModeBanner mode={mode} shop={shop} />

            {wholesaleEligibleSavings > 0 && (
              <button
                onClick={() => setMode('wholesale')}
                className="group flex w-full items-center gap-3 rounded-2xl border border-prime-200 bg-prime-50 p-4 text-left transition hover:border-prime-500 hover:bg-prime-100"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-prime-700 text-paper">
                  💡
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-bold text-prime-700">
                    Vous pourriez économiser {mur(wholesaleEligibleSavings)} en mode gros.
                  </div>
                  <div className="text-xs text-ink-700">
                    Activez le tarif tabagie — vos quantités actuelles y sont déjà éligibles.
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-prime-700 px-3 py-1.5 text-xs font-bold text-paper transition group-hover:bg-prime-800">
                  Activer →
                </span>
              </button>
            )}

            <ul className="space-y-3">
              {lines.map(({ line, product, unit, lineTotal, retailLineTotal, minQty, overStock, underMinQty, wholesaleAvailable }) => (
                <li
                  key={product.id}
                  className="flex flex-col gap-3 rounded-2xl border border-ink-300/60 bg-paper p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                >
                  <Link
                    href={`/p/${product.slug}`}
                    className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-dim ring-1 ring-ink-300/60 sm:h-24 sm:w-24"
                  >
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/p/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-prime-700">
                          {product.name}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-500">
                          <span className="font-mono uppercase tracking-wider">{product.sku}</span>
                          <FlashStockBadge productId={product.id} initial={product.available} threshold={product.low_stock_threshold} />
                        </div>
                      </div>
                    </div>

                    {(overStock || underMinQty) && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-flash-50 px-2.5 py-0.5 text-[11px] font-semibold text-flash-700">
                        ⚠
                        {overStock
                          ? ` Stock disponible : ${product.available} unité${product.available > 1 ? 's' : ''}`
                          : ` Min. gros : ${product.wholesale_min_qty} unités`}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                      {/* qty stepper */}
                      <div className="inline-flex items-center rounded-xl border border-ink-300 bg-paper">
                        <button
                          aria-label="Diminuer"
                          onClick={() => setQty(product.id, Math.max(0, line.qty - 1))}
                          className="px-3 py-2 text-base hover:text-prime-700"
                        >−</button>
                        <input
                          type="number"
                          min={0}
                          value={line.qty}
                          onChange={(e) => setQty(product.id, Math.max(0, Number(e.target.value) || 0))}
                          className="w-12 border-x border-ink-300 bg-paper py-2 text-center text-sm font-bold focus:outline-none"
                        />
                        <button
                          aria-label="Augmenter"
                          onClick={() => setQty(product.id, line.qty + 1)}
                          className="px-3 py-2 text-base hover:text-prime-700"
                        >+</button>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          aria-label="Retirer"
                          className="border-l border-ink-300 px-3 py-2 text-ink-500 hover:bg-flash-50 hover:text-flash-700"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </div>

                      {/* line totals */}
                      <div className="text-right">
                        <div className="font-display text-lg font-black text-ink-900">{mur(lineTotal)}</div>
                        <div className="text-[11px] text-ink-500">
                          {mur(unit)} × {line.qty}
                          {wholesaleAvailable && unit < product.retail_price_mur && (
                            <span className="ml-1 text-mint-600">· vous économisez {mur(retailLineTotal - lineTotal)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-2 text-sm">
              <Link href="/" className="font-semibold text-ink-700 underline decoration-prime-500 decoration-2 underline-offset-4 hover:text-ink-900">
                ← Continuer mes achats
              </Link>
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-ink-500 underline hover:text-flash-700"
              >
                Vider le panier
              </button>
            </div>
          </div>

          {/* ── Summary column ── */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-ink-300/60 bg-paper shadow-sm">
              <div className="border-b border-ink-300/60 bg-paper-dim/40 px-5 py-3">
                <h2 className="font-display text-lg font-black tracking-tight">Récapitulatif</h2>
              </div>

              <div className="space-y-4 p-5">
                {/* Free shipping progress */}
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-700">
                      {remainingForFreeShipping === 0
                        ? '🎉 Livraison gratuite débloquée'
                        : `Encore ${mur(remainingForFreeShipping)} pour la livraison gratuite`}
                    </span>
                    <span className="text-ink-500">{Math.round(shippingProgress)}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${remainingForFreeShipping === 0 ? 'bg-mint-500' : 'bg-prime-500'}`}
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Promo code (placeholder, visual only) */}
                <details className="group rounded-xl border border-dashed border-ink-300 px-3 py-2 text-xs">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink-700 marker:hidden">
                    <span>Code promo</span>
                    <svg className="h-3.5 w-3.5 text-ink-500 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                  </summary>
                  <div className="mt-2 flex gap-2">
                    <input className="flex-1 rounded-lg border border-ink-300 bg-paper px-3 py-1.5 text-xs focus:border-prime-500 focus:outline-none" placeholder="PRIMEMU" />
                    <button className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-bold text-paper hover:bg-prime-700">Appliquer</button>
                  </div>
                </details>

                {/* Lines */}
                <dl className="space-y-1.5 text-sm">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-ink-700">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</dt>
                    <dd className="font-semibold tabular-nums">{mur(subtotal)}</dd>
                  </div>
                  {wholesaleSavings > 0 && (
                    <div className="flex items-baseline justify-between text-mint-600">
                      <dt>Remise gros</dt>
                      <dd className="font-semibold tabular-nums">−{mur(wholesaleSavings)}</dd>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between">
                    <dt className="text-ink-700">Livraison</dt>
                    <dd className={`font-semibold tabular-nums ${deliveryFee === 0 ? 'text-mint-600' : ''}`}>
                      {deliveryFee === 0 ? 'Gratuite' : mur(deliveryFee)}
                    </dd>
                  </div>
                </dl>

                <div className="flex items-baseline justify-between border-t border-ink-300/60 pt-3">
                  <span className="text-sm font-bold text-ink-700">Total</span>
                  <span className="font-display text-3xl font-black text-prime-700 tabular-nums">{mur(total)}</span>
                </div>

                <WhatsAppOrderButton
                  products={products}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint-500 px-5 py-4 text-base font-bold text-white shadow-lg shadow-mint-600/30 transition hover:-translate-y-0.5 hover:bg-mint-600"
                  label="Commander sur WhatsApp"
                />

                <p className="text-center text-[11px] text-ink-500">
                  Pas de paiement en ligne — confirmez sur WhatsApp et payez à la livraison.
                </p>
              </div>

              {/* Trust strip */}
              <div className="grid grid-cols-3 gap-3 border-t border-ink-300/60 bg-paper-dim/40 px-5 py-4 text-[11px] text-ink-700">
                <div className="text-center"><span className="text-base">🚚</span><div className="mt-1 font-semibold">Express 24-48h</div></div>
                <div className="text-center"><span className="text-base">💳</span><div className="mt-1 font-semibold">Paiement flexible</div></div>
                <div className="text-center"><span className="text-base">↩️</span><div className="mt-1 font-semibold">Retour 7 jours</div></div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function PageHeader({ itemCount }: { itemCount: number }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-prime-700">Panier</div>
        <h1 className="font-display mt-1 text-3xl font-black tracking-tight md:text-4xl">
          Votre panier
          {itemCount > 0 && (
            <span className="ml-3 align-middle rounded-full bg-prime-50 px-3 py-1 text-sm font-bold text-prime-700">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </span>
          )}
        </h1>
      </div>
      <Steps />
    </div>
  )
}

function Steps() {
  return (
    <ol className="hidden items-center gap-2 text-xs font-semibold sm:flex">
      <Step n={1} label="Panier" active />
      <Sep />
      <Step n={2} label="WhatsApp" />
      <Sep />
      <Step n={3} label="Livraison" />
    </ol>
  )
}
function Step({ n, label, active }: { n: number; label: string; active?: boolean }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${active ? 'bg-prime-700 text-paper' : 'bg-ink-200 text-ink-500'}`}>{n}</span>
      <span className={active ? 'text-ink-900' : 'text-ink-500'}>{label}</span>
    </li>
  )
}
function Sep() { return <li className="h-px w-6 bg-ink-300" aria-hidden /> }

function ModeBanner({ mode, shop }: { mode: 'retail' | 'wholesale'; shop: string }) {
  if (mode !== 'wholesale') return null
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-prime-700/30 bg-prime-700 px-4 py-2.5 text-paper">
      <span className="rounded-full bg-prime-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-prime-700">
        Mode gros
      </span>
      <span className="text-sm">
        Tarifs tabagie appliqués{shop ? <> · <strong>{shop}</strong></> : ''}.
      </span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 rounded-2xl border border-ink-300/60 bg-paper p-4">
            <div className="h-24 w-24 animate-pulse rounded-xl bg-ink-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-ink-200" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-ink-200" />
              <div className="h-8 w-32 animate-pulse rounded bg-ink-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-3xl bg-ink-200" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-ink-300 bg-paper-dim/40 px-6 py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-prime-50 text-3xl">🛒</div>
      <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl">
        Votre panier est <em className="italic text-prime-700">tout vide</em>.
      </h2>
      <p className="mt-2 max-w-md text-sm text-ink-700">
        Faites un tour côté flash deals, ou activez le mode gros si vous restockez votre tabagie.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/flash" className="rounded-full bg-ink-900 px-5 py-3 text-sm font-bold text-paper transition hover:-translate-y-0.5 hover:bg-prime-700">
          Voir les flash deals
        </Link>
        <Link href="/wholesale" className="rounded-full border border-ink-300 bg-paper px-5 py-3 text-sm font-bold text-ink-900 transition hover:-translate-y-0.5 hover:border-ink-700">
          Espace gros / tabagie
        </Link>
        <Link href="/reels" className="rounded-full border border-ink-300 bg-paper px-5 py-3 text-sm font-bold text-ink-900 transition hover:-translate-y-0.5 hover:border-ink-700">
          Reels shoppables
        </Link>
      </div>
    </div>
  )
}
