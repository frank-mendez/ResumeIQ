import { Link, useRouteContext, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";
import { NavLink } from "~/components/layout/NavLink";

export function AppHeader() {
  const { user } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [signOutError, setSignOutError] = React.useState<string | null>(null);

  const handleSignOut = React.useCallback(async () => {
    setIsSigningOut(true);
    setSignOutError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Browser sign-out error", error);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setSignOutError("Sign-out failed. Please try again.");
          return;
        }
      }

      await router.invalidate();
      await router.navigate({ to: "/login", replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not complete sign-out. Please try again.";
      setSignOutError(message);
      console.error("Unexpected sign-out error", error);
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
          {signOutError ? (
            <span
              role="alert"
              className="mr-2 text-xs text-rose-700 dark:text-rose-300"
            >
              {signOutError}
            </span>
          ) : null}
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
