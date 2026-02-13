/// <reference types="vite/client" />
import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { AppHeader } from "~/components/layout/AppHeader";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import { getSessionWithRetry } from "~/utils/authSession";
import { makeTitle, seo } from "~/utils/seo";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (globalThis.window === undefined) {
      return { user: null };
    }

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await getSessionWithRetry(supabase);

    if (error) {
      console.error("Failed to load auth session", error);
      return { user: null };
    }

    const sessionUser = data.session?.user ?? null;
    const user = sessionUser
      ? {
          id: sessionUser.id,
          email: sessionUser.email ?? null,
        }
      : null;

    return { user };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: makeTitle(),
        description:
          "ResumeIQ helps you refine resumes with clear, actionable feedback.",
      }),
    ],
    links: [],
    scripts: [],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <AppHeader />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
