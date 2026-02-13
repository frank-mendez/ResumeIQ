type QuickActionsCardProps = Readonly<{
  onUpload: () => void;
}>;

export function QuickActionsCard({ onUpload }: QuickActionsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
      <h2 className="text-lg font-semibold tracking-tight">Quick start</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        Start by uploading a resume, then refine section by section.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-50 dark:bg-gray-50 dark:text-gray-900"
        >
          Upload Resume
        </button>
        <a
          href="/#how-it-works"
          className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
        >
          How it works
        </a>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        Upload is UI-only right now.
      </p>
    </div>
  );
}
