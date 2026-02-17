import * as React from "react";
import { RESUME_STORAGE_BUCKET } from "~/constants/resume";
import { ResumeUploadStateEnum } from "~/enums/resume";
import {
  getAuthenticatedUserId,
  insertResumeMetadataWithSession,
  removeResumeStorageObject,
  uploadFileToSupabaseStorageWithProgress,
} from "~/services/resume.service";
import type { ResumeUploadState } from "~/types/resume";
import { getSupabaseBrowserClient } from "~/utils/supabase.browser";
import {
  getResumeTitle,
  mapMimeTypeToResumeFileType,
  normalizeOriginalFilename,
  sanitizeStorageFilename,
  validateResumeFile,
} from "~/utils/resumeFile";

function toUploadErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Upload canceled.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Upload failed. Please try again.";
}

export function useResumeUpload(options: {
  userId: string | undefined;
  maxUploadBytes: number;
  onUploadSuccess: (resumeId: string) => Promise<void>;
}) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [uploadState, setUploadState] = React.useState<ResumeUploadState>(
    ResumeUploadStateEnum.IDLE,
  );
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadAbortControllerRef = React.useRef<AbortController | null>(null);

  const openPicker = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilePicked = React.useCallback(
    (file: File | null) => {
      setUploadError(null);
      setUploadState(ResumeUploadStateEnum.IDLE);
      setUploadProgress(0);
      setSelectedFile(file);

      if (!file) {
        setValidationError(null);
        return;
      }

      const validation = validateResumeFile(file, options.maxUploadBytes);
      setValidationError(validation.valid ? null : validation.error);
    },
    [options.maxUploadBytes],
  );

  const cancelUpload = React.useCallback(() => {
    uploadAbortControllerRef.current?.abort();
  }, []);

  const handleUpload = React.useCallback(async () => {
    const isBusy =
      uploadState === ResumeUploadStateEnum.UPLOADING ||
      uploadState === ResumeUploadStateEnum.SAVING;
    if (isBusy) {
      return;
    }

    if (!options.userId) {
      setUploadError("Your session has expired. Please sign in again.");
      setUploadState(ResumeUploadStateEnum.FAILED);
      return;
    }

    if (!selectedFile) {
      setValidationError("Choose a resume file before uploading.");
      return;
    }

    const validation = validateResumeFile(selectedFile, options.maxUploadBytes);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    const fileType = mapMimeTypeToResumeFileType(selectedFile.type);
    if (!fileType) {
      setValidationError("Only PDF and DOCX files are supported.");
      return;
    }

    setValidationError(null);
    setUploadError(null);
    setUploadState(ResumeUploadStateEnum.UPLOADING);
    setUploadProgress(0);

    const supabase = getSupabaseBrowserClient();

    let storagePath = "";

    try {
      const authenticatedUserId = await getAuthenticatedUserId();
      const resumeId = globalThis.crypto.randomUUID();
      const originalFilename = normalizeOriginalFilename(selectedFile.name);
      const safeStorageFilename = sanitizeStorageFilename(originalFilename);
      storagePath = `${authenticatedUserId}/${resumeId}/${safeStorageFilename}`;
      const title = getResumeTitle(originalFilename);

      const abortController = new AbortController();
      uploadAbortControllerRef.current = abortController;

      await uploadFileToSupabaseStorageWithProgress({
        supabase,
        bucket: RESUME_STORAGE_BUCKET,
        path: storagePath,
        file: selectedFile,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        signal: abortController.signal,
      });

      setUploadProgress(100);
      setUploadState(ResumeUploadStateEnum.SAVING);
      uploadAbortControllerRef.current = null;

      await insertResumeMetadataWithSession({
        supabase,
        record: {
          id: resumeId,
          user_id: authenticatedUserId,
          original_filename: originalFilename,
          file_type: fileType,
          storage_path: storagePath,
          title,
        },
      });

      setUploadState(ResumeUploadStateEnum.SUCCESS);
      await options.onUploadSuccess(resumeId);
    } catch (error) {
      if (storagePath) {
        try {
          await removeResumeStorageObject(storagePath);
        } catch (cleanupError) {
          console.error("Failed to cleanup uploaded resume after error", {
            cleanupError,
            storagePath,
          });
        }
      }

      setUploadError(toUploadErrorMessage(error));
      setUploadState(ResumeUploadStateEnum.FAILED);
      setUploadProgress(0);
    } finally {
      uploadAbortControllerRef.current = null;
    }
  }, [options, selectedFile, uploadState]);

  React.useEffect(() => {
    return () => {
      uploadAbortControllerRef.current?.abort();
    };
  }, []);

  return {
    selectedFile,
    validationError,
    uploadError,
    uploadState,
    uploadProgress,
    fileInputRef,
    openPicker,
    handleFilePicked,
    handleUpload,
    cancelUpload,
  };
}
