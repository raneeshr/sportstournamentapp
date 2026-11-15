import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

/** Server-side client. Uses the anon key for public reads; pass useServiceRole for trusted server work. */
export function createServerClient(useServiceRole = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase server env vars')
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}
