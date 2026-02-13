import { describe, expect, it } from "vitest";

import {
  getResumeTitle,
  mapMimeTypeToResumeFileType,
  normalizeOriginalFilename,
  sanitizeStorageFilename,
  validateResumeFile,
} from "../resumeUpload";

describe("resumeUpload utils", () => {
  it("normalizes and sanitizes file names for storage", () => {
    expect(normalizeOriginalFilename("../unsafe/path/resume?.pdf")).toBe(
      "resume?.pdf",
    );
    expect(sanitizeStorageFilename("../unsafe/path/resume?.pdf")).toBe(
      "resume_.pdf",
    );
  });

  it("derives resume title from filename", () => {
    expect(getResumeTitle("senior_resume_v2.pdf")).toBe("senior_resume_v2");
    expect(getResumeTitle("resume_without_extension")).toBe(
      "resume_without_extension",
    );
  });

  it("maps supported mime types to db file types", () => {
    expect(mapMimeTypeToResumeFileType("application/pdf")).toBe("pdf");
    expect(
      mapMimeTypeToResumeFileType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe("docx");
    expect(mapMimeTypeToResumeFileType("application/msword")).toBeNull();
  });

  it("validates file type and max size", () => {
    const maxBytes = 5 * 1024 * 1024;
    const validPdf = new File([new Uint8Array([1, 2, 3])], "resume.pdf", {
      type: "application/pdf",
    });
    const invalidType = new File([new Uint8Array([1])], "resume.doc", {
      type: "application/msword",
    });
    const tooLarge = new File([new Uint8Array(maxBytes + 1)], "resume.pdf", {
      type: "application/pdf",
    });

    expect(validateResumeFile(validPdf, maxBytes).valid).toBe(true);
    expect(validateResumeFile(invalidType, maxBytes).valid).toBe(false);
    expect(validateResumeFile(tooLarge, maxBytes).valid).toBe(false);
  });
});
