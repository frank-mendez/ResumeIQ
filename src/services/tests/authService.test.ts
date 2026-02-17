import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProviderEnum } from "~/enums/auth";

const { getSupabaseBrowserClientMock } = vi.hoisted(() => ({
  getSupabaseBrowserClientMock: vi.fn(),
}));

vi.mock("~/utils/supabase.browser", () => ({
  getSupabaseBrowserClient: getSupabaseBrowserClientMock,
}));

import { startOAuthSignIn } from "~/services/auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts oauth with provider and redirect", async () => {
    const signInWithOAuthMock = vi.fn().mockResolvedValue({ error: null });

    getSupabaseBrowserClientMock.mockReturnValue({
      auth: {
        signInWithOAuth: signInWithOAuthMock,
      },
    });

    await startOAuthSignIn({
      provider: AuthProviderEnum.GOOGLE,
      redirectTo: "https://app.example.com/auth/callback",
    });

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: AuthProviderEnum.GOOGLE,
      options: {
        redirectTo: "https://app.example.com/auth/callback",
      },
    });
  });

  it("throws when oauth start fails", async () => {
    getSupabaseBrowserClientMock.mockReturnValue({
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({
          error: { message: "oauth failed" },
        }),
      },
    });

    await expect(
      startOAuthSignIn({
        provider: AuthProviderEnum.GITHUB,
        redirectTo: "https://app.example.com/auth/callback",
      }),
    ).rejects.toThrow("oauth failed");
  });
});
