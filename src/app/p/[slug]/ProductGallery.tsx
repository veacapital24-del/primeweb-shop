'use client'

import { useRef, useState } from 'react'

export function ProductGallery({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [origin, setOrigin] = useState('center center')
  const [zoomed, setZoomed] = useState(false)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div className="space-y-4">
      <div
        ref={wrapRef}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={onMove}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-paper-dim ring-1 ring-ink-300/60"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: zoomed ? 'scale(1.6)' : 'scale(1)',
              transformOrigin: origin,
            }}
          />
        )}
        {/* hover hint */}
        <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-paper/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-700 shadow-sm backdrop-blur transition-opacity duration-200" style={{ opacity: zoomed ? 0 : 1 }}>
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /><path d="M11 8v6M8 11h6" />
          </svg>
          Survoler pour zoomer
        </div>
      </div>
    </div>
  )
}
