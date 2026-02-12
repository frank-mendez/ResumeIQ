import { createFileRoute, redirect } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { GitHubIcon } from "~/assets/icons/GitHubIcon";
import { GoogleIcon } from "~/assets/icons/GoogleIcon";
import { SpinnerIcon } from "~/assets/icons/SpinnerIcon";
import { AuthProviderEnum, AuthProviderType } from "~/types/auth";
import { toSafeRedirectPath } from "~/utils/redirect";
import { makeTitle, seo } from "~/utils/seo";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

const searchSchema = z.object({
  error: z.string().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ context, search }) => {
    if (context.user) {
      const redirectTo = toSafeRedirectPath(search.redirect);
      throw redirect({
        to: redirectTo,
      });
    }
  },
  head: () => ({
    meta: [
      ...seo({
        title: makeTitle("Log in"),
        description: "Log in to ResumeIQ.",
      }),
    ],
  }),
  component: Login,
});

function Login() {
  const { error: routeError, redirect } = Route.useSearch();
  const [loadingProvider, setLoadingProvider] =
    React.useState<AuthProviderType | null>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [dismissedRouteError, setDismissedRouteError] = React.useState(false);

  const decodedRouteError = React.useMemo(() => {
    if (!routeError) return null;
    try {
      return decodeURIComponent(routeError);
    } catch {
      return routeError;
    }
  }, [routeError]);

  const errorMessage =
    localError ?? (!dismissedRouteError ? decodedRouteError : null);

  const safeRedirectPath = React.useMemo(
    () => toSafeRedirectPath(redirect),
    [redirect],
  );

  const startOAuth = React.useCallback(
    async (provider: AuthProviderType) => {
      setLocalError(null);
      setLoadingProvider(provider);

      try {
        const supabase = getSupabaseBrowserClient();

        const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
          safeRedirectPath,
        )}`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
          },
        });

        if (error) {
          setLocalError(error.message);
          setLoadingProvider(null);
        }
        // On success, Supabase redirects the browser away from this page.
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "Failed to start OAuth",
        );
        setLoadingProvider(null);
      }
    },
    [safeRedirectPath],
  );

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40 sm:p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                ResumeIQ
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Continue with an OAuth provider.
              </p>
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="leading-relaxed">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalError(null);
                      setDismissedRouteError(true);
                    }}
                    className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-rose-900/80 hover:bg-rose-100 dark:text-rose-100/80 dark:hover:bg-rose-950"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              <OAuthButton
                provider={AuthProviderEnum.GOOGLE}
                label="Continue with Google"
                loading={loadingProvider === AuthProviderEnum.GOOGLE}
                disabled={loadingProvider !== null}
                onClick={() => startOAuth(AuthProviderEnum.GOOGLE)}
              />
              <OAuthButton
                provider={AuthProviderEnum.GITHUB}
                label="Continue with GitHub"
                loading={loadingProvider === AuthProviderEnum.GITHUB}
                disabled={loadingProvider !== null}
                onClick={() => startOAuth(AuthProviderEnum.GITHUB)}
              />
            </div>

            <p className="mt-6 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              You’ll be redirected to your provider to finish signing in.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function OAuthButton({
  provider,
  label,
  loading,
  disabled,
  onClick,
}: {
  provider: AuthProviderType;
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
    >
      {loading ? (
        <SpinnerIcon ariaLabel={`Loading ${provider}`} />
      ) : provider === "google" ? (
        <GoogleIcon aria-hidden="true" className="h-5 w-5" />
      ) : (
        <GitHubIcon aria-hidden="true" className="h-5 w-5" />
      )}
      <span>{loading ? "Working…" : label}</span>
    </button>
  );
}
