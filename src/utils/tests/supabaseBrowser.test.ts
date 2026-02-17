import { afterEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("supabase.browser utils", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("throws when required browser env vars are missing", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    const module = await import("~/utils/supabase.browser");

    expect(() => module.getSupabaseBrowserConfig()).toThrow(
      "Missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY env vars",
    );
  });

  it("returns browser config from env", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");

    const module = await import("~/utils/supabase.browser");

    expect(module.getSupabaseBrowserConfig()).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "anon-key",
    });
  });

  it("creates and caches browser client", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "anon-key");

    const fakeClient = { auth: {} };
    createClientMock.mockReturnValue(fakeClient);

    const module = await import("~/utils/supabase.browser");

    const first = module.getSupabaseBrowserClient();
    const second = module.getSupabaseBrowserClient();

    expect(first).toBe(fakeClient);
    expect(second).toBe(fakeClient);
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
    );
  });
});
