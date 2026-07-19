import type { WorkspaceDocument } from "./model/workspace-document.entity";

/** Finds a document node recursively in the workspace navigation tree. */
export function findWorkspaceDocument(
  documents: readonly WorkspaceDocument[],
  documentId: string,
): WorkspaceDocument | null {
  for (const document of documents) {
    if (document.id === documentId) return document;

    const child = document.children ? findWorkspaceDocument(document.children, documentId) : null;
    if (child) return child;
  }

  return null;
}
