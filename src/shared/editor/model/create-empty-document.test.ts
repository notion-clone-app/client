import { describe, expect, it } from "vitest";
import { createEmptyDocument } from "@/shared/editor";

describe("createEmptyDocument", () => {
  it("creates an untitled local document with one empty paragraph", () => {
    const document = createEmptyDocument({
      id: "document-1",
      workspaceId: "workspace-1",
      authorId: "user-1",
      now: "2026-07-18T12:00:00.000Z",
    });

    expect(document).toMatchObject({
      id: "document-1",
      workspaceId: "workspace-1",
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
