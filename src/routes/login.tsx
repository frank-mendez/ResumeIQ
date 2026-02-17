import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { OAuthButton } from "~/components/auth/OAuthButton";
import { AuthProviderEnum } from "~/enums/auth";
import { useOAuthLogin } from "~/hooks/useOAuthLogin";
import { redirectAuthenticatedFromLogin } from "~/utils/routeAuth";
import { makeTitle, seo } from "~/utils/seo";

const searchSchema = z.object({
  error: z.string().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: async ({ context, search }) => {
    await redirectAuthenticatedFromLogin({
      redirectPath: search.redirect,
      hasKnownUser: Boolean(context.user),
    });
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
  const { error: routeError, redirect: redirectParam } = Route.useSearch();
  const { loadingProvider, errorMessage, startOAuth, dismissError } =
    useOAuthLogin({
      routeError,
      redirectParam,
    });

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
                    onClick={dismissError}
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
