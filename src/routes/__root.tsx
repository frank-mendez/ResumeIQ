/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { AppHeader } from "~/components/layout/AppHeader";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { getSessionWithRetry } from "~/utils/authSession";
import { makeTitle, seo } from "~/utils/seo";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (typeof window === "undefined") {
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
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <AppHeader />
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
