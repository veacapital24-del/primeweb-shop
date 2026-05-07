import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type CookieEntry = { name: string; value: string; options?: CookieOptions }

export async function serverClient() {
  const store = await cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (entries: CookieEntry[]) => {
        for (const { name, value, options } of entries) {
          try { store.set(name, value, options) } catch { /* read-only context */ }
        }
      },
    },
  })
}
