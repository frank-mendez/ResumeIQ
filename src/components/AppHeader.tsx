import { Link, useRouteContext, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { logoutServer } from "~/utils/auth.server";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

export function AppHeader() {
  const { user } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = React.useCallback(async () => {
    setIsSigningOut(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      await logoutServer();
      await router.invalidate();
      await router.navigate({ to: "/login" });
    } finally {
      setIsSigningOut(false);
    }
  }, [router]);

  return (
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
          <NavLink to="/" label="Home" exact />
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white/60 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-70 dark:text-gray-300 dark:hover:bg-gray-950/40 dark:hover:text-gray-100"
            >
              {isSigningOut ? "Signing out..." : "Log out"}
            </button>
          ) : (
            <NavLink to="/login" label="Login" />
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  to,
  label,
  exact,
}: {
  to: string;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: Boolean(exact) }}
      className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white/60 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-950/40 dark:hover:text-gray-100"
      activeProps={{
        className:
          "rounded-md px-3 py-2 text-sm font-semibold text-gray-900 bg-white/60 dark:text-gray-100 dark:bg-gray-950/40",
      }}
    >
      {label}
    </Link>
  );
}
