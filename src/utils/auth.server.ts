import { createServerFn } from "@tanstack/react-start";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { getSupabaseServerClient } from "~/utils/supabase.server";

function clearSupabaseAuthCookies() {
  const cookies = getCookies();

  Object.keys(cookies)
    .filter((cookieName) => cookieName.startsWith("sb-"))
    .forEach((cookieName) => {
      setCookie(cookieName, "", {
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
    });
}

export const logoutServer = createServerFn({ method: "POST" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    clearSupabaseAuthCookies();

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  },
);
