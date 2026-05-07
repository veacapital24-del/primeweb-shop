export type ProductStock = {
  id: string
  sku: string
  slug: string
  name: string
  image_url: string | null
  retail_price_mur: number
  wholesale_price_mur: number | null
  wholesale_min_qty: number
  is_hard_discount: boolean
  available: number
  low_stock_threshold: number
}

export type Reel = {
  id: string
  slug: string
  platform: 'instagram' | 'tiktok' | 'facebook'
  external_url: string | null
  thumbnail_url: string | null
  caption: string | null
  posted_at: string | null
}

export type CartLine = { product_id: string; qty: number }
