import {
  ACCEPTED_RESUME_MIME_TYPES,
  DEFAULT_MAX_UPLOAD_BYTES,
} from "~/constants/resume";
import { ResumeFileTypeEnum } from "~/enums/resume";
import type { ResumeFileType } from "~/types/resume";

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
    return ResumeFileTypeEnum.PDF;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return ResumeFileTypeEnum.DOCX;
  }

  return null;
}
