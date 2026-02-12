import { createClient } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createClient> | undefined;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY env vars. See SETUP.md for configuration.",
    );
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
