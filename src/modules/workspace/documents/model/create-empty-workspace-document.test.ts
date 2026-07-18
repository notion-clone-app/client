import { describe, expect, it } from "vitest";
import { createEmptyWorkspaceDocument } from "./create-empty-workspace-document";

describe("createEmptyWorkspaceDocument", () => {
  it("creates an untitled workspace document with one empty paragraph", () => {
    const document = createEmptyWorkspaceDocument({
      id: "document-1",
      workspaceId: "workspace-1",
      spaceId: "tech",
      authorId: "user-1",
      now: "2026-07-18T12:00:00.000Z",
    });

    expect(document).toMatchObject({
      id: "document-1",
      workspaceId: "workspace-1",
      spaceId: "tech",
      title: "",
      metadata: { revision: 0, createdBy: "user-1" },
      blocks: [
        {
          type: "paragraph",
          options: { bold: false, italic: false },
          content: "",
        },
      ],
    });
  });
});
