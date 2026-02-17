import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const RESUME_STORAGE_BUCKET = "resumes";

export const ACCEPTED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type ResumeFileType = "pdf" | "docx";

export function getResumeUploadMaxBytes() {
  const envValue = Number(import.meta.env.VITE_RESUME_UPLOAD_MAX_BYTES);
  if (!Number.isFinite(envValue) || envValue <= 0) {
    return DEFAULT_MAX_UPLOAD_BYTES;
  }

  return Math.floor(envValue);
}

export function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateResumeFile(file: File, maxSizeBytes: number) {
  if (
    !ACCEPTED_RESUME_MIME_TYPES.includes(
      file.type as (typeof ACCEPTED_RESUME_MIME_TYPES)[number],
    )
  ) {
    return {
      valid: false,
      error: "Only PDF and DOCX files are supported.",
    } as const;
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${formatFileSize(maxSizeBytes)}.`,
    } as const;
  }

  return { valid: true, error: null } as const;
}

export function normalizeOriginalFilename(filename: string) {
  const fromBasename = filename.split(/[\\/]/).pop()?.trim() ?? "";
  return fromBasename || "resume";
}

function stripControlCharacters(value: string) {
  return Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint >= 32 && codePoint !== 127;
    })
    .join("");
}

export function sanitizeStorageFilename(filename: string) {
  const normalized = stripControlCharacters(normalizeOriginalFilename(filename))
    .replaceAll(/\s+/g, " ")
    .replaceAll(/[^\w. -]/g, "_")
    .replace(/^\.+/, "")
    .trim();

  return normalized || "resume";
}

export function getResumeTitle(filename: string) {
  const normalized = normalizeOriginalFilename(filename);
  const dotIndex = normalized.lastIndexOf(".");

  if (dotIndex <= 0) {
    return normalized;
  }

  return normalized.slice(0, dotIndex);
}

export function mapMimeTypeToResumeFileType(
  mimeType: string,
): ResumeFileType | null {
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }

  return null;
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

type ResumeInsertRecord = {
  id: string;
  user_id: string;
  original_filename: string;
  file_type: ResumeFileType;
  storage_path: string;
  title: string;
};

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

  const { error } = await supabase.from("resumes").insert(record);

  if (!error) {
    return;
  }

  throw new Error(error.message ?? "Unable to save resume metadata.");
}
