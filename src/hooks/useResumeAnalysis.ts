import * as React from "react";
import type { ResumeAnalysisRecord, ResumeRecord } from "~/types/resume";
import {
  loadLatestAnalysisForResume,
  loadOwnedResume,
} from "~/services/resume.service";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

export function useResumeAnalysis(options: {
  resumeId: string;
  userId: string | undefined;
}) {
  const [resume, setResume] = React.useState<ResumeRecord | null>(null);
  const [analysis, setAnalysis] = React.useState<ResumeAnalysisRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadAnalysis = async () => {
      if (!options.userId) {
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

        const resumeData = await loadOwnedResume(
          supabase,
          options.resumeId,
          options.userId,
        );

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
          options.resumeId,
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
  }, [options.resumeId, options.userId]);

  return {
    resume,
    analysis,
    isLoading,
    errorMessage,
  };
}
