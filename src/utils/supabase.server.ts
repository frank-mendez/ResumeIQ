import { getCookies, setCookie } from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieToSet } from "~/types/supabase";

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY env vars. See SETUP.md for configuration.",
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }));
      },
      setAll(cookies: Array<CookieToSet>) {
        cookies.forEach((cookie: CookieToSet) => {
          setCookie(cookie.name, cookie.value, cookie.options);
        });
      },
    },
  });
}
