import { redirect } from "@tanstack/react-router";
import { hasSessionUser } from "~/utils/authSession";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

type RouteLocationLike = {
  pathname: string;
  search: unknown;
};

type RequireDashboardAuthOptions = {
  location: RouteLocationLike;
  hasKnownUser?: boolean;
};

export async function requireDashboardAuth({
  location,
  hasKnownUser = false,
}: RequireDashboardAuthOptions) {
  if (globalThis.window === undefined || hasKnownUser) {
    return;
  }

  const supabase = getSupabaseBrowserClient();
  const isAuthenticated = await hasSessionUser(supabase);

  if (isAuthenticated) {
    return;
  }

  const searchPart = typeof location.search === "string" ? location.search : "";

  throw redirect({
    to: "/login",
    search: {
      redirect: `${location.pathname}${searchPart}`,
    },
  });
}
