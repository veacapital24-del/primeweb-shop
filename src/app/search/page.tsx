import Link from 'next/link'
import { serverClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'
import type { ProductStock } from '@/types/db'

export const dynamic = 'force-dynamic'

type PageProps = { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = '' } = await searchParams
  const query = q.trim()

  let products: ProductStock[] = []
  if (query) {
    const sb = await serverClient()
    const pattern = `%${query.replace(/[%_]/g, '')}%`
    const { data } = await sb
      .from('product_stock')
      .select('*')
      .or(`name.ilike.${pattern},sku.ilike.${pattern}`)
      .order('available', { ascending: false })
      .limit(48)
      .returns<ProductStock[]>()
    products = data ?? []
  }

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-10">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-prime-700">Recherche</div>
        <h1 className="font-display mt-1 text-3xl font-black tracking-tight md:text-4xl">
          {query ? <>Résultats pour <em className="italic text-prime-700">«{query}»</em></> : 'Que cherchez-vous ?'}
        </h1>
        {query && (
          <p className="mt-2 text-sm text-ink-500">
            {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}.
          </p>
        )}
      </div>

      {!query && (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-paper-dim p-10 text-center">
          <p className="text-ink-700">Tapez un mot-clé dans la barre de recherche en haut.</p>
          <p className="mt-1 text-xs text-ink-500">Essayez : <span className="font-semibold">riz</span>, <span className="font-semibold">savon</span>, <span className="font-semibold">phenix</span>.</p>
        </div>
      )}

      {query && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-paper-dim p-10 text-center">
          <p className="text-ink-700">Aucun produit ne correspond à «{query}».</p>
          <Link href="/flash" className="mt-3 inline-block text-prime-700 underline">Voir les flash deals</Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  )
}
