import type { SupabaseClient } from "@supabase/supabase-js";
import { RESUMES_TABLE, RESUME_STORAGE_BUCKET } from "~/constants/resume";
import type {
  ResumeAnalysisRecord,
  ResumeInsertRecord,
  ResumeListItem,
  ResumeRecord,
} from "~/types/resume";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";

export async function getAuthenticatedUserId() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return user.id;
}

export async function loadUserResumes(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from(RESUMES_TABLE)
    .select("id, original_filename, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Array<ResumeListItem>;
}

export async function removeResumeStorageObject(storagePath: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(RESUME_STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) {
    throw error;
  }
}

function isUnauthorizedStorageError(
  error: {
    message?: string;
    statusCode?: string | number;
  } | null,
) {
  if (!error) {
    return false;
  }

  const statusCode = String(error.statusCode ?? "");
  const message = (error.message ?? "").toLowerCase();

  return (
    statusCode === "401" ||
    message.includes("unauthorized") ||
    message.includes("jwt")
  );
}

function toStorageError(error: unknown): {
  message?: string;
  statusCode?: string | number;
} | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  return error as {
    message?: string;
    statusCode?: string | number;
  };
}

function throwOriginalOrFallback(error: unknown) {
  if (error instanceof Error) {
    throw error;
  }

  const storageError = toStorageError(error);
  if (storageError?.message) {
    throw new Error(storageError.message);
  }

  throw new Error("Upload failed with status 500.");
}

async function refreshUploadSessionOrThrow(
  supabase: SupabaseClient,
  originalError: unknown,
) {
  const { data: refreshData, error: refreshError } =
    await supabase.auth.refreshSession();

  if (refreshError || !refreshData.session?.access_token) {
    if (originalError instanceof Error) {
      throw originalError;
    }

    throw new Error("Your session has expired. Please sign in again.");
  }
}

export async function uploadFileToSupabaseStorageWithProgress({
  supabase,
  bucket,
  path,
  file,
  onProgress,
  signal,
}: {
  supabase: SupabaseClient;
  bucket: string;
  path: string;
  file: File;
  onProgress: (progress: number) => void;
  signal?: AbortSignal;
}) {
  if (signal?.aborted) {
    throw new DOMException("Upload canceled", "AbortError");
  }

  onProgress(0);

  const uploadOnce = async () => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw error;
    }
  };

  try {
    await uploadOnce();
  } catch (error) {
    const storageError = toStorageError(error);

    if (!isUnauthorizedStorageError(storageError)) {
      throwOriginalOrFallback(error);
    }

    await refreshUploadSessionOrThrow(supabase, error);

    await uploadOnce();
  }

  if (signal?.aborted) {
    throw new DOMException("Upload canceled", "AbortError");
  }

  onProgress(100);
}

export async function insertResumeMetadataWithSession({
  supabase,
  record,
}: {
  supabase: SupabaseClient;
  record: ResumeInsertRecord;
}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const { error } = await supabase.from(RESUMES_TABLE).insert(record);

  if (!error) {
    return;
  }

  throw new Error(error.message ?? "Unable to save resume metadata.");
}

export async function loadOwnedResume(
  supabase: SupabaseClient,
  resumeId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from(RESUMES_TABLE)
    .select("id, original_filename, created_at")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as ResumeRecord | null;
}

export async function loadLatestAnalysisForResume(
  supabase: SupabaseClient,
  resumeId: string,
) {
  const { data: latestVersion, error: versionsError } = await supabase
    .from("resume_versions")
    .select("id")
    .eq("resume_id", resumeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionsError) {
    throw versionsError;
  }

  if (!latestVersion) {
    return null;
  }

  const { data: latestAnalysis, error: analysesError } = await supabase
    .from("resume_analyses")
    .select("id, overall_score, created_at")
    .eq("resume_version_id", latestVersion.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (analysesError) {
    throw analysesError;
  }

  return (latestAnalysis ?? null) as ResumeAnalysisRecord | null;
}
