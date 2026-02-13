export function DashboardSidebar() {
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-2xl border border-gray-200 bg-white/60 p-4 dark:border-gray-800 dark:bg-gray-950/40">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          Dashboard
        </p>
        <nav
          aria-label="Dashboard"
          className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          <a
            href="#overview"
            className="whitespace-nowrap rounded-md border border-gray-200 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
          >
            Overview
          </a>
          <a
            href="#upload"
            className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white/60 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-950/40 dark:hover:text-gray-100"
          >
            Upload
          </a>
        </nav>
        <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          This dashboard is UI-only for now.
        </p>
      </div>
    </aside>
  );
}
