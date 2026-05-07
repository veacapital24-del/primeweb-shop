'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'

export function CartButton() {
  const cart = useCart()
  const count = cart.reduce((s, l) => s + l.qty, 0)

  return (
    <Link
      href="/cart"
      className="group relative inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-paper transition hover:-translate-y-0.5 hover:bg-prime-600"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
        <circle cx="9"  cy="20" r="1.6" />
        <circle cx="18" cy="20" r="1.6" />
      </svg>
      <span className="hidden sm:inline">Panier</span>
      <span className="grid min-w-[1.4rem] place-items-center rounded-full bg-prime-500 px-1.5 py-0.5 text-[11px] font-black text-white transition group-hover:bg-paper group-hover:text-prime-700">
        {count}
      </span>
    </Link>
  )
}
