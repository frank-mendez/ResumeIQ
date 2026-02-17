import { getCookies, setCookie } from "@tanstack/react-start/server";
import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptions,
} from "@supabase/ssr";

const createServerClientWithCookieMethods = createServerClient as (
  supabaseUrl: string,
  supabaseKey: string,
  options: {
    cookieEncoding?: "raw" | "base64url";
    cookieOptions?: { name?: string } & CookieOptions;
    cookies: CookieMethodsServer;
  },
) => ReturnType<typeof createServerClient>;

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY env vars. See SETUP.md for configuration.",
    );
  }

  const cookies: CookieMethodsServer = {
    getAll() {
      return Object.entries(getCookies()).map(([name, value]) => ({
        name,
        value,
      }));
    },
    setAll(
      cookiesToSet: Array<{
        name: string;
        value: string;
        options: CookieOptions;
      }>,
    ) {
      cookiesToSet.forEach((cookie) => {
        setCookie(cookie.name, cookie.value, cookie.options);
      });
    },
  };

  return createServerClientWithCookieMethods(supabaseUrl, supabaseAnonKey, {
    cookies,
  });
}
