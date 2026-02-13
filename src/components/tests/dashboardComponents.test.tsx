import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: Record<string, unknown>) => (
    <a {...props}>{children as ReactNode}</a>
  ),
}));

import { DashboardSidebar } from "../dashboard/DashboardSidebar";
import { DashboardUploadSection } from "../dashboard/DashboardUploadSection";
import { DashboardWelcomeCard } from "../dashboard/DashboardWelcomeCard";
import { QuickActionsCard } from "../dashboard/QuickActionsCard";
import { ResumeListCard } from "../dashboard/ResumeListCard";

describe("Dashboard components", () => {
  it("renders DashboardSidebar navigation content", () => {
    const html = renderToStaticMarkup(<DashboardSidebar />);

    expect(html).toContain("Dashboard");
    expect(html).toContain("Overview");
    expect(html).toContain("Upload");
  });

  it("renders DashboardUploadSection with upload CTA", () => {
    const html = renderToStaticMarkup(
      <DashboardUploadSection
        onOpenPicker={vi.fn()}
        onFilePicked={vi.fn()}
        onSubmitUpload={vi.fn()}
        onCancelUpload={vi.fn()}
        fileInputRef={{ current: null }}
        selectedFile={null}
        maxFileSizeBytes={5 * 1024 * 1024}
        validationError={null}
        uploadError={null}
        uploadState="idle"
        uploadProgress={0}
      />,
    );

    expect(html).toContain("Upload resume");
    expect(html).toContain("Choose file");
    expect(html).toContain("Drag and drop your resume here");
  });

  it("renders DashboardWelcomeCard selected filename and fallback text", () => {
    const withFileHtml = renderToStaticMarkup(
      <DashboardWelcomeCard pickedFileName="resume.pdf" onUpload={vi.fn()} />,
    );
    const withoutFileHtml = renderToStaticMarkup(
      <DashboardWelcomeCard pickedFileName={null} onUpload={vi.fn()} />,
    );

    expect(withFileHtml).toContain("Selected: resume.pdf");
    expect(withoutFileHtml).toContain("PDF or DOCX up to 5MB");
  });

  it("renders QuickActionsCard call-to-actions", () => {
    const html = renderToStaticMarkup(<QuickActionsCard onUpload={vi.fn()} />);

    expect(html).toContain("Quick start");
    expect(html).toContain("Upload Resume");
    expect(html).toContain("How it works");
  });

  it("renders ResumeListCard states: loading, error, empty, and list", () => {
    const loadingHtml = renderToStaticMarkup(
      <ResumeListCard resumes={[]} isLoading={true} loadError={null} />,
    );
    const errorHtml = renderToStaticMarkup(
      <ResumeListCard
        resumes={[]}
        isLoading={false}
        loadError="Request failed"
      />,
    );
    const emptyHtml = renderToStaticMarkup(
      <ResumeListCard resumes={[]} isLoading={false} loadError={null} />,
    );
    const listHtml = renderToStaticMarkup(
      <ResumeListCard
        resumes={[
          {
            id: "resume-1",
            original_filename: "resume_v1.pdf",
            created_at: "2026-01-01T00:00:00.000Z",
          },
        ]}
        isLoading={false}
        loadError={null}
      />,
    );

    expect(loadingHtml).toContain("Loading your resumes...");
    expect(errorHtml).toContain("Could not load resumes");
    expect(errorHtml).toContain("Request failed");
    expect(emptyHtml).toContain("No resumes yet");
    expect(listHtml).toContain("resume_v1.pdf");
    expect(listHtml).toContain("Uploaded ");
  });
});
