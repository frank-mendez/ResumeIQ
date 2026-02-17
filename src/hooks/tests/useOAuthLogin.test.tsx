import * as React from "react";
import { render, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProviderEnum } from "~/enums/auth";

const { startOAuthSignInMock } = vi.hoisted(() => ({
  startOAuthSignInMock: vi.fn(),
}));

vi.mock("~/services/auth.service", () => ({
  startOAuthSignIn: startOAuthSignInMock,
}));

import { useOAuthLogin } from "~/hooks/useOAuthLogin";

describe("useOAuthLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: { origin: "https://resumeiq.app" },
    });
  });

  it("surfaces decoded route error and allows dismiss", async () => {
    let latest: ReturnType<typeof useOAuthLogin> | undefined;

    function Harness() {
      latest = useOAuthLogin({
        routeError: encodeURIComponent("OAuth failed"),
      });
      return null;
    }

    render(<Harness />);

    expect(latest?.errorMessage).toBe("OAuth failed");

    act(() => {
      latest?.dismissError();
    });

    expect(latest?.errorMessage).toBeNull();
  });

  it("starts OAuth with safe redirect path", async () => {
    startOAuthSignInMock.mockResolvedValue(undefined);

    let latest: ReturnType<typeof useOAuthLogin> | undefined;

    function Harness() {
      latest = useOAuthLogin({ redirectParam: "https://evil.com" });
      return null;
    }

    render(<Harness />);

    await act(async () => {
      await latest?.startOAuth(AuthProviderEnum.GOOGLE);
    });

    expect(startOAuthSignInMock).toHaveBeenCalledWith({
      provider: AuthProviderEnum.GOOGLE,
      redirectTo: "https://resumeiq.app/auth/callback?redirect=%2Fdashboard",
    });
    expect(latest?.loadingProvider).toBe(AuthProviderEnum.GOOGLE);
  });

  it("captures oauth start failure and clears loading", async () => {
    startOAuthSignInMock.mockRejectedValue(new Error("oauth start failed"));

    let latest: ReturnType<typeof useOAuthLogin> | undefined;

    function Harness() {
      latest = useOAuthLogin({ redirectParam: "/dashboard" });
      return null;
    }

    render(<Harness />);

    await act(async () => {
      await latest?.startOAuth(AuthProviderEnum.GITHUB);
    });

    expect(latest?.errorMessage).toBe("oauth start failed");
    expect(latest?.loadingProvider).toBeNull();
  });
});
