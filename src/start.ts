import { createMiddleware, createStart } from "@tanstack/react-start";
import { getSupabaseServerClient } from "~/utils/supabase.server";

const dashboardAuthMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const isDashboard =
      pathname === "/dashboard" || pathname.startsWith("/dashboard/");

    if (!isDashboard) {
      return next();
    }

    const supabase = getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      const redirectPath = pathname + url.search;
      const location = `/login?redirect=${encodeURIComponent(redirectPath)}`;
      throw new Response(null, {
        status: 302,
        headers: {
          Location: location,
        },
      });
    }

    return next();
  },
);

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [dashboardAuthMiddleware],
  };
});
