import { describe, expect, it } from "vitest";
import { findWorkspaceDocument, workspaceDocuments } from "./workspace-documents";

describe("findWorkspaceDocument", () => {
  it("finds a nested document by id", () => {
    expect(findWorkspaceDocument(workspaceDocuments, "architecture")?.title).toBe(
      "System architecture",
    );
  });

  it("returns null for an unknown id", () => {
    expect(findWorkspaceDocument(workspaceDocuments, "missing")).toBeNull();
  });
});
