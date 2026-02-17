import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { OAuthButton } from "../auth/OAuthButton";
import { AuthProviderEnum } from "~/enums/auth";

describe("OAuthButton", () => {
  it("renders provider label when not loading", () => {
    const html = renderToStaticMarkup(
      <OAuthButton
        provider={AuthProviderEnum.GOOGLE}
        label="Continue with Google"
        loading={false}
        disabled={false}
        onClick={vi.fn()}
      />,
    );

    expect(html).toContain("Continue with Google");
    expect(html).not.toContain("Working…");
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders spinner state and disabled attribute while loading", () => {
    const html = renderToStaticMarkup(
      <OAuthButton
        provider={AuthProviderEnum.GITHUB}
        label="Continue with GitHub"
        loading={true}
        disabled={true}
        onClick={vi.fn()}
      />,
    );

    expect(html).toContain("Working…");
    expect(html).toContain('aria-label="Loading github"');
    expect(html).toContain("disabled");
  });
});
