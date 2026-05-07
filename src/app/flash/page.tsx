import { serverClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'
import { FlashTicker } from '@/components/FlashTicker'
import type { ProductStock } from '@/types/db'

export const revalidate = 15

export default async function FlashPage() {
  const sb = await serverClient()

  const [flash, all] = await Promise.all([
    sb.from('product_stock').select('*').lte('available', 10).order('available', { ascending: true }).returns<ProductStock[]>(),
    sb.from('product_stock').select('*').order('available', { ascending: false }).returns<ProductStock[]>(),
  ])

  const flashItems = flash.data ?? []
  const allItems = all.data ?? []

  return (
    <div>
      <FlashTicker initial={flashItems.filter((p) => p.available > 0)} />

      <section className="mx-auto max-w-screen-2xl px-4 pt-8">
        <div className="rounded-3xl border border-flash-500/30 bg-flash-50 p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-flash-500"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-flash-700">Live</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-ink-900 md:text-4xl">
            Flash inventory — qui s'en va, s'en va.
          </h1>
          <p className="mt-2 max-w-2xl text-ink-700">
            Les chiffres ci-dessous sont le stock <strong>en direct</strong>. Quand un client achète, vous le voyez
            tomber. Pas de surprise au comptoir.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 pt-8">
        <h2 className="mb-3 text-lg font-bold">⚡ Bientôt épuisés</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {flashItems.map((p) => <ProductCard key={p.id} product={p} />)}
          {flashItems.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-ink-300 bg-white p-8 text-center text-ink-500">
              Tout est bien stocké pour le moment. Revenez plus tard !
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 pt-12">
        <h2 className="mb-3 text-lg font-bold">Catalogue complet</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {allItems.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  )
}
