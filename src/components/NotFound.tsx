import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type NotFoundProps = Readonly<{
  children?: ReactNode;
}>;

export function NotFound({ children }: NotFoundProps) {
  return (
    <main className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40 sm:p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                404
              </p>
              <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Page not found
              </h1>
              <div className="text-pretty text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
                {children || (
                  <p>
                    The page you’re looking for doesn’t exist or may have moved.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => globalThis.history.back()}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white/60 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
              >
                Go back
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-50 dark:bg-gray-50 dark:text-gray-900"
              >
                Return home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
