type DashboardUploadSectionProps = Readonly<{
  onUpload: () => void;
}>;

export function DashboardUploadSection({
  onUpload,
}: DashboardUploadSectionProps) {
  return (
    <section
      id="upload"
      aria-label="Upload"
      className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40 sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Upload resume
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Upload is not wired up yet — this is a visible empty state and CTA
            to confirm layout.
          </p>
        </div>
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
        >
          Choose file
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white/40 p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950/20 dark:text-gray-300">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          No resume uploaded yet
        </p>
        <p className="mt-1 leading-relaxed">
          When uploads are connected, your resumes will appear here.
        </p>
      </div>
    </section>
  );
}
