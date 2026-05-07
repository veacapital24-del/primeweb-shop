import Link from 'next/link'
import { serverClient } from '@/lib/supabase/server'
import type { Reel } from '@/types/db'

export const revalidate = 120

export default async function ReelsIndexPage() {
  const sb = await serverClient()
  const { data } = await sb
    .from('reels')
    .select('id, slug, platform, thumbnail_url, caption, posted_at')
    .eq('active', true)
    .order('posted_at', { ascending: false })
    .returns<Reel[]>()

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-6">
        <span className="rounded-full bg-flash-500 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white">
          Social commerce
        </span>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">Reels — shoppables.</h1>
        <p className="mt-2 max-w-2xl text-ink-700">
          Chaque reel a sa page panier. Partagez le lien dans la bio ou la légende pour transformer une vue en commande.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {(data ?? []).map((r) => (
          <Link
            key={r.id}
            href={`/reel/${r.slug}`}
            className="group relative block aspect-[9/16] overflow-hidden rounded-2xl bg-ink-900 ring-1 ring-ink-300/60 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ink-900/10"
          >
            {r.thumbnail_url && (
              <img
                src={r.thumbnail_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            )}

            {/* legibility scrim only at the very bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900/40 to-transparent" />

            {/* platform pill — top left */}
            <span className="absolute left-2 top-2 rounded-full bg-paper/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ink-900 backdrop-blur">
              {r.platform}
            </span>

            {/* play affordance — center, fades on hover */}
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-paper/85 text-ink-900 shadow-lg backdrop-blur transition duration-300 group-hover:scale-110 group-hover:bg-paper">
                <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-[1px]" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>

            {/* small frosted pill: caption + date — bottom */}
            <div className="absolute inset-x-2 bottom-2 rounded-lg bg-paper/85 px-2 py-1 backdrop-blur">
              <p className="line-clamp-1 text-[11px] font-semibold leading-tight text-ink-900">
                {r.caption}
              </p>
              {r.posted_at && (
                <p className="mt-0.5 text-[10px] leading-none text-ink-500">
                  {new Date(r.posted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </p>
              )}
            </div>
          </Link>
        ))}
        {(!data || data.length === 0) && (
          <div className="col-span-full rounded-2xl border border-dashed border-ink-300 p-8 text-center text-ink-500">
            Aucun reel encore — ajoutez-en dans l'admin.
          </div>
        )}
      </div>
    </section>
  )
}
