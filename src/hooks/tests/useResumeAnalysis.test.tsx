import * as React from "react";
import { act } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getSupabaseBrowserClientMock,
  loadOwnedResumeMock,
  loadLatestAnalysisForResumeMock,
} = vi.hoisted(() => ({
  getSupabaseBrowserClientMock: vi.fn(),
  loadOwnedResumeMock: vi.fn(),
  loadLatestAnalysisForResumeMock: vi.fn(),
}));

vi.mock("~/utils/supabase.browser", () => ({
  getSupabaseBrowserClient: getSupabaseBrowserClientMock,
}));

vi.mock("~/services/resume.service", () => ({
  loadOwnedResume: loadOwnedResumeMock,
  loadLatestAnalysisForResume: loadLatestAnalysisForResumeMock,
}));

import { useResumeAnalysis } from "~/hooks/useResumeAnalysis";

function flush() {
  return act(async () => {
    await Promise.resolve();
  });
}

describe("useResumeAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseBrowserClientMock.mockReturnValue({});
  });

  it("returns signed-out error when userId is missing", async () => {
    let latest: ReturnType<typeof useResumeAnalysis> | undefined;

    function Harness() {
      latest = useResumeAnalysis({ resumeId: "resume-1", userId: undefined });
      return null;
    }

    render(<Harness />);
    await flush();

    expect(latest?.isLoading).toBe(false);
    expect(latest?.errorMessage).toBe(
      "You must be signed in to view this analysis.",
    );
    expect(loadOwnedResumeMock).not.toHaveBeenCalled();
  });

  it("returns not-found message when resume does not exist", async () => {
    loadOwnedResumeMock.mockResolvedValue(null);

    let latest: ReturnType<typeof useResumeAnalysis> | undefined;

    function Harness() {
      latest = useResumeAnalysis({ resumeId: "resume-1", userId: "user-123" });
      return null;
    }

    render(<Harness />);
    await flush();

    expect(latest?.isLoading).toBe(false);
    expect(latest?.errorMessage).toBe("Resume not found.");
    expect(latest?.resume).toBeNull();
    expect(latest?.analysis).toBeNull();
  });

  it("loads resume and latest analysis", async () => {
    loadOwnedResumeMock.mockResolvedValue({
      id: "resume-1",
      original_filename: "resume.pdf",
      created_at: "2026-01-01T00:00:00.000Z",
    });
    loadLatestAnalysisForResumeMock.mockResolvedValue({
      id: "analysis-1",
      overall_score: 91,
      created_at: "2026-01-02T00:00:00.000Z",
    });

    let latest: ReturnType<typeof useResumeAnalysis> | undefined;

    function Harness() {
      latest = useResumeAnalysis({ resumeId: "resume-1", userId: "user-123" });
      return null;
    }

    render(<Harness />);
    await flush();

    expect(latest?.isLoading).toBe(false);
    expect(latest?.errorMessage).toBeNull();
    expect(latest?.resume?.id).toBe("resume-1");
    expect(latest?.analysis?.id).toBe("analysis-1");
  });

  it("captures load error", async () => {
    loadOwnedResumeMock.mockRejectedValue(new Error("analysis load failed"));

    let latest: ReturnType<typeof useResumeAnalysis> | undefined;

    function Harness() {
      latest = useResumeAnalysis({ resumeId: "resume-1", userId: "user-123" });
      return null;
    }

    render(<Harness />);
    await flush();

    expect(latest?.isLoading).toBe(false);
    expect(latest?.errorMessage).toBe("analysis load failed");
    expect(latest?.resume).toBeNull();
    expect(latest?.analysis).toBeNull();
  });
});
