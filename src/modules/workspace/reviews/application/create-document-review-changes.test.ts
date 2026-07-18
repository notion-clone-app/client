import { describe, expect, it } from "vitest";
import type { WorkspaceDocumentContent } from "../../documents/model/workspace-document-content.entity";
import { createDocumentReviewChanges } from "./create-document-review-changes";

const source: WorkspaceDocumentContent = {
  schemaVersion: 1,
  id: "source",
  workspaceId: "workspace",
  spaceId: "tech",
  title: "Guide",
  metadata: {
    revision: 1,
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
    createdBy: "author",
    updatedBy: "author",
  },
  blocks: [
    {
      id: "intro",
      type: "paragraph",
      options: { bold: false, italic: false },
      content: "Before",
    },
  ],
};

describe("createDocumentReviewChanges", () => {
  it("produces before and after values for a changed block", () => {
    const draft: WorkspaceDocumentContent = {
      ...source,
      id: "draft",
      sourceDocumentId: source.id,
      blocks: [
        {
          id: "intro",
          type: "paragraph",
          options: { bold: false, italic: false },
          content: "After",
        },
      ],
    };

    expect(createDocumentReviewChanges(source, draft)).toEqual([
      {
        blockId: "intro",
        kind: "updated",
        label: "Paragraph",
        before: "Before",
        after: "After",
      },
    ]);
  });
});
