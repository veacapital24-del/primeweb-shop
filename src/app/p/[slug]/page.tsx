import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'
import { ProductGallery } from './ProductGallery'
import { ProductBuyBox } from './ProductBuyBox'
import { MobileBuyBar } from './MobileBuyBar'
import type { ProductStock } from '@/types/db'

export const revalidate = 60

type PageProps = { params: Promise<{ slug: string }> }

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const sb = await serverClient()

  const { data: product } = await sb
    .from('product_stock')
    .select('*')
    .eq('slug', slug)
    .maybeSingle<ProductStock>()
  if (!product) notFound()

  const [details, related] = await Promise.all([
    sb.from('products').select('description').eq('id', product.id).maybeSingle<{ description: string | null }>(),
    sb.from('product_stock').select('*').neq('id', product.id).order('available', { ascending: false }).limit(8).returns<ProductStock[]>(),
  ])

  return (
    <div className="space-y-14 pb-32 md:pb-16">
      {/* Breadcrumb */}
      <nav className="border-b border-ink-300/60 bg-paper-dim/40">
        <ol className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-ink-500">
          <li><Link href="/" className="hover:text-ink-900">Accueil</Link></li>
          <li className="text-ink-300">/</li>
          <li>
            <Link href={product.is_hard_discount ? '/flash' : '/'} className="hover:text-ink-900">
              {product.is_hard_discount ? 'Hard discount' : 'Catalogue'}
            </Link>
          </li>
          <li className="text-ink-300">/</li>
          <li className="truncate font-semibold text-ink-700">{product.name}</li>
        </ol>
      </nav>

      {/* Main grid */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-14 lg:gap-20">
        <div>
          <ProductGallery name={product.name} imageUrl={product.image_url} />
        </div>
        <div className="md:sticky md:top-32 md:self-start">
          <ProductBuyBox product={product} description={details.data?.description ?? null} />
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid divide-y divide-ink-300/60 overflow-hidden rounded-3xl border border-ink-300/60 bg-paper md:grid-cols-3 md:divide-x md:divide-y-0">
          <Trust icon="🚚" title="Livraison Maurice" subtitle="Express 24-48h · gratuite dès Rs 1 500" />
          <Trust icon="💳" title="Paiement flexible" subtitle="MCB Juice · WhatsApp · cash à la livraison" />
          <Trust icon="↩️" title="Retour 7 jours" subtitle="Sans question si le produit ne convient pas" />
        </div>
      </section>

      {/* Related products */}
      {(related.data ?? []).length > 0 && (
        <section className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-prime-700">Suggestions</div>
              <h2 className="font-display mt-1 text-2xl font-black tracking-tight md:text-3xl">
                Souvent commandé avec
              </h2>
            </div>
            <Link href="/" className="shrink-0 text-sm font-semibold text-ink-700 underline decoration-prime-500 decoration-2 underline-offset-4 hover:text-ink-900">
              Tout le catalogue →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {(related.data ?? []).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <MobileBuyBar product={product} />
    </div>
  )
}

function Trust({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-prime-50 text-xl">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-ink-900">{title}</div>
        <div className="text-xs text-ink-500">{subtitle}</div>
      </div>
    </div>
  )
}
