import * as React from "react";

type DashboardWelcomeCardProps = Readonly<{
  pickedFileName: string | null;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}>;

export function DashboardWelcomeCard({
  pickedFileName,
  onUpload,
  fileInputRef,
  onFileChange,
}: DashboardWelcomeCardProps) {
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

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-50 dark:bg-gray-50 dark:text-gray-900"
          >
            Upload Resume
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={onFileChange}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {pickedFileName
              ? `Selected: ${pickedFileName}`
              : "PDF or Word (.doc/.docx)"}
          </p>
        </div>
      </div>
    </header>
  );
}
