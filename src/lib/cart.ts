'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { CartLine } from '@/types/db'

const KEY = 'prime-cart-v1'
const MODE_KEY = 'prime-mode-v1'   // 'retail' | 'wholesale'
const SHOP_KEY = 'prime-shop-v1'

type Listener = () => void
const listeners = new Set<Listener>()

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const v = window.localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback }
  catch { return fallback }
}
function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  for (const l of listeners) l()
}

export function getCart(): CartLine[] { return read<CartLine[]>(KEY, []) }
export function getMode(): 'retail' | 'wholesale' { return read<'retail' | 'wholesale'>(MODE_KEY, 'retail') }
export function getShop(): string { return read<string>(SHOP_KEY, '') }

export function setMode(mode: 'retail' | 'wholesale') { write(MODE_KEY, mode) }
export function setShop(name: string) { write(SHOP_KEY, name) }

export function addToCart(productId: string, qty = 1) {
  const cart = getCart()
  const existing = cart.find((l) => l.product_id === productId)
  if (existing) existing.qty += qty
  else cart.push({ product_id: productId, qty })
  write(KEY, cart)
}

export function setQty(productId: string, qty: number) {
  const cart = getCart().filter((l) => (l.product_id !== productId) || qty > 0)
  const existing = cart.find((l) => l.product_id === productId)
  if (existing) existing.qty = qty
  else if (qty > 0) cart.push({ product_id: productId, qty })
  write(KEY, cart)
}

export function removeFromCart(productId: string) {
  write(KEY, getCart().filter((l) => l.product_id !== productId))
}

export function clearCart() { write(KEY, []) }

function subscribe(l: Listener) {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, () => JSON.stringify(getCart()), () => '[]')
  return JSON.parse(cart) as CartLine[]
}

export function useMode() {
  const [mode, set] = useState<'retail' | 'wholesale'>('retail')
  useEffect(() => {
    set(getMode())
    return subscribe(() => set(getMode()))
  }, [])
  return [mode, (m: 'retail' | 'wholesale') => setMode(m)] as const
}

export function useShop() {
  const [shop, set] = useState('')
  useEffect(() => {
    set(getShop())
    return subscribe(() => set(getShop()))
  }, [])
  return [shop, (s: string) => setShop(s)] as const
}
