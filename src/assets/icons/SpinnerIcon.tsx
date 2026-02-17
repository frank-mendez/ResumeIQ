import type { SpinnerIconProps } from "~/types/components";

export function SpinnerIcon({
  ariaLabel,
  className,
}: Readonly<SpinnerIconProps>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={
        className ?? "h-5 w-5 animate-spin text-gray-700 dark:text-gray-200"
      }
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.2"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
