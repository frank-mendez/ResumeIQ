import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GetSessionResult,
  SessionRetryOptions,
} from "~/types/authSession";

const DEFAULT_SESSION_RETRY_ATTEMPTS = 6;
const DEFAULT_SESSION_RETRY_DELAY_MS = 120;

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function getSessionWithRetry(
  supabase: SupabaseClient,
  options: SessionRetryOptions = {},
): Promise<GetSessionResult> {
  const attempts = options.attempts ?? DEFAULT_SESSION_RETRY_ATTEMPTS;
  const delayMs = options.delayMs ?? DEFAULT_SESSION_RETRY_DELAY_MS;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const response = await supabase.auth.getSession();

    if (response.error || response.data.session) {
      return response;
    }

    await wait(delayMs);
  }

  return supabase.auth.getSession();
}

export async function hasSessionUser(
  supabase: SupabaseClient,
  options: SessionRetryOptions = {},
): Promise<boolean> {
  const { data } = await getSessionWithRetry(supabase, options);
  return Boolean(data.session?.user);
}
