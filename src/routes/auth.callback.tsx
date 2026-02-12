import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { SpinnerIcon } from "~/assets/icons/SpinnerIcon";
import { getSessionWithRetry } from "~/utils/authSession";
import { toSafeRedirectPath } from "~/utils/redirect";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

const searchSchema = z.object({
  code: z.string().optional(),
  redirect: z.string().optional(),
  error: z.string().optional(),
  error_code: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search) => searchSchema.parse(search),
  component: AuthCallback,
});

function toOptionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function decodeOrRaw(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function AuthCallback() {
  const search = Route.useSearch();
  const router = useRouter();
  const redirectPath = React.useMemo(
    () => toSafeRedirectPath(search.redirect),
    [search.redirect],
  );

  const [status, setStatus] = React.useState<"working" | "error" | "done">(
    "working",
  );
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabase = getSupabaseBrowserClient();

        // If the provider redirected back with an error, surface it.
        if (search.error || search.error_description) {
          const desc = search.error_description
            ? decodeOrRaw(search.error_description)
            : undefined;

          if (!cancelled) {
            setStatus("error");
            setMessage(desc || search.error || "OAuth sign-in failed");
          }
          return;
        }

        // In OAuth code flow, exchange the code in the callback URL for a persisted session.
        const code =
          search.code ?? new URL(window.location.href).searchParams.get("code");

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            if (!cancelled) {
              setStatus("error");
              setMessage(exchangeError.message);
            }
            return;
          }
        }

        const { data, error } = await getSessionWithRetry(supabase);

        if (error) {
          if (!cancelled) {
            setStatus("error");
            setMessage(error.message);
          }
          return;
        }

        if (!data.session) {
          if (!cancelled) {
            setStatus("error");
            setMessage("No session found after OAuth redirect.");
          }
          return;
        }

        const user = data.session.user;
        const fullName = toOptionalString(user.user_metadata?.full_name);
        const avatarUrl = toOptionalString(user.user_metadata?.avatar_url);

        const profilePayload: {
          id: string;
          full_name?: string;
          avatar_url?: string;
        } = {
          id: user.id,
        };

        if (fullName !== null) {
          profilePayload.full_name = fullName;
        }

        if (avatarUrl !== null) {
          profilePayload.avatar_url = avatarUrl;
        }

        const { error: profileError } = await (
          supabase.from("profiles") as unknown as {
            upsert: (
              values: Record<string, unknown>,
              options: { onConflict: string },
            ) => Promise<{ error: { message: string } | null }>;
          }
        ).upsert(profilePayload as Record<string, unknown>, {
          onConflict: "id",
        });

        if (profileError) {
          console.error("Profile upsert error", profileError);
        }

        if (cancelled) return;
        setStatus("done");

        await router.invalidate();
        await router.navigate({ to: redirectPath, replace: true });
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            err instanceof Error ? err.message : "Failed to complete OAuth",
          );
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [redirectPath, router, search.error, search.error_description]);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40 sm:p-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                ResumeIQ
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                {status === "error" ? "Sign-in failed" : "Signing you in…"}
              </h1>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {status === "error"
                  ? "Please try again."
                  : "Completing authentication."}
              </p>
            </div>

            {status === "error" ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
              >
                <p className="leading-relaxed">
                  {message ?? "OAuth sign-in failed."}
                </p>
                <p className="mt-3 text-xs text-rose-900/80 dark:text-rose-100/80">
                  <Link
                    to="/login"
                    search={{ redirect: redirectPath }}
                    className="font-semibold underline underline-offset-2"
                  >
                    Back to login
                  </Link>
                </p>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <SpinnerIcon ariaLabel="Completing sign-in" />
                <span>Working…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
