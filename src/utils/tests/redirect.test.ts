import { describe, expect, it } from "vitest";

import { toSafeRedirectPath } from "../redirect";

describe("toSafeRedirectPath", () => {
  it("returns dashboard path when value is undefined or empty", () => {
    expect(toSafeRedirectPath(undefined)).toBe("/dashboard");
    expect(toSafeRedirectPath("   ")).toBe("/dashboard");
  });

  it("rejects unsafe paths", () => {
    expect(toSafeRedirectPath("dashboard")).toBe("/dashboard");
    expect(toSafeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(toSafeRedirectPath(String.raw`/bad\path`)).toBe("/dashboard");
    expect(toSafeRedirectPath("/safe\u0007path")).toBe("/dashboard");
  });

  it("returns normalized safe path", () => {
    expect(toSafeRedirectPath("   /dashboard/resume-1   ")).toBe(
      "/dashboard/resume-1",
    );
  });
});
