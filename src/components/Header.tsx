'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ModeToggle } from './ModeToggle'
import { CartButton } from './CartButton'

const NAV = [
  { href: '/flash',     label: 'Flash',     dot: true  },
  { href: '/wholesale', label: 'Gros',      dot: false },
  { href: '/reels',     label: 'Reels',     dot: false },
]

const PROMO = [
  { icon: '🚚', text: 'Livraison gratuite dès Rs 1 500 — île Maurice' },
  { icon: '⚡', text: 'Stock en direct · prix tabagie · WhatsApp' },
  { icon: '🇲🇺', text: 'Made in Maurice · paiement à la livraison' },
]

const WHATSAPP_PHONE = '23057000000'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [promoIndex, setPromoIndex] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setPromoIndex((i) => (i + 1) % PROMO.length), 4000)
    return () => clearInterval(id)
  }, [])

  // Close the mobile sheet whenever the route changes
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40">
      {/* ── Promo strip ── */}
      <div className="bg-prime-900 text-paper">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-1.5 text-xs">
          <div className="relative flex h-5 flex-1 items-center overflow-hidden">
            {PROMO.map((p, i) => (
              <span
                key={p.text}
                className={`absolute inset-0 flex items-center gap-2 transition-all duration-500 ${
                  i === promoIndex ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                }`}
              >
                <span aria-hidden>{p.icon}</span>
                <span className="font-medium">{p.text}</span>
              </span>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-paper hover:text-prime-300"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.7L2 22l4.4-1.6A11 11 0 1 0 20.5 3.5Z"/></svg>
              +230 5700 0000
            </a>
            <span className="h-3 w-px bg-paper/20" />
            <button className="font-semibold text-paper/70 hover:text-paper">FR</button>
            <button className="font-semibold text-paper/40 hover:text-paper">EN</button>
          </div>
        </div>
      </div>

      {/* ── Main bar ── */}
      <div
        className={`border-b transition-all duration-200 ${
          scrolled
            ? 'border-ink-300/80 bg-paper/95 shadow-sm shadow-ink-900/5 backdrop-blur-xl'
            : 'border-transparent bg-paper/80 backdrop-blur-xl'
        }`}
      >
        <div
          className={`mx-auto flex max-w-screen-2xl items-center gap-4 px-4 transition-all duration-200 ${
            scrolled ? 'py-2' : 'py-3'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center transition hover:opacity-80">
            <Image
              src="/primeweb-logo.webp"
              alt="Primeweb"
              width={3733}
              height={575}
              priority
              className={`w-auto transition-all duration-200 ${scrolled ? 'h-[15px] sm:h-[17px]' : 'h-[17px] sm:h-[19px]'}`}
            />
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 md:hidden"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {mobileOpen ? (
                <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
              ) : (
                <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>
              )}
            </svg>
          </button>

          {/* Search — hidden on mobile, the mobile sheet has its own copy */}
          <SearchForm
            className="hidden flex-1 md:flex"
            initial={pathname === '/search' ? new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('q') ?? '' : ''}
            onSubmit={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
          />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 text-sm font-semibold md:flex">
            {NAV.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3.5 py-2 transition ${
                    active ? 'bg-prime-50 text-prime-700' : 'text-ink-700 hover:bg-ink-100 hover:text-ink-900'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {item.dot && (
                    <span className="absolute -top-0.5 right-2.5 flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flash-500 opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flash-500" />
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right cluster */}
          <div className="hidden items-center gap-2 md:flex">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Contacter sur WhatsApp"
              className="grid h-10 w-10 place-items-center rounded-full bg-mint-500 text-white transition hover:bg-mint-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.7L2 22l4.4-1.6A11 11 0 1 0 20.5 3.5Z"/></svg>
            </a>
            <ModeToggle />
            <CartButton />
          </div>

          {/* Mobile cart (always visible) */}
          <div className="md:hidden">
            <CartButton />
          </div>
        </div>

        {/* ── Mobile sheet ── */}
        {mobileOpen && (
          <div className="border-t border-ink-300/60 bg-paper md:hidden">
            <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-4">
              <SearchForm
                onSubmit={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
              />
              <nav className="flex flex-col text-sm font-semibold">
                {NAV.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 ${
                        active ? 'bg-prime-50 text-prime-700' : 'text-ink-900 hover:bg-ink-100'
                      }`}
                    >
                      {item.label}
                      <span className="text-ink-500">→</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="flex items-center justify-between">
                <ModeToggle />
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-mint-500 px-4 py-2 text-sm font-bold text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.6 17.7L2 22l4.4-1.6A11 11 0 1 0 20.5 3.5Z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function SearchForm({
  onSubmit,
  initial = '',
  className = '',
}: {
  onSubmit: (q: string) => void
  initial?: string
  className?: string
}) {
  const [q, setQ] = useState(initial)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const value = q.trim()
        if (value) onSubmit(value)
      }}
      className={`relative w-full max-w-xl ${className}`}
    >
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher du riz, savon, biscuits…"
        className="w-full rounded-full border border-ink-300/70 bg-paper-dim/70 py-2.5 pl-10 pr-24 text-sm font-medium text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:bg-paper focus:outline-none focus:ring-2 focus:ring-prime-200"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ('')}
          aria-label="Effacer"
          className="absolute right-20 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-500 hover:bg-ink-100"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12" /><path d="M18 6L6 18" />
          </svg>
        </button>
      )}
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink-900 px-4 py-1.5 text-xs font-bold text-paper transition hover:bg-prime-700"
      >
        Search
      </button>
    </form>
  )
}
