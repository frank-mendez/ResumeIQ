import type { AuthProviderType } from "~/types/auth";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

export async function startOAuthSignIn(options: {
  provider: AuthProviderType;
  redirectTo: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: options.provider,
    options: {
      redirectTo: options.redirectTo,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}
