import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EditorDocument } from "../model/editor-document";
import { ReadonlyDocument } from "./readonly-document";

const document: EditorDocument = {
  schemaVersion: 1,
  id: "document-1",
  workspaceId: "workspace-1",
  title: "Architecture",
  metadata: {
    revision: 3,
    createdAt: "2026-07-18T09:00:00.000Z",
    updatedAt: "2026-07-18T10:00:00.000Z",
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  blocks: [
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
  ],
};

describe("ReadonlyDocument", () => {
  it("renders the document title and semantic heading level", () => {
    render(<ReadonlyDocument document={document} />);

    expect(screen.getByRole("heading", { level: 1, name: "Architecture" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "Decisions" })).toBeVisible();
    expect(screen.getByText("Document body")).toBeVisible();
  });

  it("hides metadata by default", () => {
    render(<ReadonlyDocument document={document} />);

    expect(screen.queryByText(/Revision 3/u)).not.toBeInTheDocument();
  });
});
