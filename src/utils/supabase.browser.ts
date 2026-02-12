import { createBrowserClient } from '@supabase/ssr'

let browserClient:
  | ReturnType<typeof createBrowserClient>
  | undefined

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY env vars. See SETUP.md for configuration.',
    )
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}
