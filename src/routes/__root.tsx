/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { makeTitle, seo } from "~/utils/seo";

export const Route = createRootRoute({
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
    scripts: [
      {
        src: "/customScript.js",
        type: "text/javascript",
      },
    ],
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
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-gray-50/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                className="truncate text-base font-semibold tracking-tight text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-200"
              >
                ResumeIQ
              </Link>
              <span className="hidden text-sm text-gray-500 dark:text-gray-400 sm:inline">
                Resume feedback that’s clear and actionable
              </span>
            </div>

            <nav aria-label="Primary" className="flex items-center gap-1">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white/60 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-950/40 dark:hover:text-gray-100"
                activeProps={{
                  className:
                    "rounded-md px-3 py-2 text-sm font-semibold text-gray-900 bg-white/60 dark:text-gray-100 dark:bg-gray-950/40",
                }}
              >
                Home
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
