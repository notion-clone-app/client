import { describe, expect, it } from "vitest";
import { createEmptyDocument, listLocalDocuments, saveLocalDocument } from "@/shared/editor";

describe("local document repository", () => {
  it("persists and lists a document from the local-first fallback", async () => {
    const document = createEmptyDocument({
      id: "offline-document",
      workspaceId: "offline-workspace",
      authorId: "user-1",
      now: "2026-07-18T12:00:00.000Z",
    });

    await saveLocalDocument(document);

    await expect(listLocalDocuments("offline-workspace")).resolves.toContainEqual(document);
  });
});
