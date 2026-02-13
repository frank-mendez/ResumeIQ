import { Link } from "@tanstack/react-router";
import type { ResumeListItem } from "~/components/dashboard/types";

type ResumeListCardProps = Readonly<{
  resumes: Array<ResumeListItem>;
  isLoading: boolean;
  loadError: string | null;
}>;

function formatUploadDate(value: string | null) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function ResumeListCard({
  resumes,
  isLoading,
  loadError,
}: ResumeListCardProps) {
  const isEmpty = !isLoading && !loadError && resumes.length === 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Your resumes</h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Keep versions organized and iterate without losing your best lines.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
          {isLoading ? "Loading" : resumes.length}
        </span>
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-xl border border-gray-200 bg-white/40 p-5 dark:border-gray-800 dark:bg-gray-950/20">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading your resumes...
          </p>
        </div>
      ) : null}

      {!isLoading && loadError ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
            Could not load resumes
          </p>
          <p className="mt-1 text-sm text-rose-800 dark:text-rose-300">
            {loadError}
          </p>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-white/40 p-5 dark:border-gray-700 dark:bg-gray-950/20">
          <p className="text-sm font-semibold">No resumes yet</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload your first resume to start receiving feedback.
          </p>
        </div>
      ) : null}

      {!isLoading && !loadError && resumes.length > 0 ? (
        <ul className="mt-5 space-y-2" aria-label="Uploaded resumes">
          {resumes.map((resume) => (
            <li key={resume.id}>
              <Link
                to="/dashboard/$resumeId"
                params={{ resumeId: resume.id }}
                className="block rounded-xl border border-gray-200 bg-white/70 p-4 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:hover:bg-gray-950"
              >
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {resume.original_filename}
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Uploaded {formatUploadDate(resume.created_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
