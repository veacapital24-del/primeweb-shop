'use client'

import { useMode, useShop } from '@/lib/cart'

export function ModeToggle() {
  const [mode, setMode] = useMode()
  const [shop, setShop] = useShop()

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex rounded-full bg-ink-200/70 p-1 text-xs font-bold ring-1 ring-ink-300/60">
        <span
          className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-paper shadow-sm ring-1 ring-ink-300/60 transition-transform duration-300 ${
            mode === 'wholesale' ? 'translate-x-full' : 'translate-x-0'
          }`}
        />
        <button
          onClick={() => setMode('retail')}
          className={`relative z-10 rounded-full px-3.5 py-1.5 transition ${mode === 'retail' ? 'text-ink-900' : 'text-ink-500'}`}
        >
          Détail
        </button>
        <button
          onClick={() => setMode('wholesale')}
          className={`relative z-10 rounded-full px-3.5 py-1.5 transition ${mode === 'wholesale' ? 'text-prime-700' : 'text-ink-500'}`}
        >
          Gros
        </button>
      </div>
      {mode === 'wholesale' && (
        <input
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          placeholder="Tabagie…"
          className="hidden w-32 rounded-full border border-prime-200 bg-paper px-3 py-1.5 text-xs font-medium text-ink-900 placeholder:text-ink-500 focus:border-prime-500 focus:outline-none sm:inline-block"
        />
      )}
    </div>
  )
}
