import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatFileSize,
  getResumeTitle,
  getResumeUploadMaxBytes,
  insertResumeMetadataWithSession,
  mapMimeTypeToResumeFileType,
  normalizeOriginalFilename,
  sanitizeStorageFilename,
  uploadFileToSupabaseStorageWithProgress,
  validateResumeFile,
} from "../resumeUpload";

type SessionResponse = {
  data: { session: { access_token?: string } | null };
  error: Error | null;
};

function createSupabaseMock(options?: {
  sessionResponse?: SessionResponse;
  uploadResponses?: Array<{
    error: { message: string; statusCode?: string } | null;
  }>;
  refreshResponse?: {
    data: { session: { access_token?: string } | null };
    error: Error | null;
  };
  insertError?: { message?: string } | null;
}) {
  const uploadMock = vi.fn();
  const uploadResponses = options?.uploadResponses ?? [{ error: null }];

  for (const response of uploadResponses) {
    uploadMock.mockResolvedValueOnce({ data: null, error: response.error });
  }

  const insertMock = vi.fn().mockResolvedValue({
    data: null,
    error: options?.insertError ?? null,
  });

  const getSessionMock = vi.fn().mockResolvedValue(
    options?.sessionResponse ?? {
      data: { session: { access_token: "token-123" } },
      error: null,
    },
  );

  const refreshSessionMock = vi.fn().mockResolvedValue(
    options?.refreshResponse ?? {
      data: { session: { access_token: "token-refreshed" } },
      error: null,
    },
  );

  const client = {
    auth: {
      getSession: getSessionMock,
      refreshSession: refreshSessionMock,
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: uploadMock,
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table !== "resumes") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        insert: insertMock,
      };
    }),
  } as unknown as SupabaseClient;

  return {
    client,
    uploadMock,
    insertMock,
    getSessionMock,
    refreshSessionMock,
  };
}

