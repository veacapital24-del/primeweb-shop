'use client'

import { useEffect } from 'react'
import { setMode } from '@/lib/cart'

// Reel landings are consumer-facing — make sure we present retail prices,
// even if the visitor previously toggled wholesale on the storefront.
export function ReelPageMode() {
  useEffect(() => { setMode('retail') }, [])
  return null
}
