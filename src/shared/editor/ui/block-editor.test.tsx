import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BlockEditor, type DocumentBlock } from "@/shared/editor";

const initialBlocks: readonly DocumentBlock[] = [
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
];

function ControlledEditor() {
  const [blocks, setBlocks] = useState(initialBlocks);
  return <BlockEditor blocks={blocks} onChange={setBlocks} />;
}

describe("BlockEditor", () => {
  it("edits a paragraph through controlled state", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    const paragraph = screen.getByRole("textbox", { name: "Paragraph" });
    await user.clear(paragraph);
    await user.type(paragraph, "Updated paragraph");

    expect(paragraph).toHaveValue("Updated paragraph");
  });

  it("selects a paragraph and changes its formatting options", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    await user.click(screen.getByRole("textbox", { name: "Paragraph" }));
    expect(screen.queryByRole("button", { name: "Bold" })).not.toBeInTheDocument();

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

  it("opens the contextual AI composer from slash commands", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    const paragraph = screen.getByRole("textbox", { name: "Paragraph" });
    await user.clear(paragraph);
    await user.type(paragraph, "/");
    await user.click(screen.getByRole("button", { name: "Ask AI" }));

    expect(screen.getByRole("textbox", { name: "Ask AI about selection" })).toBeInTheDocument();
  });

  it("appends an empty block from the bottom of the document", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    await user.click(screen.getByRole("button", { name: "Click to add a block" }));

    const paragraphs = screen.getAllByRole("textbox", { name: "Paragraph" });
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs.at(-1)).toHaveFocus();
  });

  it("navigates between document blocks with arrow keys", async () => {
    const user = userEvent.setup();
    render(<ControlledEditor />);

    const heading = screen.getByRole("textbox", { name: "Heading level 2" });
    await user.click(heading);
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("textbox", { name: "Paragraph" })).toHaveFocus();
  });
});
