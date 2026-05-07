'use client'

import { useEffect } from 'react'

// Fires a 'view' event for the reel as soon as the landing page mounts.
export function ReelTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reelSlug: slug, eventType: 'view' }),
    }).catch(() => {})
  }, [slug])
  return null
}
