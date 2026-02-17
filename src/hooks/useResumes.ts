import * as React from "react";
import type { ResumeListItem } from "~/types/resume";
import { loadUserResumes } from "~/services/resume.service";

export function useResumes(userId: string | undefined) {
  const [resumes, setResumes] = React.useState<Array<ResumeListItem>>([]);
  const [isLoadingResumes, setIsLoadingResumes] = React.useState(true);
  const [resumeLoadError, setResumeLoadError] = React.useState<string | null>(
    null,
  );

  const loadResumes = React.useCallback(
    async (options?: { isCancelled?: () => boolean }) => {
      const isCancelled = options?.isCancelled;
      const shouldSkipState = () => isCancelled?.() === true;

      if (!userId) {
        if (shouldSkipState()) {
          return;
        }

        setResumes([]);
        setIsLoadingResumes(false);
        return;
      }

      if (shouldSkipState()) {
        return;
      }

      setIsLoadingResumes(true);
      setResumeLoadError(null);

      try {
        const data = await loadUserResumes(userId);
        if (shouldSkipState()) {
          return;
        }

        setResumes(data);
      } catch (error) {
        if (shouldSkipState()) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load resumes right now.";
        setResumeLoadError(message);
        setResumes([]);
      } finally {
        if (!shouldSkipState()) {
          setIsLoadingResumes(false);
        }
      }
    },
    [userId],
  );

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await loadResumes({
        isCancelled: () => cancelled,
      });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadResumes]);

  return {
    resumes,
    isLoadingResumes,
    resumeLoadError,
    loadResumes,
  };
}
