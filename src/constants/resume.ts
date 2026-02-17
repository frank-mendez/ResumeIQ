export const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const RESUME_STORAGE_BUCKET = "resumes";
export const RESUMES_TABLE = "resumes";

export const ACCEPTED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
