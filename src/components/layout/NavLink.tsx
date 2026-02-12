import { Link } from "@tanstack/react-router";

type NavLinkProps = {
  to: string;
  label: string;
  exact?: boolean;
};

export function NavLink({ to, label, exact }: NavLinkProps) {
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
