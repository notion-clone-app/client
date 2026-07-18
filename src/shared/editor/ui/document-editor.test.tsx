import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DocumentEditor, type EditorDocument } from "@/shared/editor";

const initialDocument: EditorDocument = {
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
      id: "heading-1",
      type: "heading",
      options: { level: 2 },
      content: "Overview",
    },
    {
      id: "paragraph-1",
      type: "paragraph",
      options: { bold: false, italic: false },
      content: "Initial paragraph",
    },
    {
      id: "list-1",
      type: "list",
      options: { style: "number" },
      items: [
        { id: "item-1", content: "First" },
        { id: "item-2", content: "Second" },
      ],
    },
  ],
};

function ControlledEditor() {
  const [document, setDocument] = useState(initialDocument);
  return <DocumentEditor document={document} onChange={setDocument} />;
}

describe("DocumentEditor", () => {
  it("edits the title and paragraph through controlled state", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    const title = screen.getByRole("textbox", { name: "Document title" });
    await user.clear(title);
    await user.type(title, "Product brief");

    const paragraph = screen.getByRole("textbox", { name: "Paragraph" });
    await user.clear(paragraph);
    await user.type(paragraph, "Updated paragraph");

    expect(title).toHaveValue("Product brief");
    expect(paragraph).toHaveValue("Updated paragraph");
  });

  it("selects a paragraph and changes its formatting options", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    await user.click(screen.getByRole("button", { name: "Select paragraph block" }));
    await user.click(screen.getByRole("button", { name: "Bold" }));

    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("textbox", { name: "Paragraph" })).toHaveClass("font-semibold");
  });

  it("adds and numbers the next list item when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    const secondItem = screen.getByRole("textbox", { name: "List item 2" });
    await user.click(secondItem);
    await user.keyboard("{Enter}");

    expect(screen.getByRole("textbox", { name: "List item 3" })).toHaveFocus();
  });

  it("turns Markdown heading syntax into a heading block", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    const paragraph = screen.getByRole("textbox", { name: "Paragraph" });
    await user.clear(paragraph);
    await user.type(paragraph, "### ");

    expect(screen.getByRole("textbox", { name: "Heading level 3" })).toHaveFocus();
  });

  it("opens slash commands and applies the selected block type", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    const paragraph = screen.getByRole("textbox", { name: "Paragraph" });
    await user.clear(paragraph);
    await user.type(paragraph, "/heading 2");
    await user.click(screen.getByRole("button", { name: /Heading 2/u }));

    expect(
      screen
        .getAllByRole("textbox", { name: "Heading level 2" })
        .some(
          (heading) =>
            heading.getAttribute("data-block-input") === "paragraph-1" &&
            heading === document.activeElement,
        ),
    ).toBe(true);
  });
});
