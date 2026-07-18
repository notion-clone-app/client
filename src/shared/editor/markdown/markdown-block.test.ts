import { describe, expect, it } from "vitest";
import { parseMarkdownBlock, parseMarkdownList, parseMarkdownParagraph } from "@/shared/editor";

describe("parseMarkdownBlock", () => {
  it("prefers a heading when the Markdown syntax matches", () => {
    expect(parseMarkdownBlock("block-1", "## Overview")).toEqual({
      id: "block-1",
      type: "heading",
      options: { level: 2 },
      content: "Overview",
    });
  });

  it("falls back to a paragraph without losing its content", () => {
    expect(parseMarkdownBlock("block-2", "A regular paragraph.")).toEqual({
      id: "block-2",
      type: "paragraph",
      options: { bold: false, italic: false },
      content: "A regular paragraph.",
    });
  });

  it.each([
    ["- Bullet", "bullet"],
    ["1. Numbered", "number"],
  ] as const)("parses %s as a %s list", (source, style) => {
    expect(parseMarkdownBlock("list-1", source)).toMatchObject({
      type: "list",
      options: { style },
      items: [{ content: style === "bullet" ? "Bullet" : "Numbered" }],
    });
  });
});

describe("parseMarkdownParagraph", () => {
  it("preserves whitespace while the user is editing", () => {
    expect(parseMarkdownParagraph("block-3", "  Draft text  ").content).toBe("  Draft text  ");
  });
});

describe("parseMarkdownList", () => {
  it("returns null when a line does not start with list syntax", () => {
    expect(parseMarkdownList("list-2", "Not a list")).toBeNull();
  });
});
