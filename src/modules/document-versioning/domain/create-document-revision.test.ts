import { describe, expect, it } from "vitest";
import { createDocumentRevision } from "./create-document-revision";
import type { DocumentRevisionSnapshot } from "./document-revision.entity";

const snapshot: DocumentRevisionSnapshot = {
  schemaVersion: 1,
  title: "Architecture",
  blocks: [
    {
      id: "paragraph-1",
      type: "paragraph",
      options: { bold: false, italic: false },
      content: "Bounded contexts",
    },
  ],
};

describe("createDocumentRevision", () => {
  it("links an immutable checkpoint to the previous revision", () => {
    const first = createDocumentRevision({
      workspaceId: "workspace-1",
      documentId: "document-1",
      authorId: "user-1",
      reason: "manual",
      snapshot,
      previousRevision: null,
      revisionId: "revision-1",
      createdAt: "2026-07-19T12:00:00.000Z",
    });
    expect(first).not.toBeNull();

    const second = createDocumentRevision({
      workspaceId: "workspace-1",
      documentId: "document-1",
      authorId: "user-1",
      reason: "automatic",
      snapshot: { ...snapshot, title: "Architecture v2" },
      previousRevision: first,
      revisionId: "revision-2",
      createdAt: "2026-07-19T12:05:00.000Z",
    });

    expect(second).toMatchObject({ id: "revision-2", parentRevisionId: "revision-1" });
    expect(second?.snapshot).not.toBe(snapshot);
  });

  it("does not create duplicate checkpoints", () => {
    const previous = createDocumentRevision({
      workspaceId: "workspace-1",
      documentId: "document-1",
      authorId: "user-1",
      reason: "manual",
      snapshot,
      previousRevision: null,
    });

    expect(
      createDocumentRevision({
        workspaceId: "workspace-1",
        documentId: "document-1",
        authorId: "user-1",
        reason: "automatic",
        snapshot,
        previousRevision: previous,
      }),
    ).toBeNull();
  });
});
