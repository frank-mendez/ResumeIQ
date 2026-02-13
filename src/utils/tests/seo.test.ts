import { describe, expect, it } from "vitest";

import { APP_NAME, makeTitle, seo } from "../seo";

describe("seo utilities", () => {
  it("builds page title with app name suffix", () => {
    expect(makeTitle(" Dashboard ")).toBe(`Dashboard | ${APP_NAME}`);
    expect(makeTitle("  ")).toBe(APP_NAME);
    expect(makeTitle()).toBe(APP_NAME);
  });

  it("returns metadata tags without image tags when image is missing", () => {
    const tags = seo({
      title: "Resume Dashboard",
      description: "Manage resumes",
      keywords: "resume,cv",
    });

    expect(tags.some((tag) => tag.name === "twitter:image")).toBe(false);
    expect(tags.some((tag) => tag.name === "og:image")).toBe(false);
  });

  it("includes social image tags when image exists", () => {
    const image = "https://example.com/preview.png";
    const tags = seo({
      title: "Resume Dashboard",
      description: "Manage resumes",
      image,
    });

    expect(tags).toEqual(
      expect.arrayContaining([
        { name: "twitter:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "og:image", content: image },
      ]),
    );
  });
});
