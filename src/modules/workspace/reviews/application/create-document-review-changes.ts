import type { DocumentBlock } from "@/shared/editor";
import type { WorkspaceDocumentContent } from "../../documents/model/workspace-document-content.entity";
import type { CreateDocumentReviewChangeInput } from "../model/document-review.entity";

/** Builds a block-level review diff between a published revision and its draft. */
export function createDocumentReviewChanges(
  source: WorkspaceDocumentContent | null,
  draft: WorkspaceDocumentContent,
): readonly CreateDocumentReviewChangeInput[] {
  if (!source) {
    return draft.blocks.map((block) => ({
      blockId: block.id,
      kind: "added",
      label: blockLabel(block),
      after: blockText(block),
    }));
  }

  const sourceBlocks = new Map(source.blocks.map((block) => [block.id, block]));
  const draftBlocks = new Map(draft.blocks.map((block) => [block.id, block]));
  const changes: CreateDocumentReviewChangeInput[] = [];

  if (source.title !== draft.title) {
    changes.push({
      blockId: null,
      kind: "updated",
      label: "Document title",
      before: source.title,
      after: draft.title,
    });
  }

  for (const block of draft.blocks) {
    const previous = sourceBlocks.get(block.id);
    if (!previous) {
      changes.push({
        blockId: block.id,
        kind: "added",
        label: blockLabel(block),
        after: blockText(block),
      });
    } else if (JSON.stringify(previous) !== JSON.stringify(block)) {
      changes.push({
        blockId: block.id,
        kind: "updated",
        label: blockLabel(block),
        before: blockText(previous),
        after: blockText(block),
      });
    }
  }

  for (const block of source.blocks) {
    if (!draftBlocks.has(block.id)) {
      changes.push({
        blockId: block.id,
        kind: "removed",
        label: blockLabel(block),
        before: blockText(block),
      });
    }
  }

  return changes;
}

function blockLabel(block: DocumentBlock) {
  return block.type === "heading"
    ? `Heading ${block.options.level}`
    : block.type === "list"
      ? "List"
      : "Paragraph";
}

function blockText(block: DocumentBlock) {
  return block.type === "list" ? block.items.map((item) => item.content).join("\n") : block.content;
}
