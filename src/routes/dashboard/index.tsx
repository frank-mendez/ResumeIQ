import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { DashboardSidebar } from "~/components/dashboard/DashboardSidebar";
import { DashboardUploadSection } from "~/components/dashboard/DashboardUploadSection";
import { DashboardWelcomeCard } from "~/components/dashboard/DashboardWelcomeCard";
import { QuickActionsCard } from "~/components/dashboard/QuickActionsCard";
import { ResumeListCard } from "~/components/dashboard/ResumeListCard";
import type { ResumeListItem } from "~/components/dashboard/types";
import { makeTitle, seo } from "~/utils/seo";
import {
  insertResumeMetadataWithSession,
  getResumeTitle,
  getResumeUploadMaxBytes,
  mapMimeTypeToResumeFileType,
  normalizeOriginalFilename,
  sanitizeStorageFilename,
  uploadFileToSupabaseStorageWithProgress,
  validateResumeFile,
} from "~/utils/resumeUpload";
import { requireDashboardAuth } from "~/utils/routeAuth";
import {
  getSupabaseBrowserClient,
  getSupabaseBrowserConfig,
} from "~/utils/supabase.browser";

export const Route = createFileRoute("/dashboard/")({
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

function getUploadPrecheckError({
  isUploading,
  userId,
  selectedFile,
  maxUploadBytes,
}: {
  isUploading: boolean;
  userId: string | undefined;
  selectedFile: File | null;
  maxUploadBytes: number;
}) {
  if (isUploading) {
    return null;
  }

  if (!userId) {
    return "Your session has expired. Please sign in again.";
  }

  if (!selectedFile) {
    return "Choose a resume file before uploading.";
  }

  const validation = validateResumeFile(selectedFile, maxUploadBytes);
  if (!validation.valid) {
    return validation.error;
  }

  if (!mapMimeTypeToResumeFileType(selectedFile.type)) {
    return "Only PDF and DOCX files are supported.";
  }

  return null;
}

function toUploadErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Upload canceled.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Upload failed. Please try again.";
}

function Dashboard() {
  const { user } = Route.useRouteContext();
  const navigate = Route.useNavigate();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadState, setUploadState] = React.useState<
    "idle" | "uploading" | "success" | "failed"
  >("idle");
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [resumes, setResumes] = React.useState<Array<ResumeListItem>>([]);
  const [isLoadingResumes, setIsLoadingResumes] = React.useState(true);
  const [resumeLoadError, setResumeLoadError] = React.useState<string | null>(
    null,
  );

  const maxUploadBytes = React.useMemo(() => getResumeUploadMaxBytes(), []);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadAbortControllerRef = React.useRef<AbortController | null>(null);

  const openPicker = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilePicked = React.useCallback(
    (file: File | null) => {
      setUploadError(null);
      setUploadState("idle");
      setUploadProgress(0);
      setSelectedFile(file);

      if (!file) {
        setValidationError(null);
        return;
      }

      const validation = validateResumeFile(file, maxUploadBytes);
      setValidationError(validation.valid ? null : validation.error);
    },
    [maxUploadBytes],
  );

  const cancelUpload = React.useCallback(() => {
    uploadAbortControllerRef.current?.abort();
  }, []);

  const loadResumes = React.useCallback(async () => {
    if (!user?.id) {
      setResumes([]);
      setIsLoadingResumes(false);
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

      setResumes((data ?? []) as Array<ResumeListItem>);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load resumes right now.";
      setResumeLoadError(message);
      setResumes([]);
    } finally {
      setIsLoadingResumes(false);
    }
  }, [user?.id]);

  const handleUpload = React.useCallback(async () => {
    const isUploading = uploadState === "uploading";
    if (isUploading) {
      return;
    }

    const precheckError = getUploadPrecheckError({
      isUploading,
      userId: user?.id,
      selectedFile,
      maxUploadBytes,
    });

    if (precheckError) {
      if (user?.id === undefined) {
        setUploadError(precheckError);
        setUploadState("failed");
      } else {
        setValidationError(precheckError);
      }
      return;
    }

    const fileToUpload = selectedFile;
    const userId = user?.id;

    if (!fileToUpload || !userId) {
      setUploadError("Upload failed. Please try again.");
      setUploadState("failed");
      return;
    }

    const fileType = mapMimeTypeToResumeFileType(fileToUpload.type);
    if (!fileType) {
      setUploadError("Upload failed. Please try again.");
      setUploadState("failed");
      return;
    }

    setValidationError(null);
    setUploadError(null);
    setUploadState("uploading");
    setUploadProgress(0);

    const supabase = getSupabaseBrowserClient();
    const { supabaseUrl, supabaseAnonKey } = getSupabaseBrowserConfig();

    const resumeId = globalThis.crypto.randomUUID();
    const originalFilename = normalizeOriginalFilename(fileToUpload.name);
    const safeStorageFilename = sanitizeStorageFilename(originalFilename);
    const storagePath = `${userId}/${resumeId}/${safeStorageFilename}`;
    const title = getResumeTitle(originalFilename);

    const abortController = new AbortController();
    uploadAbortControllerRef.current = abortController;

    try {
      await uploadFileToSupabaseStorageWithProgress({
        supabase,
        supabaseUrl,
        supabaseAnonKey,
        bucket: "resumes",
        path: storagePath,
        file: fileToUpload,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        signal: abortController.signal,
      });

      setUploadProgress(100);

      await insertResumeMetadataWithSession({
        supabase,
        supabaseUrl,
        supabaseAnonKey,
        record: {
          id: resumeId,
          user_id: userId,
          original_filename: originalFilename,
          file_type: fileType,
          storage_path: storagePath,
          title,
        },
      });

      setUploadState("success");
      await loadResumes();
      await navigate({
        to: "/dashboard/$resumeId",
        params: { resumeId },
      });
    } catch (error) {
      const { error: cleanupError } = await supabase.storage
        .from("resumes")
        .remove([storagePath]);

      if (cleanupError) {
        console.error("Failed to cleanup uploaded resume after error", {
          cleanupError,
          storagePath,
        });
      }

      setUploadError(toUploadErrorMessage(error));
      setUploadState("failed");
      setUploadProgress(0);
    } finally {
      uploadAbortControllerRef.current = null;
    }
  }, [
    loadResumes,
    maxUploadBytes,
    navigate,
    selectedFile,
    uploadState,
    user?.id,
  ]);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await loadResumes();
      if (cancelled) {
        return;
      }
    };

    load();

    return () => {
      cancelled = true;
      uploadAbortControllerRef.current?.abort();
    };
  }, [loadResumes]);

  const pickedFileName = selectedFile?.name ?? null;

  return (
    <main>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <DashboardSidebar />

          <div className="min-w-0 space-y-6">
            <DashboardWelcomeCard
              pickedFileName={pickedFileName}
              onUpload={openPicker}
            />

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

            <DashboardUploadSection
              onOpenPicker={openPicker}
              onFilePicked={handleFilePicked}
              onSubmitUpload={handleUpload}
              onCancelUpload={cancelUpload}
              fileInputRef={fileInputRef}
              selectedFile={selectedFile}
              maxFileSizeBytes={maxUploadBytes}
              validationError={validationError}
              uploadError={uploadError}
              uploadState={uploadState}
              uploadProgress={uploadProgress}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
