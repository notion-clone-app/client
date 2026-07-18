import {
  parseMarkdownHeading,
  type DocumentBlock,
  type HeadingBlock,
  type ListBlock,
  type ParagraphBlock,
  type ParsedMarkdownHeading,
} from "@/shared/editor";
import type {
  WorkspaceDocumentContent,
  WorkspaceDocumentMetadata,
} from "./model/workspace-document-content.entity";
import type { WorkspaceDocument } from "./model/workspace-document.entity";

const demoTimestamp = "2026-07-18T09:00:00.000Z";

export function createDemoDocumentBoard(document: WorkspaceDocument): WorkspaceDocumentContent {
  const metadata: WorkspaceDocumentMetadata = {
    revision: 1,
    createdAt: demoTimestamp,
    updatedAt: demoTimestamp,
    createdBy: "demo-user",
    updatedBy: "demo-user",
  };
  const intro: ParagraphBlock = {
    id: `${document.id}-intro`,
    type: "paragraph",
    options: { bold: false, italic: false },
    content:
      "This readonly document uses the same shared rendering model that can be embedded on the landing page.",
  };
  const nextDescription: ParagraphBlock = {
    id: `${document.id}-next-description`,
    type: "paragraph",
    options: { bold: false, italic: true },
    content: "Editing behavior, selections and persistence will be added on top of this model.",
  };
  const blocks: readonly DocumentBlock[] = [
    createHeadingBlock(`${document.id}-overview`, "## Overview"),
    intro,
    createDemoList(document.id),
    createHeadingBlock(`${document.id}-next`, "### Next step"),
    nextDescription,
  ];

  return {
    schemaVersion: 1,
    id: document.id,
    workspaceId: "demo-workspace",
    title: document.title,
    metadata,
    blocks,
  };
}

function createHeadingBlock(id: string, source: string): HeadingBlock {
  const heading = parseMarkdownHeading(source);
  if (!heading) throw new Error(`Expected a Markdown heading, received: ${source}`);

  return toHeadingBlock(id, heading);
}

function toHeadingBlock(id: string, heading: ParsedMarkdownHeading): HeadingBlock {
  return {
    id,
    type: "heading",
    options: { level: heading.level },
    content: heading.content,
  };
}

function createDemoList(documentId: string): ListBlock {
  return {
    id: `${documentId}-list`,
    type: "list",
    options: { style: "number" },
    items: [
      { id: `${documentId}-list-item-1`, content: "Select a block" },
      { id: `${documentId}-list-item-2`, content: "Change its options" },
      { id: `${documentId}-list-item-3`, content: "Press Enter to add the next item" },
    ],
  };
}
