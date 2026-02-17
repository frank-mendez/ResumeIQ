import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResumeFileTypeEnum, ResumeUploadStateEnum } from "~/enums/resume";

const {
  getAuthenticatedUserIdMock,
  insertResumeMetadataWithSessionMock,
  removeResumeStorageObjectMock,
  uploadFileToSupabaseStorageWithProgressMock,
  getSupabaseBrowserClientMock,
  getResumeTitleMock,
  mapMimeTypeToResumeFileTypeMock,
  normalizeOriginalFilenameMock,
  sanitizeStorageFilenameMock,
  validateResumeFileMock,
} = vi.hoisted(() => ({
  getAuthenticatedUserIdMock: vi.fn(),
  insertResumeMetadataWithSessionMock: vi.fn(),
  removeResumeStorageObjectMock: vi.fn(),
  uploadFileToSupabaseStorageWithProgressMock: vi.fn(),
  getSupabaseBrowserClientMock: vi.fn(),
  getResumeTitleMock: vi.fn(),
  mapMimeTypeToResumeFileTypeMock: vi.fn(),
  normalizeOriginalFilenameMock: vi.fn(),
  sanitizeStorageFilenameMock: vi.fn(),
  validateResumeFileMock: vi.fn(),
}));

vi.mock("~/services/resume.service", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
  insertResumeMetadataWithSession: insertResumeMetadataWithSessionMock,
  removeResumeStorageObject: removeResumeStorageObjectMock,
  uploadFileToSupabaseStorageWithProgress:
    uploadFileToSupabaseStorageWithProgressMock,
}));

vi.mock("~/utils/supabase.browser", () => ({
  getSupabaseBrowserClient: getSupabaseBrowserClientMock,
}));

vi.mock("~/utils/resumeFile", () => ({
  getResumeTitle: getResumeTitleMock,
  mapMimeTypeToResumeFileType: mapMimeTypeToResumeFileTypeMock,
  normalizeOriginalFilename: normalizeOriginalFilenameMock,
  sanitizeStorageFilename: sanitizeStorageFilenameMock,
  validateResumeFile: validateResumeFileMock,
}));

import { useResumeUpload } from "~/hooks/useResumeUpload";

describe("useResumeUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseBrowserClientMock.mockReturnValue({});
    validateResumeFileMock.mockReturnValue({ valid: true, error: null });
    mapMimeTypeToResumeFileTypeMock.mockReturnValue(ResumeFileTypeEnum.PDF);
    normalizeOriginalFilenameMock.mockReturnValue("resume.pdf");
    sanitizeStorageFilenameMock.mockReturnValue("resume.pdf");
    getResumeTitleMock.mockReturnValue("resume");
    getAuthenticatedUserIdMock.mockResolvedValue("user-123");
    insertResumeMetadataWithSessionMock.mockResolvedValue(undefined);
    removeResumeStorageObjectMock.mockResolvedValue(undefined);
  });

  it("fails upload when user session is missing", async () => {
    const { result } = renderHook(() =>
      useResumeUpload({
        userId: undefined,
        maxUploadBytes: 5 * 1024 * 1024,
        onUploadSuccess: vi.fn().mockResolvedValue(undefined),
      }),
    );

    await act(async () => {
      await result.current?.handleUpload();
    });

    expect(result.current?.uploadState).toBe(ResumeUploadStateEnum.FAILED);
    expect(result.current?.uploadError).toBe(
      "Your session has expired. Please sign in again.",
    );
  });

  it("requires selecting a file before upload", async () => {
    const { result } = renderHook(() =>
      useResumeUpload({
        userId: "user-123",
        maxUploadBytes: 5 * 1024 * 1024,
        onUploadSuccess: vi.fn().mockResolvedValue(undefined),
      }),
    );

    await act(async () => {
      await result.current?.handleUpload();
    });

    expect(result.current?.validationError).toBe(
      "Choose a resume file before uploading.",
    );
  });

  it("uploads file and marks success", async () => {
    const onUploadSuccess = vi.fn().mockResolvedValue(undefined);

    uploadFileToSupabaseStorageWithProgressMock.mockImplementation(
      async ({ onProgress }: { onProgress: (value: number) => void }) => {
        onProgress(45);
      },
    );

    const uuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("11111111-1111-4111-8111-111111111111");

    const { result } = renderHook(() =>
      useResumeUpload({
        userId: "user-123",
        maxUploadBytes: 5 * 1024 * 1024,
        onUploadSuccess,
      }),
    );

    const file = new File(["content"], "resume.pdf", {
      type: "application/pdf",
    });

    act(() => {
      result.current?.handleFilePicked(file);
    });

    await act(async () => {
      await result.current?.handleUpload();
    });

    expect(uploadFileToSupabaseStorageWithProgressMock).toHaveBeenCalled();
    expect(insertResumeMetadataWithSessionMock).toHaveBeenCalled();
    expect(onUploadSuccess).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(result.current?.uploadState).toBe(ResumeUploadStateEnum.SUCCESS);
    expect(result.current?.uploadProgress).toBe(100);

    uuidSpy.mockRestore();
  });

  it("cleans up storage path and marks failed on upload error", async () => {
    const onUploadSuccess = vi.fn().mockResolvedValue(undefined);

    uploadFileToSupabaseStorageWithProgressMock.mockRejectedValue(
      new Error("upload crashed"),
    );

    const uuidSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("22222222-2222-4222-8222-222222222222");

    const { result } = renderHook(() =>
      useResumeUpload({
        userId: "user-123",
        maxUploadBytes: 5 * 1024 * 1024,
        onUploadSuccess,
      }),
    );

    const file = new File(["content"], "resume.pdf", {
      type: "application/pdf",
    });

    act(() => {
      result.current?.handleFilePicked(file);
    });

    await act(async () => {
      await result.current?.handleUpload();
    });

    expect(removeResumeStorageObjectMock).toHaveBeenCalledWith(
      "user-123/22222222-2222-4222-8222-222222222222/resume.pdf",
    );
    expect(onUploadSuccess).not.toHaveBeenCalled();
    expect(result.current?.uploadState).toBe(ResumeUploadStateEnum.FAILED);
    expect(result.current?.uploadError).toBe("upload crashed");

    uuidSpy.mockRestore();
  });
});
