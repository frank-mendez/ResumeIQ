export function DashboardWelcomeCard() {
  return (
    <header className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            ResumeIQ
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back
          </h1>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Upload a resume to start getting clear, actionable feedback.
          </p>
        </div>
      </div>
    </header>
  );
}
