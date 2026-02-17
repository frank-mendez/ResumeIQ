import * as React from "react";
import { formatFileSize } from "~/utils/resumeUpload";

type DashboardUploadSectionProps = Readonly<{
  onOpenPicker: () => void;
  onFilePicked: (file: File | null) => void;
  onSubmitUpload: () => void;
  onCancelUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  maxFileSizeBytes: number;
  validationError: string | null;
  uploadError: string | null;
  uploadState: "idle" | "uploading" | "saving" | "success" | "failed";
  uploadProgress: number;
}>;

export function DashboardUploadSection({
  onOpenPicker,
  onFilePicked,
  onSubmitUpload,
  onCancelUpload,
  fileInputRef,
  selectedFile,
  maxFileSizeBytes,
  validationError,
  uploadError,
  uploadState,
  uploadProgress,
}: DashboardUploadSectionProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const dragDepthRef = React.useRef(0);

  const isUploading = uploadState === "uploading";
  const isSavingMetadata = uploadState === "saving";
  const isBusy = isUploading || isSavingMetadata;
  const canUpload = Boolean(selectedFile) && !validationError && !isBusy;
  let uploadButtonLabel = "Upload";
  if (isUploading) {
    uploadButtonLabel = "Uploading...";
  } else if (isSavingMetadata) {
    uploadButtonLabel = "Saving...";
  }

  const handlePickedFiles = React.useCallback(
    (files: FileList | null) => {
      const file = files?.[0] ?? null;
      onFilePicked(file);
    },
    [onFilePicked],
  );

  const handleFileInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handlePickedFiles(event.currentTarget.files);
      event.currentTarget.value = "";
    },
    [handlePickedFiles],
  );

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const handleDragEnter = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current += 1;
      setIsDragging(true);
    },
    [],
  );

  const handleDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();

      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDragging(false);
      }
    },
    [],
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragDepthRef.current = 0;
      setIsDragging(false);
      handlePickedFiles(event.dataTransfer.files);
    },
    [handlePickedFiles],
  );

  return (
    <section
      id="upload"
      aria-label="Upload"
      className="rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-800 dark:bg-gray-950/40 sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Upload resume
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Upload a PDF or DOCX file up to {formatFileSize(maxFileSizeBytes)}.
          </p>
        </div>
      </div>

      <input
        id="resume-upload-input"
        ref={fileInputRef}
        type="file"
        accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={handleFileInputChange}
      />

      <label
        htmlFor="resume-upload-input"
        className={`mt-6 rounded-xl p-6 text-sm transition-colors ${
          isDragging
            ? "border-gray-500 bg-white dark:border-gray-500 dark:bg-gray-950"
            : "border-gray-300 bg-white/40 dark:border-gray-700 dark:bg-gray-950/20"
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-full rounded-lg border border-dashed border-gray-300 bg-white/60 p-4 text-left dark:border-gray-700 dark:bg-gray-950/30">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Drag and drop your resume here
          </p>
          <p className="mt-1 leading-relaxed text-gray-600 dark:text-gray-300">
            Click this area or use Choose file below.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenPicker}
            disabled={isBusy}
            className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
          >
            Choose file
          </button>
          <button
            type="button"
            onClick={onSubmitUpload}
            disabled={!canUpload}
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-50 dark:text-gray-900"
          >
            {uploadButtonLabel}
          </button>
          {isUploading ? (
            <button
              type="button"
              onClick={onCancelUpload}
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-100 dark:hover:bg-gray-950"
            >
              Cancel
            </button>
          ) : null}
        </div>

        {selectedFile ? (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white/70 p-3 dark:border-gray-800 dark:bg-gray-950/40">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        ) : null}

        {uploadState === "uploading" ? (
          <div className="mt-4" aria-live="polite">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full bg-gray-900 transition-all dark:bg-gray-100"
                style={{ width: `${uploadProgress}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Uploading {uploadProgress}%
            </p>
          </div>
        ) : null}

        {uploadState === "saving" ? (
          <p
            className="mt-4 text-xs text-gray-600 dark:text-gray-400"
            aria-live="polite"
          >
            Upload complete. Saving metadata...
          </p>
        ) : null}

        {uploadState === "success" ? (
          <p
            className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
            aria-live="polite"
          >
            Upload successful.
          </p>
        ) : null}

        {validationError ? (
          <div
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/50 dark:bg-rose-950/20"
            role="alert"
          >
            <p className="text-sm text-rose-800 dark:text-rose-300">
              {validationError}
            </p>
          </div>
        ) : null}

        {uploadError ? (
          <div
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/50 dark:bg-rose-950/20"
            role="alert"
          >
            <p className="text-sm text-rose-800 dark:text-rose-300">
              {uploadError}
            </p>
          </div>
        ) : null}
      </label>
    </section>
  );
}
