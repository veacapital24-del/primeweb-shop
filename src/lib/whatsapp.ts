// Build a wa.me deep-link with a pre-filled order message.
// This is the MVP path — works without Cloud API, just opens WhatsApp on tap.

import { mur } from './format'
import type { ProductStock, CartLine } from '@/types/db'

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE ?? '23057000000'

type BuildArgs = {
  cart: CartLine[]
  products: ProductStock[]
  isWholesale: boolean
  reelSlug?: string
  shopName?: string
}

export function buildOrderMessage({ cart, products, isWholesale, reelSlug, shopName }: BuildArgs) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const lines: string[] = []
  lines.push(`Bonjour Primeweb — ${isWholesale ? 'commande gros (tabagie)' : 'commande'} svp:`)
  if (shopName) lines.push(`Magasin: ${shopName}`)
  if (reelSlug) lines.push(`Source: reel/${reelSlug}`)
  lines.push('')

  let total = 0
  for (const line of cart) {
    const p = byId.get(line.product_id)
    if (!p) continue
    const unit = isWholesale && p.wholesale_price_mur != null ? p.wholesale_price_mur : p.retail_price_mur
    const lineTotal = unit * line.qty
    total += lineTotal
    lines.push(`• ${line.qty}× ${p.name} — ${mur(unit)} = ${mur(lineTotal)}`)
  }
  lines.push('')
  lines.push(`Total: ${mur(total)}`)
  lines.push('')
  lines.push('Merci 🙏')

  return lines.join('\n')
}

export function whatsappLink(message: string, phone: string = PHONE) {
  const text = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${text}`
}
