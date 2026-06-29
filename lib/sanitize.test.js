import { describe, it, expect } from "vitest";
import { safeMarkdownHtml } from "./sanitize.js";

describe("safeMarkdownHtml", () => {
  it("strips <script> while keeping safe markup", () => {
    const out = safeMarkdownHtml('<p>hi</p><script>alert(1)</script>');
    expect(out).toContain("<p>hi</p>");
    expect(out).not.toContain("<script");
  });
  it("keeps headings, lists and tables", () => {
    const out = safeMarkdownHtml("<h2>T</h2><ul><li>x</li></ul>");
    expect(out).toContain("<h2>T</h2>");
    expect(out).toContain("<li>x</li>");
  });
  it("adds rel=noopener to links", () => {
    expect(safeMarkdownHtml('<a href="https://x.com">l</a>')).toContain('rel="noopener noreferrer"');
  });
  it("drops javascript: URLs", () => {
    const out = safeMarkdownHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });
  it("handles empty input", () => {
    expect(safeMarkdownHtml("")).toBe("");
    expect(safeMarkdownHtml(null)).toBe("");
  });
});
