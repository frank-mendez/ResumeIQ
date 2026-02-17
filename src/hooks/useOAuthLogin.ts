import * as React from "react";
import type { AuthProviderType } from "~/types/auth";
import { toSafeRedirectPath } from "~/utils/redirect";
import { startOAuthSignIn } from "~/services/auth.service";

export function useOAuthLogin(options: {
  routeError?: string;
  redirectParam?: string;
}) {
  const [loadingProvider, setLoadingProvider] =
    React.useState<AuthProviderType | null>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [dismissedRouteError, setDismissedRouteError] = React.useState(false);

  const decodedRouteError = React.useMemo(() => {
    if (!options.routeError) {
      return null;
    }

    try {
      return decodeURIComponent(options.routeError);
    } catch {
      return options.routeError;
    }
  }, [options.routeError]);

  const errorMessage =
    localError ?? (dismissedRouteError ? null : decodedRouteError);

  const safeRedirectPath = React.useMemo(
    () => toSafeRedirectPath(options.redirectParam),
    [options.redirectParam],
  );

  const redirectTo = `${globalThis.location.origin}/auth/callback?redirect=${encodeURIComponent(
    safeRedirectPath,
  )}`;

  const dismissError = React.useCallback(() => {
    setLocalError(null);
    setDismissedRouteError(true);
  }, []);

  const startOAuth = React.useCallback(
    async (provider: AuthProviderType) => {
      setLocalError(null);
      setLoadingProvider(provider);

      try {
        await startOAuthSignIn({
          provider,
          redirectTo,
        });
      } catch (error) {
        setLocalError(
          error instanceof Error ? error.message : "Failed to start OAuth",
        );
        setLoadingProvider(null);
      }
    },
    [redirectTo],
  );

  return {
    loadingProvider,
    errorMessage,
    startOAuth,
    dismissError,
  };
}
