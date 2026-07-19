import { describe, expect, it } from "vitest";
import type { DocumentBlock } from "../model/document-block";
import { serializeBlocksToMarkdown } from "./serialize-document";

const blocks: readonly DocumentBlock[] = [
  { id: "heading-1", type: "heading", options: { level: 2 }, content: "Goals" },
  {
    id: "list-1",
    type: "list",
    options: { style: "number" },
    items: [
      { id: "item-1", content: "Fast" },
      { id: "item-2", content: "Offline" },
    ],
  },
];

describe("serializeBlocksToMarkdown", () => {
  it("serializes headings and ordered lists without host metadata", () => {
    expect(serializeBlocksToMarkdown(blocks)).toBe("## Goals\n\n1. Fast\n2. Offline");
  });
});
