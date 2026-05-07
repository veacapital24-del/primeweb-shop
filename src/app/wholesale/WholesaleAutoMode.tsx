'use client'

import { useEffect } from 'react'
import { setMode } from '@/lib/cart'

// Visiting /wholesale auto-flips the mode to wholesale.
// Returning to / does not flip back — buyers stay in B2B mode until they toggle off.
export function WholesaleAutoMode() {
  useEffect(() => { setMode('wholesale') }, [])
  return null
}
