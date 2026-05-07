import Link from 'next/link'
import { serverClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/ProductCard'
import { FlashTicker } from '@/components/FlashTicker'
import type { ProductStock } from '@/types/db'

export const revalidate = 30

export default async function HomePage() {
  const sb = await serverClient()

  const [discounts, flash, recent] = await Promise.all([
    sb.from('product_stock').select('*').eq('is_hard_discount', true).order('available', { ascending: false }).limit(8).returns<ProductStock[]>(),
    sb.from('product_stock').select('*').lte('available', 10).gt('available', 0).order('available', { ascending: true }).limit(20).returns<ProductStock[]>(),
    sb.from('product_stock').select('*').order('id').limit(12).returns<ProductStock[]>(),
  ])

  return (
    <div className="space-y-20">
      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-60" />
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-prime-200/60 blur-3xl" />
        <div className="absolute -right-32 -top-20 h-[28rem] w-[28rem] rounded-full bg-flash-50 blur-3xl" />

        <div className="relative mx-auto grid max-w-screen-2xl items-center gap-12 px-4 pt-12 pb-8 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-300 bg-paper-dim px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flash-500 opacity-60"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-flash-500"></span>
              </span>
              Hard discount · live stock · WhatsApp
            </div>

            <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-black leading-[0.92] text-ink-900">
              Le panier malin{' '}
              <span className="relative inline-block">
                <span className="relative z-10 italic text-prime-600">pour Maurice.</span>
                <svg className="absolute -bottom-2 left-0 z-0 h-3 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" fill="none">
                  <path d="M2 8 Q 50 2, 100 6 T 198 5" stroke="var(--color-prime-500)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="max-w-md text-lg text-ink-700">
              Stocks vivants, prix gros pour les tabagies, et chaque reel se commande en deux taps sur WhatsApp.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/flash"
                className="group relative overflow-hidden rounded-full bg-ink-900 px-6 py-3.5 text-sm font-bold text-paper shadow-lg shadow-ink-900/20 transition hover:-translate-y-0.5 hover:bg-prime-600 hover:shadow-prime-600/30"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Voir les flash deals
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
                <span className="absolute inset-y-0 -left-10 w-8 -skew-x-12 bg-white/20 animate-shine"></span>
              </Link>
              <Link
                href="/wholesale"
                className="rounded-full border border-ink-300 bg-paper px-6 py-3.5 text-sm font-bold text-ink-900 transition hover:-translate-y-0.5 hover:border-ink-700"
              >
                Espace gros
              </Link>
            </div>

            <dl className="grid max-w-md grid-cols-3 gap-4 pt-4">
              {[
                { k: '10K+', v: 'followers' },
                { k: '200+', v: 'tabagies' },
                { k: '< 24h', v: 'livraison' },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-ink-300/60 bg-paper-dim/60 px-4 py-3">
                  <dt className="font-display text-2xl font-black tracking-tight text-ink-900">{s.k}</dt>
                  <dd className="text-[11px] uppercase tracking-widest text-ink-500">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroCollage flash={(flash.data ?? []).slice(0, 3)} />
        </div>
      </section>

      <FlashTicker initial={flash.data ?? []} />

      {/* ───── Categories strip ───── */}
      <section className="mx-auto max-w-screen-2xl px-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[
            { emoji: '🍚', label: 'Épicerie', tone: 'bg-prime-100' },
            { emoji: '🥖', label: 'Boulangerie', tone: 'bg-flash-50' },
            { emoji: '🥛', label: 'Frais', tone: 'bg-mint-100' },
            { emoji: '🧴', label: 'Hygiène', tone: 'bg-paper-dim' },
            { emoji: '🍺', label: 'Boissons', tone: 'bg-prime-100' },
            { emoji: '☕️', label: 'Thé / Café', tone: 'bg-paper-dim' },
            { emoji: '🍝', label: 'Pâtes', tone: 'bg-flash-50' },
            { emoji: '🛒', label: 'Tabagie', tone: 'bg-mint-100' },
          ].map((c) => (
            <button
              key={c.label}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border border-ink-300/60 px-4 py-2.5 text-sm font-semibold text-ink-900 transition hover:-translate-y-0.5 hover:shadow-md ${c.tone}`}
            >
              <span className="text-base">{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ───── Hard discount feed ───── */}
      <section className="mx-auto max-w-screen-2xl px-4">
        <SectionHeader
          eyebrow="Hard discount"
          title="Les essentiels — moins chers chaque jour"
          href="/flash"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {(discounts.data ?? []).map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ───── Reel-to-cart promo ───── */}
      <section className="mx-auto max-w-screen-2xl px-4">
        <Link
          href="/reels"
          className="group relative block overflow-hidden rounded-3xl bg-ink-900 p-8 text-paper md:p-12"
        >
          <div className="absolute inset-0 bg-grain opacity-30" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-flash-500/30 blur-3xl transition group-hover:scale-110" />
          <div className="absolute right-10 bottom-0 h-72 w-56 -translate-y-4 rotate-6 rounded-2xl bg-paper bg-cover bg-center transition group-hover:-rotate-3 group-hover:translate-y-0"
               style={{ backgroundImage: "url('https://picsum.photos/seed/reel-promo/400/600')" }} />
          <div className="relative max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-flash-500/40 bg-flash-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-flash-500">
              Social commerce
            </span>
            <h2 className="font-display mt-4 text-3xl font-black leading-tight md:text-5xl">
              Chaque reel <em className="italic text-prime-500">se commande.</em>
            </h2>
            <p className="mt-3 max-w-sm text-ink-300">
              Mettez le lien dans la bio, vos abonnés tombent sur une page panier prête. WhatsApp pré-rempli, c'est tout.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-prime-400 transition group-hover:gap-3">
              Voir les reels shoppables →
            </span>
          </div>
        </Link>
      </section>

      {/* ───── Catalog ───── */}
      <section className="mx-auto max-w-screen-2xl px-4">
        <SectionHeader
          eyebrow="Catalogue"
          title="Tout le rayon Primeweb"
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {(recent.data ?? []).map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-prime-600">{eyebrow}</div>
        <h2 className="font-display mt-1 text-2xl font-black tracking-tight md:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-ink-700 underline decoration-prime-500 decoration-2 underline-offset-4 hover:text-ink-900">
          Tout voir →
        </Link>
      )}
    </div>
  )
}

function HeroCollage({ flash }: { flash: ProductStock[] }) {
  return (
    <div className="relative hidden h-[28rem] md:block">
      {/* Big card */}
      <div className="absolute right-0 top-0 h-72 w-56 overflow-hidden rounded-3xl bg-ink-100 shadow-2xl shadow-ink-900/15 ring-1 ring-ink-300/60 animate-float-slow">
        {flash[0]?.image_url && (
          <img src={flash[0].image_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-paper/95 p-3 backdrop-blur">
          <div className="text-[10px] font-bold uppercase tracking-widest text-flash-500">Flash · {flash[0]?.available ?? 0} left</div>
          <div className="mt-0.5 text-sm font-semibold leading-tight">{flash[0]?.name ?? '—'}</div>
        </div>
      </div>

      {/* Mid card */}
      <div className="absolute -left-6 top-24 h-60 w-44 overflow-hidden rounded-3xl bg-prime-100 shadow-xl shadow-prime-900/15 ring-1 ring-ink-300/60 [animation-delay:1.5s] animate-float-slow">
        {flash[1]?.image_url && (
          <img src={flash[1].image_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute right-2 top-2 rounded-full bg-prime-500 px-2 py-0.5 text-[10px] font-bold text-white">
          Hard discount
        </div>
      </div>

      {/* Small card */}
      <div className="absolute right-12 bottom-4 h-44 w-40 overflow-hidden rounded-3xl bg-mint-100 shadow-xl shadow-ink-900/10 ring-1 ring-ink-300/60 [animation-delay:0.7s] animate-float-slow">
        {flash[2]?.image_url && (
          <img src={flash[2].image_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      {/* WhatsApp chip */}
      <div className="absolute -left-2 bottom-2 flex items-center gap-2 rounded-full bg-mint-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-mint-600/30">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M20.5 3.5A11 11 0 0 0 3.6 17.7L2 22l4.4-1.6A11 11 0 1 0 20.5 3.5Z" />
        </svg>
        Order on WhatsApp
      </div>
    </div>
  )
}
