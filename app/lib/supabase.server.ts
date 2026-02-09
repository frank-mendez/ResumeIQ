import { createServerClient } from '@supabase/ssr'
import type { Database } from '~/types/supabase'

export function createSupabaseServerClient(headers: Headers) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookieHeader = headers.get('cookie')
        if (!cookieHeader) return undefined
        
        const cookies = cookieHeader.split(';').map(c => c.trim())
        const cookie = cookies.find(c => c.startsWith(`${name}=`))
        
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
      },
      set() {
        // Server-side cookie setting handled by auth actions
      },
      remove() {
        // Server-side cookie removal handled by auth actions
      },
    },
  })
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createServerClient<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      get() { return undefined },
      set() {},
      remove() {},
    },
  })
}
