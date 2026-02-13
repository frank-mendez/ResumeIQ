import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { makeTitle, seo } from "~/utils/seo";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";
import { requireDashboardAuth } from "~/utils/routeAuth";

type ResumeListItem = {
  id: string;
  original_filename: string;
  created_at: string | null;
};

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context, location }) => {
    await requireDashboardAuth({
      location,
      hasKnownUser: Boolean(context.user),
    });
  },
  head: () => ({
    meta: [
      ...seo({
        title: makeTitle("Dashboard"),
        description: "Your ResumeIQ dashboard.",
      }),
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const [pickedFileName, setPickedFileName] = React.useState<string | null>(
    null,
  );
  const [resumes, setResumes] = React.useState<Array<ResumeListItem>>([]);
  const [isLoadingResumes, setIsLoadingResumes] = React.useState(true);
  const [resumeLoadError, setResumeLoadError] = React.useState<string | null>(
    null,
  );
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const openPicker = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadResumes = async () => {
      if (!user?.id) {
        if (!cancelled) {
          setResumes([]);
          setIsLoadingResumes(false);
        }
        return;
      }

      setIsLoadingResumes(true);
      setResumeLoadError(null);

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("resumes")
          .select("id, original_filename, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setResumes((data ?? []) as Array<ResumeListItem>);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load resumes right now.";
          setResumeLoadError(message);
          setResumes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingResumes(false);
        }
      }
    };

    loadResumes();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
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

          <div className="min-w-0 space-y-6">
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
                    onClick={openPicker}
                    className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-50 dark:bg-gray-50 dark:text-gray-900"
                  >
                    Upload Resume
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0] ?? null;
                      setPickedFileName(file ? file.name : null);
                      // Allow re-picking the same file.
                      event.currentTarget.value = "";
                    }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {pickedFileName
                      ? `Selected: ${pickedFileName}`
                      : "PDF or Word (.doc/.docx)"}
                  </p>
                </div>
              </div>
            </header>

            <section
              id="overview"
              aria-label="Overview"
              className="grid gap-4 lg:grid-cols-2"
            >
              <ResumeListCard
                resumes={resumes}
                isLoading={isLoadingResumes}
                loadError={resumeLoadError}
              />
              <QuickActionsCard onUpload={openPicker} />
            </section>

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
                    Upload is not wired up yet — this is a visible empty state
                    and CTA to confirm layout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openPicker}
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
          </div>
        </div>
      </div>
    </main>
  );
}

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

function ResumeListCard({
  resumes,
  isLoading,
  loadError,
}: Readonly<{
  resumes: Array<ResumeListItem>;
  isLoading: boolean;
  loadError: string | null;
}>) {
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
              <a
                href={`/dashboard/${resume.id}`}
                className="block rounded-xl border border-gray-200 bg-white/70 p-4 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:hover:bg-gray-950"
              >
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {resume.original_filename}
                </p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Uploaded {formatUploadDate(resume.created_at)}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function QuickActionsCard({ onUpload }: Readonly<{ onUpload: () => void }>) {
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
