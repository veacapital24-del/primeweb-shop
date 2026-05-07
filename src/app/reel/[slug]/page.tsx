import { notFound } from 'next/navigation'
import { serverClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'
import { ReelTracker } from '@/components/ReelTracker'
import { WhatsAppOrderButton } from '@/components/WhatsAppOrderButton'
import { ReelPageMode } from './ReelPageMode'
import type { ProductStock, Reel } from '@/types/db'

export const revalidate = 60

type PageProps = { params: Promise<{ slug: string }> }

type ReelWithProducts = Reel & {
  reel_products: Array<{ position: number; products: ProductStock & { available: never } }>
}

export default async function ReelLandingPage({ params }: PageProps) {
  const { slug } = await params
  const sb = await serverClient()

  const { data: reel } = await sb
    .from('reels')
    .select('id, slug, platform, external_url, thumbnail_url, caption, posted_at')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle<Reel>()

  if (!reel) notFound()

  const { data: rps } = await sb
    .from('reel_products')
    .select('position, product_id')
    .eq('reel_id', reel.id)
    .order('position')

  const productIds = (rps ?? []).map((r) => r.product_id)
  const { data: products } = productIds.length === 0
    ? { data: [] as ProductStock[] }
    : await sb
        .from('product_stock')
        .select('*')
        .in('id', productIds)
        .returns<ProductStock[]>()

  // Preserve reel order
  const ordered = (rps ?? [])
    .map((r) => products!.find((p) => p.id === r.product_id))
    .filter((p): p is ProductStock => Boolean(p))

  return (
    <>
      <ReelTracker slug={reel.slug} />
      <ReelPageMode />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 shadow-lg">
          {reel.thumbnail_url && (
            <img src={reel.thumbnail_url} alt={reel.caption ?? ''} className="aspect-[4/5] w-full object-cover opacity-95" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/95 via-ink-900/50 to-transparent p-5 text-white">
            <span className="inline-block rounded-full bg-prime-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              {reel.platform}
            </span>
            <h1 className="mt-2 text-xl font-bold">{reel.caption}</h1>
            {reel.external_url && (
              <a href={reel.external_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline">
                Voir le reel original ↗
              </a>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <span className="rounded-full bg-flash-500 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white">
              Reel-to-cart
            </span>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              Tout ce qui est dans la vidéo — directement dans le panier.
            </h2>
            <p className="mt-1 text-sm text-ink-700">
              {ordered.length} produit{ordered.length > 1 ? 's' : ''} de ce reel. Stock en direct, prix en MUR.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ordered.map((p) => (
              <ProductCard key={p.id} product={p} reelSlug={reel.slug} />
            ))}
          </div>

          <div className="sticky bottom-3 z-20 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-ink-300">
            <WhatsAppOrderButton
              products={ordered}
              reelSlug={reel.slug}
              label="Commander tout le reel"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-base font-bold text-white hover:bg-emerald-600"
            />
          </div>
        </div>
      </section>
    </>
  )
}
