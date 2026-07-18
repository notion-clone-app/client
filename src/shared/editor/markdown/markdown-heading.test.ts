import { describe, expect, it } from "vitest";
import { coerceHeadingLevel, parseMarkdownHeading, type HeadingLevel } from "@/shared/editor";

describe("parseMarkdownHeading", () => {
  const headings: readonly (readonly [string, HeadingLevel, string])[] = [
    ["# Product", 1, "Product"],
    ["### Architecture decisions", 3, "Architecture decisions"],
    ["###### Details   ", 6, "Details"],
  ];

  it.each(headings)("parses %s", (source, level, content) => {
    expect(parseMarkdownHeading(source)).toEqual({ level, content });
  });

  it.each(["Product", "#Missing space", "####### Too deep"])(
    "does not treat %s as a heading",
    (source) => {
      expect(parseMarkdownHeading(source)).toBeNull();
    },
  );

  it("keeps an empty heading while the user is composing it", () => {
    expect(parseMarkdownHeading("## ")).toEqual({ level: 2, content: "" });
  });
});

describe("coerceHeadingLevel", () => {
  it.each([
    [-4, 1],
    [2.8, 2],
    [10, 6],
    [Number.NaN, 1],
  ])("coerces %s to %s", (input, expected) => {
    expect(coerceHeadingLevel(input)).toBe(expected);
  });
});
