import * as React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResumeUploadStateEnum } from "~/enums/resume";
import { DashboardUploadSection } from "~/components/dashboard/DashboardUploadSection";

describe("DashboardUploadSection interactions", () => {
  afterEach(() => {
    cleanup();
  });

  it("handles file input change and clears input value", () => {
    const onFilePicked = vi.fn();

    render(
      <DashboardUploadSection
        onOpenPicker={vi.fn()}
        onFilePicked={onFilePicked}
        onSubmitUpload={vi.fn()}
        onCancelUpload={vi.fn()}
        fileInputRef={{ current: null }}
        selectedFile={null}
        maxFileSizeBytes={5 * 1024 * 1024}
        validationError={null}
        uploadError={null}
        uploadState={ResumeUploadStateEnum.IDLE}
        uploadProgress={0}
      />,
    );

    const fileInput = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;

    const file = new File(["a"], "resume.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFilePicked).toHaveBeenCalledWith(file);
    expect(fileInput.value).toBe("");
  });

  it("handles drag enter/leave and drop to pick file", () => {
    const onFilePicked = vi.fn();

    const { container } = render(
      <DashboardUploadSection
        onOpenPicker={vi.fn()}
        onFilePicked={onFilePicked}
        onSubmitUpload={vi.fn()}
        onCancelUpload={vi.fn()}
        fileInputRef={{ current: null }}
        selectedFile={null}
        maxFileSizeBytes={5 * 1024 * 1024}
        validationError={null}
        uploadError={null}
        uploadState={ResumeUploadStateEnum.IDLE}
        uploadProgress={0}
      />,
    );

    const label = container.querySelector("label")!;
    const file = new File(["a"], "resume.pdf", {
      type: "application/pdf",
    });

    fireEvent.dragEnter(label, {
      dataTransfer: { files: [file] },
    });
    expect(label.className).toContain("border-gray-500");

    fireEvent.dragLeave(label, {
      dataTransfer: { files: [file] },
    });

    fireEvent.drop(label, {
      dataTransfer: { files: [file] },
    });

    expect(onFilePicked).toHaveBeenCalledWith(file);
  });

  it("renders state-driven content for uploading/saving/success", () => {
    const baseProps = {
      onOpenPicker: vi.fn(),
      onFilePicked: vi.fn(),
      onSubmitUpload: vi.fn(),
      onCancelUpload: vi.fn(),
      fileInputRef: { current: null },
      selectedFile: null,
      maxFileSizeBytes: 5 * 1024 * 1024,
      validationError: null,
      uploadError: null,
      uploadProgress: 42,
    };

    const { rerender } = render(
      <DashboardUploadSection
        {...baseProps}
        uploadState={ResumeUploadStateEnum.UPLOADING}
      />,
    );

    expect(screen.getByRole("button", { name: "Uploading..." })).toBeTruthy();
    expect(screen.getByText(/42%/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Cancel/ })).toBeTruthy();

    rerender(
      <DashboardUploadSection
        {...baseProps}
        uploadState={ResumeUploadStateEnum.SAVING}
      />,
    );

    expect(
      screen.getByText("Upload complete. Saving metadata..."),
    ).toBeTruthy();

    rerender(
      <DashboardUploadSection
        {...baseProps}
        uploadState={ResumeUploadStateEnum.SUCCESS}
      />,
    );

    expect(screen.getByText("Upload successful.")).toBeTruthy();
  });
});
