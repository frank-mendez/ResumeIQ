import { getCookies, setCookie } from '@tanstack/react-start/server'
import { createServerClient } from '@supabase/ssr'

type SupabaseServerClient = ReturnType<typeof createServerClient>
type SupabaseCookie = { name: string; value: string }

export function getSupabaseServerClient(): SupabaseServerClient {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): SupabaseCookie[] {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }))
        },
        setAll(cookies: SupabaseCookie[]) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value)
          })
        },
      },
    },
  )
}
