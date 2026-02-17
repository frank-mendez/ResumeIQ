import { describe, expect, it, vi, beforeEach } from "vitest";

const { getSupabaseBrowserClientMock } = vi.hoisted(() => ({
  getSupabaseBrowserClientMock: vi.fn(),
}));

vi.mock("~/utils/supabase.browser", () => ({
  getSupabaseBrowserClient: getSupabaseBrowserClientMock,
}));

import {
  getAuthenticatedUserId,
  loadLatestAnalysisForResume,
  loadOwnedResume,
  loadUserResumes,
  removeResumeStorageObject,
} from "~/services/resume.service";

describe("resume.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns authenticated user id when session user exists", async () => {
    getSupabaseBrowserClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123" } },
          error: null,
        }),
      },
    });

    await expect(getAuthenticatedUserId()).resolves.toBe("user-123");
  });

  it("throws when user lookup fails", async () => {
    getSupabaseBrowserClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("auth failed"),
        }),
      },
    });

    await expect(getAuthenticatedUserId()).rejects.toThrow(
      "Your session has expired. Please sign in again.",
    );
  });

  it("loads user resumes ordered by date", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "resume-1",
          original_filename: "resume.pdf",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      error: null,
    });

    const eqMock = vi.fn().mockReturnValue({
      order: orderMock,
    });

    const selectMock = vi.fn().mockReturnValue({
      eq: eqMock,
    });

    getSupabaseBrowserClientMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: selectMock,
      }),
    });

    const resumes = await loadUserResumes("user-123");

    expect(resumes).toHaveLength(1);
    expect(resumes[0]?.id).toBe("resume-1");
    expect(eqMock).toHaveBeenCalledWith("user_id", "user-123");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("throws when loading resumes fails", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("query failed"),
    });

    getSupabaseBrowserClientMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: orderMock,
          }),
        }),
      }),
    });

    await expect(loadUserResumes("user-123")).rejects.toThrow("query failed");
  });

  it("removes storage object", async () => {
    const removeMock = vi.fn().mockResolvedValue({ error: null });

    getSupabaseBrowserClientMock.mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          remove: removeMock,
        }),
      },
    });

    await removeResumeStorageObject("user/resume/path.pdf");

    expect(removeMock).toHaveBeenCalledWith(["user/resume/path.pdf"]);
  });

  it("throws when remove storage fails", async () => {
    getSupabaseBrowserClientMock.mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          remove: vi.fn().mockResolvedValue({
            error: new Error("remove failed"),
          }),
        }),
      },
    });

    await expect(
      removeResumeStorageObject("user/resume/path.pdf"),
    ).rejects.toThrow("remove failed");
  });

  it("loads owned resume record", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: {
        id: "resume-1",
        original_filename: "resume.pdf",
        created_at: "2026-01-01T00:00:00.000Z",
      },
      error: null,
    });

    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleMock,
            }),
          }),
        }),
      }),
    } as any;

    const result = await loadOwnedResume(supabase, "resume-1", "user-123");

    expect(result?.id).toBe("resume-1");
    expect(maybeSingleMock).toHaveBeenCalledTimes(1);
  });

  it("returns null when no latest resume version exists", async () => {
    const maybeSingleVersionMock = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: maybeSingleVersionMock,
              }),
            }),
          }),
        }),
      }),
    } as any;

    const result = await loadLatestAnalysisForResume(supabase, "resume-1");

    expect(result).toBeNull();
  });

  it("loads latest analysis for latest resume version", async () => {
    const maybeSingleVersionMock = vi.fn().mockResolvedValue({
      data: { id: "version-1" },
      error: null,
    });

    const maybeSingleAnalysisMock = vi.fn().mockResolvedValue({
      data: {
        id: "analysis-1",
        overall_score: 87,
        created_at: "2026-01-02T00:00:00.000Z",
      },
      error: null,
    });

    const fromMock = vi.fn((table: string) => {
      if (table === "resume_versions") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  maybeSingle: maybeSingleVersionMock,
                }),
              }),
            }),
          }),
        };
      }

      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: maybeSingleAnalysisMock,
              }),
            }),
          }),
        }),
      };
    });

    const supabase = {
      from: fromMock,
    } as any;

    const result = await loadLatestAnalysisForResume(supabase, "resume-1");

    expect(result?.id).toBe("analysis-1");
    expect(fromMock).toHaveBeenNthCalledWith(1, "resume_versions");
    expect(fromMock).toHaveBeenNthCalledWith(2, "resume_analyses");
  });

  it("throws when versions query fails", async () => {
    const maybeSingleVersionMock = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("versions failed"),
    });

    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: maybeSingleVersionMock,
              }),
            }),
          }),
        }),
      }),
    } as any;

    await expect(
      loadLatestAnalysisForResume(supabase, "resume-1"),
    ).rejects.toThrow("versions failed");
  });
});
