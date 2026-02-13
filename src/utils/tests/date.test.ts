import { describe, expect, it } from "vitest";

import { formatDisplayDate } from "../date";

describe("formatDisplayDate", () => {
  it("returns fallback for null values", () => {
    expect(formatDisplayDate(null)).toBe("Unknown date");
  });

  it("returns fallback for invalid date strings", () => {
    expect(formatDisplayDate("not-a-date")).toBe("Unknown date");
  });

  it("formats valid dates", () => {
    const result = formatDisplayDate("2026-01-15T12:00:00.000Z");
    const otherResult = formatDisplayDate("2027-01-15T12:00:00.000Z");

    expect(result).not.toBe("Unknown date");
    expect(otherResult).not.toBe("Unknown date");
    expect(result).not.toBe(otherResult);
  });
});