describe("resumeUpload utils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns default upload max bytes when env is not set", () => {
    expect(getResumeUploadMaxBytes()).toBeGreaterThan(0);
  });

  it("formats file sizes", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.00 MB");
  });

  it("normalizes and sanitizes file names for storage", () => {
    expect(normalizeOriginalFilename("../unsafe/path/resume?.pdf")).toBe(
      "resume?.pdf",
    );
    expect(normalizeOriginalFilename("    ")).toBe("resume");
    expect(sanitizeStorageFilename("../unsafe/path/resume?.pdf")).toBe(
      "resume_.pdf",
    );
    expect(sanitizeStorageFilename("...\u0007\u007F")).toBe("resume");
  });

  it("derives resume title from filename", () => {
    expect(getResumeTitle("senior_resume_v2.pdf")).toBe("senior_resume_v2");
    expect(getResumeTitle("resume_without_extension")).toBe(
      "resume_without_extension",
    );
    expect(getResumeTitle(".hiddenfile")).toBe(".hiddenfile");
  });

  it("maps supported mime types to db file types", () => {
    expect(mapMimeTypeToResumeFileType("application/pdf")).toBe("pdf");
    expect(
      mapMimeTypeToResumeFileType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe("docx");
    expect(mapMimeTypeToResumeFileType("application/msword")).toBeNull();
  });

  it("validates file type and max size", () => {
    const maxBytes = 5 * 1024 * 1024;
    const validPdf = new File([new Uint8Array([1, 2, 3])], "resume.pdf", {
      type: "application/pdf",
    });
    const invalidType = new File([new Uint8Array([1])], "resume.doc", {
      type: "application/msword",
    });
    const tooLarge = new File([new Uint8Array(maxBytes + 1)], "resume.pdf", {
      type: "application/pdf",
    });

    expect(validateResumeFile(validPdf, maxBytes).valid).toBe(true);
    expect(validateResumeFile(invalidType, maxBytes).valid).toBe(false);
    expect(validateResumeFile(tooLarge, maxBytes).valid).toBe(false);
  });

  it("uploads to storage using supabase client and updates progress", async () => {
    const { client, uploadMock } = createSupabaseMock();
    const file = new File(["data"], "resume.pdf", { type: "application/pdf" });
    const progress: number[] = [];

    await uploadFileToSupabaseStorageWithProgress({
      supabase: client,
      bucket: "resumes",
      path: "user-id/resume-id/resume.pdf",
      file,
      onProgress: (value) => progress.push(value),
    });

    expect(uploadMock).toHaveBeenCalledTimes(1);
    expect(uploadMock).toHaveBeenCalledWith(
      "user-id/resume-id/resume.pdf",
      file,
      {
        contentType: "application/pdf",
        upsert: false,
      },
    );
    expect(progress).toEqual([0, 100]);
  });

  it("retries upload once when unauthorized after refresh", async () => {
    const { client, uploadMock, refreshSessionMock } = createSupabaseMock({
      uploadResponses: [
        { error: { message: "Unauthorized", statusCode: "400" } },
        { error: null },
      ],
    });

    await uploadFileToSupabaseStorageWithProgress({
      supabase: client,
      bucket: "resumes",
      path: "user/resume.pdf",
      file: new File(["data"], "resume.pdf", { type: "application/pdf" }),
      onProgress: vi.fn(),
    });

    expect(refreshSessionMock).toHaveBeenCalledTimes(1);
    expect(uploadMock).toHaveBeenCalledTimes(2);
  });

  it("rejects when upload is already aborted", async () => {
    const { client } = createSupabaseMock();
    const controller = new AbortController();
    controller.abort();

    await expect(
      uploadFileToSupabaseStorageWithProgress({
        supabase: client,
        bucket: "resumes",
        path: "user/resume.pdf",
        file: new File(["data"], "resume.pdf", { type: "application/pdf" }),
        onProgress: vi.fn(),
        signal: controller.signal,
      }),
    ).rejects.toThrow("Upload canceled");
  });

  it("inserts resume metadata with authenticated session", async () => {
    const { client, insertMock } = createSupabaseMock();

    await insertResumeMetadataWithSession({
      supabase: client,
      record: {
        id: "resume-id",
        user_id: "user-id",
        original_filename: "resume.pdf",
        file_type: "pdf",
        storage_path: "user-id/resume-id/resume.pdf",
        title: "resume",
      },
    });

    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledWith({
      id: "resume-id",
      user_id: "user-id",
      original_filename: "resume.pdf",
      file_type: "pdf",
      storage_path: "user-id/resume-id/resume.pdf",
      title: "resume",
    });
  });

  it("handles metadata insert session and insert errors", async () => {
    const sessionErrorClient = createSupabaseMock({
      sessionResponse: {
        data: { session: null },
        error: new Error("session failed"),
      },
    }).client;

    await expect(
      insertResumeMetadataWithSession({
        supabase: sessionErrorClient,
        record: {
          id: "resume-id",
          user_id: "user-id",
          original_filename: "resume.pdf",
          file_type: "pdf",
          storage_path: "user-id/resume-id/resume.pdf",
          title: "resume",
        },
      }),
    ).rejects.toThrow("session failed");

    const noTokenClient = createSupabaseMock({
      sessionResponse: {
        data: { session: {} },
        error: null,
      },
    }).client;

    await expect(
      insertResumeMetadataWithSession({
        supabase: noTokenClient,
        record: {
          id: "resume-id",
          user_id: "user-id",
          original_filename: "resume.pdf",
          file_type: "pdf",
          storage_path: "user-id/resume-id/resume.pdf",
          title: "resume",
        },
      }),
    ).rejects.toThrow("Your session has expired");

    const insertErrorClient = createSupabaseMock({
      insertError: { message: "insert failed" },
    }).client;

    await expect(
      insertResumeMetadataWithSession({
        supabase: insertErrorClient,
        record: {
          id: "resume-id",
          user_id: "user-id",
          original_filename: "resume.pdf",
          file_type: "pdf",
          storage_path: "user-id/resume-id/resume.pdf",
          title: "resume",
        },
      }),
    ).rejects.toThrow("insert failed");
  });
});
