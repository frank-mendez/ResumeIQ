import * as React from "react";
import { GitHubIcon } from "~/assets/icons/GitHubIcon";
import { GoogleIcon } from "~/assets/icons/GoogleIcon";
import { SpinnerIcon } from "~/assets/icons/SpinnerIcon";
import { AuthProviderEnum } from "~/enums/auth";
import type { OAuthButtonProps } from "~/types/components";
import type { AuthProviderType } from "~/types/auth";

const providerIcons: Record<
  AuthProviderType,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  [AuthProviderEnum.GOOGLE]: GoogleIcon,
  [AuthProviderEnum.GITHUB]: GitHubIcon,
};

export function OAuthButton({
  provider,
  label,
  loading,
  disabled,
  onClick,
}: OAuthButtonProps) {
  const ProviderIcon = providerIcons[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
    >
      {loading ? (
        <SpinnerIcon ariaLabel={`Loading ${provider}`} />
      ) : (
        <ProviderIcon aria-hidden="true" className="h-5 w-5" />
      )}
      <span>{loading ? "Working…" : label}</span>
    </button>
  );
}
