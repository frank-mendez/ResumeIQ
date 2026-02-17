import { Link, createFileRoute } from "@tanstack/react-router";
import { useResumeAnalysis } from "~/hooks/useResumeAnalysis";
import { makeTitle, seo } from "~/utils/seo";
import { formatDisplayDate } from "~/utils/date";
import { requireDashboardAuth } from "~/utils/routeAuth";

export const Route = createFileRoute("/dashboard/$resumeId")({
  beforeLoad: async ({ location, context }) => {
    await requireDashboardAuth({
      location,
      hasKnownUser: Boolean(context.user),
    });
  },
  head: () => ({
    meta: [
      ...seo({
        title: makeTitle("Resume analysis"),
        description: "Review analysis results for an uploaded resume.",
      }),
    ],
  }),
  component: ResumeAnalysis,
});

function ResumeAnalysis() {
  const { user } = Route.useRouteContext();
  const { resumeId } = Route.useParams();
  const { resume, analysis, isLoading, errorMessage } = useResumeAnalysis({
    resumeId,
    userId: user?.id,
  });

  return (
    <main>
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Resume analysis
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {resume?.original_filename ?? "Analysis"}
              </h1>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
            >
              Back to dashboard
            </Link>
          </div>

          {isLoading ? (
            <div
              className="mt-6 rounded-xl border border-gray-200 bg-white/40 p-5 dark:border-gray-800 dark:bg-gray-950/20"
              aria-live="polite"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading analysis...
              </p>
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div
              className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/50 dark:bg-rose-950/20"
              role="alert"
            >
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                Analysis unavailable
              </p>
              <p className="mt-1 text-sm text-rose-800 dark:text-rose-300">
                {errorMessage}
              </p>
            </div>
          ) : null}

          {!isLoading && !errorMessage && resume ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white/60 p-5 dark:border-gray-800 dark:bg-gray-950/20">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Uploaded {formatDisplayDate(resume.created_at)}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Latest analysis status for this resume.
                </p>
              </div>

              {analysis ? (
                <div className="rounded-xl border border-gray-200 bg-white/60 p-5 dark:border-gray-800 dark:bg-gray-950/20">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Last analyzed {formatDisplayDate(analysis.created_at)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Overall score: {analysis.overall_score ?? "Not scored"}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white/40 p-5 dark:border-gray-700 dark:bg-gray-950/20">
                  <p className="text-sm font-semibold">No analysis yet</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    This resume has been uploaded, but analysis is not available
                    yet.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
