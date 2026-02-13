import { Link, createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as React from "react";
import { makeTitle, seo } from "~/utils/seo";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";
import { requireDashboardAuth } from "~/utils/routeAuth";

type ResumeRecord = {
  id: string;
  original_filename: string;
  created_at: string | null;
};

type ResumeAnalysisRecord = {
  id: string;
  overall_score: number | null;
  created_at: string | null;
};

export const Route = createFileRoute("/dashboard/$resumeId")({
  beforeLoad: async ({ location }) => {
    await requireDashboardAuth({ location });
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

async function loadOwnedResume(
  supabase: SupabaseClient,
  resumeId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("resumes")
    .select("id, original_filename, created_at")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as ResumeRecord | null;
}

async function loadLatestAnalysisForResume(
  supabase: SupabaseClient,
  resumeId: string,
) {
  const { data: versions, error: versionsError } = await supabase
    .from("resume_versions")
    .select("id")
    .eq("resume_id", resumeId)
    .order("created_at", { ascending: false });

  if (versionsError) {
    throw versionsError;
  }

  const versionIds = ((versions ?? []) as Array<{ id: string }>).map(
    (version) => version.id,
  );

  if (versionIds.length === 0) {
    return null;
  }

  const { data: analyses, error: analysesError } = await supabase
    .from("resume_analyses")
    .select("id, overall_score, created_at")
    .in("resume_version_id", versionIds)
    .order("created_at", { ascending: false })
    .limit(1);

  if (analysesError) {
    throw analysesError;
  }

  return (analyses?.[0] ?? null) as ResumeAnalysisRecord | null;
}

function formatDate(value: string | null) {
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

function ResumeAnalysis() {
  const { user } = Route.useRouteContext();
  const { resumeId } = Route.useParams();

  const [resume, setResume] = React.useState<ResumeRecord | null>(null);
  const [analysis, setAnalysis] = React.useState<ResumeAnalysisRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadAnalysis = async () => {
      if (!user?.id) {
        if (!cancelled) {
          setErrorMessage("You must be signed in to view this analysis.");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const supabase = getSupabaseBrowserClient();

        const resumeData = await loadOwnedResume(supabase, resumeId, user.id);

        if (!resumeData) {
          if (!cancelled) {
            setResume(null);
            setAnalysis(null);
            setErrorMessage("Resume not found.");
          }
          return;
        }

        const latestAnalysis = await loadLatestAnalysisForResume(
          supabase,
          resumeId,
        );

        if (!cancelled) {
          setResume(resumeData);
          setAnalysis(latestAnalysis);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load analysis right now.";
          setErrorMessage(message);
          setResume(null);
          setAnalysis(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [resumeId, user?.id]);

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
            <div className="mt-6 rounded-xl border border-gray-200 bg-white/40 p-5 dark:border-gray-800 dark:bg-gray-950/20">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading analysis...
              </p>
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
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
                  Uploaded {formatDate(resume.created_at)}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Latest analysis status for this resume.
                </p>
              </div>

              {analysis ? (
                <div className="rounded-xl border border-gray-200 bg-white/60 p-5 dark:border-gray-800 dark:bg-gray-950/20">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Last analyzed {formatDate(analysis.created_at)}
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
