import { serverClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'
import { WholesaleAutoMode } from './WholesaleAutoMode'
import type { ProductStock } from '@/types/db'

export const revalidate = 60

export default async function WholesalePage() {
  const sb = await serverClient()
  const { data } = await sb
    .from('product_stock')
    .select('*')
    .not('wholesale_price_mur', 'is', null)
    .order('available', { ascending: false })
    .returns<ProductStock[]>()

  const items = data ?? []

  return (
    <>
      <WholesaleAutoMode />
      <section className="mx-auto max-w-screen-2xl px-4 pt-8">
        <div className="rounded-3xl bg-ink-900 p-8 text-white">
          <span className="inline-block rounded-full bg-prime-500 px-3 py-1 text-xs font-bold uppercase tracking-widest">
            B2B — Tabagies
          </span>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">
            Restock express — par WhatsApp.
          </h1>
          <p className="mt-2 max-w-2xl text-ink-300">
            Activez le toggle "Gros" : les prix passent en tarif tabagie, et la commande part directement sur
            WhatsApp avec votre nom de magasin pré-rempli. Pas d'application à installer.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 pt-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  )
}
