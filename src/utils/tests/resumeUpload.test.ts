import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatFileSize,
  insertResumeMetadataWithSession,
  getResumeUploadMaxBytes,
  getResumeTitle,
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

function createSupabaseSessionMock(response: SessionResponse) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue(response),
    },
  } as unknown as SupabaseClient;
}

class MockXMLHttpRequest {
  private static implementation:
    | ((instance: MockXMLHttpRequest, file: File) => void)
    | null = null;

  static setImplementation(
    implementation: ((instance: MockXMLHttpRequest, file: File) => void) | null,
  ) {
    MockXMLHttpRequest.implementation = implementation;
  }

  static resetImplementation() {
    MockXMLHttpRequest.implementation = null;
  }

  upload: { onprogress?: (event: ProgressEvent) => void } = {};
  headers: Record<string, string> = {};
  status = 200;
  responseText: string | null = null;
  method = "";
  url = "";
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  onload: (() => void) | null = null;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  send(file: File) {
    if (!MockXMLHttpRequest.implementation) {
      this.onload?.();
      return;
    }

    MockXMLHttpRequest.implementation(this, file);
  }

  abort() {
    this.onabort?.();
  }
}

describe("resumeUpload utils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    MockXMLHttpRequest.resetImplementation();
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

  it("uploads to storage and reports progress", async () => {
    const originalXhr = globalThis.XMLHttpRequest;
    vi.stubGlobal(
      "XMLHttpRequest",
      MockXMLHttpRequest as unknown as typeof XMLHttpRequest,
    );

    const supabase = createSupabaseSessionMock({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    const file = new File(["data"], "resume.pdf", { type: "application/pdf" });
    const progressUpdates: number[] = [];

    MockXMLHttpRequest.setImplementation((xhr) => {
      xhr.upload.onprogress?.({
        lengthComputable: false,
        loaded: 0,
        total: 100,
      } as ProgressEvent);
      xhr.upload.onprogress?.({
        lengthComputable: true,
        loaded: 40,
        total: 100,
      } as ProgressEvent);
      xhr.upload.onprogress?.({
        lengthComputable: true,
        loaded: 120,
        total: 100,
      } as ProgressEvent);
      xhr.status = 200;
      xhr.onload?.();
    });

    await uploadFileToSupabaseStorageWithProgress({
      supabase,
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
      bucket: "resumes",
      path: "user id/folder/resume final.pdf",
      file,
      onProgress: (progress) => progressUpdates.push(progress),
    });

    expect(progressUpdates).toEqual([40, 100]);

    globalThis.XMLHttpRequest = originalXhr;
  });

  it("rejects upload when session lookup fails", async () => {
    const supabase = createSupabaseSessionMock({
      data: { session: null },
      error: new Error("session error"),
    });

    await expect(
      uploadFileToSupabaseStorageWithProgress({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        bucket: "resumes",
        path: "user/resume.pdf",
        file: new File(["data"], "resume.pdf", { type: "application/pdf" }),
        onProgress: vi.fn(),
      }),
    ).rejects.toThrow("session error");
  });

  it("rejects upload when token is missing", async () => {
    const supabase = createSupabaseSessionMock({
      data: { session: {} },
      error: null,
    });

    await expect(
      uploadFileToSupabaseStorageWithProgress({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        bucket: "resumes",
        path: "user/resume.pdf",
        file: new File(["data"], "resume.pdf", { type: "application/pdf" }),
        onProgress: vi.fn(),
      }),
    ).rejects.toThrow("Your session has expired");
  });

  it("handles upload network, abort, and server errors", async () => {
    const originalXhr = globalThis.XMLHttpRequest;
    vi.stubGlobal(
      "XMLHttpRequest",
      MockXMLHttpRequest as unknown as typeof XMLHttpRequest,
    );

    const supabase = createSupabaseSessionMock({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    const file = new File(["data"], "resume.pdf", { type: "application/pdf" });

    MockXMLHttpRequest.setImplementation((xhr) => {
      xhr.onerror?.();
    });

    await expect(
      uploadFileToSupabaseStorageWithProgress({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        bucket: "resumes",
        path: "user/resume.pdf",
        file,
        onProgress: vi.fn(),
      }),
    ).rejects.toThrow("Network error while uploading");

    MockXMLHttpRequest.setImplementation((xhr) => {
      xhr.status = 403;
      xhr.responseText = JSON.stringify({ message: "forbidden" });
      xhr.onload?.();
    });

    await expect(
      uploadFileToSupabaseStorageWithProgress({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        bucket: "resumes",
        path: "user/resume.pdf",
        file,
        onProgress: vi.fn(),
      }),
    ).rejects.toThrow("forbidden");

    MockXMLHttpRequest.setImplementation((xhr) => {
      xhr.status = 409;
      xhr.responseText = JSON.stringify({ error: "already exists" });
      xhr.onload?.();
    });

    await expect(
      uploadFileToSupabaseStorageWithProgress({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        bucket: "resumes",
        path: "user/resume.pdf",
        file,
        onProgress: vi.fn(),
      }),
    ).rejects.toThrow("already exists");

    MockXMLHttpRequest.setImplementation((xhr) => {
      xhr.status = 500;
      xhr.responseText = "not-json";
      xhr.onload?.();
    });

    await expect(
      uploadFileToSupabaseStorageWithProgress({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        bucket: "resumes",
        path: "user/resume.pdf",
        file,
        onProgress: vi.fn(),
      }),
    ).rejects.toThrow("Upload failed with status 500.");

    MockXMLHttpRequest.setImplementation((xhr) => {
      xhr.status = 502;
      xhr.responseText = null;
      xhr.onload?.();
    });

    await expect(
      uploadFileToSupabaseStorageWithProgress({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        bucket: "resumes",
        path: "user/resume.pdf",
        file,
        onProgress: vi.fn(),
      }),
    ).rejects.toThrow("Upload failed with status 502.");

    MockXMLHttpRequest.setImplementation(() => {
      // wait for abort signal to trigger xhr.abort()
    });

    const controller = new AbortController();
    const uploadPromise = uploadFileToSupabaseStorageWithProgress({
      supabase,
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
      bucket: "resumes",
      path: "user/resume.pdf",
      file,
      onProgress: vi.fn(),
      signal: controller.signal,
    });

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 0);
    });
    controller.abort();
    await expect(uploadPromise).rejects.toThrow("Upload canceled");

    globalThis.XMLHttpRequest = originalXhr;
  });

  it("inserts resume metadata with authenticated session", async () => {
    const supabase = createSupabaseSessionMock({
      data: { session: { access_token: "token-123" } },
      error: null,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await insertResumeMetadataWithSession({
      supabase,
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
      record: {
        id: "resume-id",
        user_id: "user-id",
        original_filename: "resume.pdf",
        file_type: "pdf",
        storage_path: "user-id/resume-id/resume.pdf",
        title: "resume",
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("handles metadata insert session and fetch errors", async () => {
    const sessionErrorClient = createSupabaseSessionMock({
      data: { session: null },
      error: new Error("session failed"),
    });

    await expect(
      insertResumeMetadataWithSession({
        supabase: sessionErrorClient,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
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

    const noTokenClient = createSupabaseSessionMock({
      data: { session: {} },
      error: null,
    });

    await expect(
      insertResumeMetadataWithSession({
        supabase: noTokenClient,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
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

    const supabase = createSupabaseSessionMock({
      data: { session: { access_token: "token-123" } },
      error: null,
    });

    const withMessage = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: "invalid payload" }),
    });
    vi.stubGlobal("fetch", withMessage);

    await expect(
      insertResumeMetadataWithSession({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        record: {
          id: "resume-id",
          user_id: "user-id",
          original_filename: "resume.pdf",
          file_type: "pdf",
          storage_path: "user-id/resume-id/resume.pdf",
          title: "resume",
        },
      }),
    ).rejects.toThrow("invalid payload");

    const withBadJson = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new Error("bad json")),
    });
    vi.stubGlobal("fetch", withBadJson);

    await expect(
      insertResumeMetadataWithSession({
        supabase,
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "anon-key",
        record: {
          id: "resume-id",
          user_id: "user-id",
          original_filename: "resume.pdf",
          file_type: "pdf",
          storage_path: "user-id/resume-id/resume.pdf",
          title: "resume",
        },
      }),
    ).rejects.toThrow("Unable to save resume metadata (503).");
  });
});
