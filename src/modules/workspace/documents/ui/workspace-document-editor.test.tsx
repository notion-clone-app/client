import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { WorkspaceDocumentContent } from "../model/workspace-document-content.entity";
import { WorkspaceDocumentEditor } from "./workspace-document-editor";

const initialDocument: WorkspaceDocumentContent = {
  schemaVersion: 1,
  id: "document-1",
  workspaceId: "workspace-1",
  title: "Draft",
  metadata: {
    revision: 1,
    createdAt: "2026-07-18T09:00:00.000Z",
    updatedAt: "2026-07-18T09:00:00.000Z",
    createdBy: "user-1",
    updatedBy: "user-1",
  },
  blocks: [
    {
      id: "paragraph-1",
      type: "paragraph",
      options: { bold: false, italic: false },
      content: "Initial paragraph",
    },
  ],
};

function ControlledWorkspaceDocumentEditor() {
  const [document, setDocument] = useState(initialDocument);
  return <WorkspaceDocumentEditor document={document} onChange={setDocument} />;
}

describe("WorkspaceDocumentEditor", () => {
  it("composes title editing with the shared block editor", async () => {
    const user = userEvent.setup();
    render(<ControlledWorkspaceDocumentEditor />);

    const title = screen.getByRole("textbox", { name: "Document title" });
    await user.clear(title);
    await user.type(title, "Product brief");

    const paragraph = screen.getByRole("textbox", { name: "Paragraph" });
    await user.clear(paragraph);
    await user.type(paragraph, "Updated paragraph");

    expect(title).toHaveValue("Product brief");
    expect(paragraph).toHaveValue("Updated paragraph");
  });

  it("adds and removes the mocked workspace cover", async () => {
    const user = userEvent.setup();
    render(<ControlledWorkspaceDocumentEditor />);

    await user.click(screen.getByRole("button", { name: /Add cover/u }));
    expect(screen.getByRole("button", { name: "Remove document cover" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove document cover" }));
    expect(screen.getByRole("button", { name: /Add cover/u })).toBeInTheDocument();
  });
});
