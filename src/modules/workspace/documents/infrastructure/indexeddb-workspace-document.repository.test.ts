import { describe, expect, it } from "vitest";
import { createEmptyWorkspaceDocument } from "../model/create-empty-workspace-document";
import { indexedDbWorkspaceDocumentRepository } from "./indexeddb-workspace-document.repository";

describe("indexedDbWorkspaceDocumentRepository", () => {
  it("persists and lists a document from the in-memory fallback", async () => {
    const document = createEmptyWorkspaceDocument({
      id: "offline-document",
      workspaceId: "offline-workspace",
      authorId: "user-1",
      now: "2026-07-18T12:00:00.000Z",
    });

    await indexedDbWorkspaceDocumentRepository.save(document);

    await expect(
      indexedDbWorkspaceDocumentRepository.list("offline-workspace"),
    ).resolves.toContainEqual(document);
  });
});
