import 'server-only'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Service-role client — bypasses RLS. Only ever import in route handlers
// or server actions. The 'server-only' import will fail the build if a
// client component pulls this in by accident.
export function adminClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
