import * as React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadUserResumesMock } = vi.hoisted(() => ({
  loadUserResumesMock: vi.fn(),
}));

vi.mock("~/services/resume.service", () => ({
  loadUserResumes: loadUserResumesMock,
}));

import { useResumes } from "~/hooks/useResumes";

function flush() {
  return act(async () => {
    await Promise.resolve();
  });
}

describe("useResumes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stops loading immediately when userId is missing", async () => {
    let latest: ReturnType<typeof useResumes> | undefined;

    function Harness() {
      latest = useResumes(undefined);
      return null;
    }

    await act(async () => {
      TestRenderer.create(<Harness />);
    });
    await flush();

    expect(loadUserResumesMock).not.toHaveBeenCalled();
    expect(latest?.isLoadingResumes).toBe(false);
    expect(latest?.resumes).toEqual([]);
    expect(latest?.resumeLoadError).toBeNull();
  });

  it("loads resumes for authenticated user", async () => {
    loadUserResumesMock.mockResolvedValue([
      {
        id: "resume-1",
        original_filename: "resume.pdf",
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ]);

    let latest: ReturnType<typeof useResumes> | undefined;

    function Harness() {
      latest = useResumes("user-123");
      return null;
    }

    await act(async () => {
      TestRenderer.create(<Harness />);
    });
    await flush();

    expect(loadUserResumesMock).toHaveBeenCalledWith("user-123");
    expect(latest?.isLoadingResumes).toBe(false);
    expect(latest?.resumeLoadError).toBeNull();
    expect(latest?.resumes).toHaveLength(1);
  });

  it("captures load error and clears resumes", async () => {
    loadUserResumesMock.mockRejectedValue(new Error("load failed"));

    let latest: ReturnType<typeof useResumes> | undefined;

    function Harness() {
      latest = useResumes("user-123");
      return null;
    }

    await act(async () => {
      TestRenderer.create(<Harness />);
    });
    await flush();

    expect(latest?.isLoadingResumes).toBe(false);
    expect(latest?.resumeLoadError).toBe("load failed");
    expect(latest?.resumes).toEqual([]);
  });
});
