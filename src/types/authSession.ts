import type { SupabaseClient } from "@supabase/supabase-js";

export type GetSessionResult = Awaited<
  ReturnType<SupabaseClient["auth"]["getSession"]>
>;

export type SessionRetryOptions = {
  attempts?: number;
  delayMs?: number;
};
