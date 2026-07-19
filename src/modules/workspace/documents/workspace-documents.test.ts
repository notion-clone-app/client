import { describe, expect, it } from "vitest";
import type { WorkspaceDocument } from "./model/workspace-document.entity";
import { findWorkspaceDocument } from "./workspace-documents";

const documents: readonly WorkspaceDocument[] = [
  {
    id: "folder",
    title: "Folder",
    type: "folder",
    state: "published",
    spaceId: "space-1",
    children: [
      {
        id: "architecture",
        title: "System architecture",
        type: "document-board",
        state: "published",
        spaceId: "space-1",
      },
    ],
  },
];

describe("findWorkspaceDocument", () => {
  it("finds a nested document by id", () => {
    expect(findWorkspaceDocument(documents, "architecture")?.title).toBe("System architecture");
  });

  it("returns null for an unknown id", () => {
    expect(findWorkspaceDocument(documents, "missing")).toBeNull();
  });
});
