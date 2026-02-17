import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SupabaseAuthKeyEnum,
  SupabaseAuthMethodKeyEnum,
} from "~/enums/supabase";

export type GetSessionResult = Awaited<
  ReturnType<
    SupabaseClient[SupabaseAuthKeyEnum.AUTH][SupabaseAuthMethodKeyEnum.GET_SESSION]
  >
>;

export type SessionRetryOptions = {
  attempts?: number;
  delayMs?: number;
};
