import { describe, expect, it } from "vitest";
import type { WorkspaceDocument } from "./workspace-document.entity";
import { filterWorkspaceDocumentTree, flattenWorkspaceDocuments } from "./workspace-document-tree";

const documents: readonly WorkspaceDocument[] = [
  {
    id: "product",
    title: "Product",
    type: "folder",
    state: "published",
    spaceId: "space-1",
    children: [
      {
        id: "research",
        title: "User research",
        type: "document-board",
        state: "published",
        spaceId: "space-1",
      },
      {
        id: "decisions",
        title: "Architecture decisions",
        type: "document-board",
        state: "published",
        spaceId: "space-1",
      },
    ],
  },
];

describe("workspace document tree", () => {
  it("retains a folder when a descendant matches search", () => {
    const result = filterWorkspaceDocumentTree(documents, "User research");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "product" });
    expect(result[0]?.children?.[0]).toMatchObject({ id: "research" });
  });

  it("flattens nested documents for global search", () => {
    expect(flattenWorkspaceDocuments(documents).some((item) => item.id === "decisions")).toBe(true);
  });
});
