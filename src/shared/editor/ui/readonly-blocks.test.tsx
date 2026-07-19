import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DocumentBlock } from "../model/document-block";
import { ReadonlyBlocks } from "./readonly-blocks";

const blocks: readonly DocumentBlock[] = [
  {
    id: "heading-1",
    type: "heading",
    options: { level: 2 },
    content: "Decisions",
  },
  {
    id: "paragraph-1",
    type: "paragraph",
    options: { bold: false, italic: false },
    content: "Document body",
  },
];

describe("ReadonlyBlocks", () => {
  it("renders blocks through the shared registry", () => {
    render(<ReadonlyBlocks blocks={blocks} />);

    expect(screen.getByRole("heading", { level: 2, name: "Decisions" })).toBeVisible();
    expect(screen.getByText("Document body")).toBeVisible();
  });
});
