import { describe, expect, it } from "vitest";
import { demoWorkspaceDocuments, findWorkspaceDocument } from "./workspace-documents";

describe("findWorkspaceDocument", () => {
  it("finds a nested document by id", () => {
    expect(findWorkspaceDocument(demoWorkspaceDocuments, "architecture")?.title).toBe(
      "System architecture",
    );
  });

  it("returns null for an unknown id", () => {
    expect(findWorkspaceDocument(demoWorkspaceDocuments, "missing")).toBeNull();
  });
});
