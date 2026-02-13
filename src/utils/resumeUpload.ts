import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

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

function parseUploadErrorMessage(responseText: string | null, status: number) {
  if (!responseText) {
    return `Upload failed with status ${status}.`;
  }

  try {
    const parsed = JSON.parse(responseText) as {
      error?: string;
      message?: string;
    };
    return (
      parsed.error ?? parsed.message ?? `Upload failed with status ${status}.`
    );
  } catch {
    return `Upload failed with status ${status}.`;
  }
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export async function uploadFileToSupabaseStorageWithProgress({
  supabase,
  supabaseUrl,
  supabaseAnonKey,
  bucket,
  path,
  file,
  onProgress,
  signal,
}: {
  supabase: SupabaseClient;
  supabaseUrl: string;
  supabaseAnonKey: string;
  bucket: string;
  path: string;
  file: File;
  onProgress: (progress: number) => void;
  signal?: AbortSignal;
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

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abortHandler = () => xhr.abort();
    let settled = false;

    const cleanup = () => {
      if (!signal) {
        return;
      }

      signal.removeEventListener("abort", abortHandler);
    };

    const finish = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      callback();
    };

    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("content-type", file.type);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.min(
        100,
        Math.max(0, Math.round((event.loaded / event.total) * 100)),
      );
      onProgress(progress);
    };

    xhr.onerror = () => {
      finish(() => {
        reject(new Error("Network error while uploading. Please try again."));
      });
    };

    xhr.onabort = () => {
      finish(() => {
        reject(new DOMException("Upload canceled", "AbortError"));
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        finish(() => {
          resolve();
        });
        return;
      }

      finish(() => {
        reject(
          new Error(parseUploadErrorMessage(xhr.responseText, xhr.status)),
        );
      });
    };

    signal?.addEventListener("abort", abortHandler);

    if (signal?.aborted) {
      xhr.abort();
      return;
    }

    xhr.send(file);
  });
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
  supabaseUrl,
  supabaseAnonKey,
  record,
}: {
  supabase: SupabaseClient;
  supabaseUrl: string;
  supabaseAnonKey: string;
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

  const response = await fetch(`${supabaseUrl}/rest/v1/resumes`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify(record),
  });

  if (response.ok) {
    return;
  }

  let message = `Unable to save resume metadata (${response.status}).`;

  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
      hint?: string;
      details?: string;
    };

    message =
      payload.message ??
      payload.error ??
      payload.details ??
      payload.hint ??
      message;
  } catch {
    message = `Unable to save resume metadata (${response.status}).`;
  }

  throw new Error(message);
}
