import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GitHubIcon } from "~/assets/icons/GitHubIcon";

describe("GitHubIcon", () => {
  it("renders svg path", () => {
    const html = renderToStaticMarkup(
      <GitHubIcon aria-hidden="true" className="h-5 w-5" />,
    );

    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain("currentColor");
  });
});
