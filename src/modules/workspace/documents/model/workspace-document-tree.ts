import type { WorkspaceDocument } from "./workspace-document.entity";

/** Flattens navigation nodes while preserving their original objects. */
export function flattenWorkspaceDocuments(
  documents: readonly WorkspaceDocument[],
): readonly WorkspaceDocument[] {
  return documents.flatMap((document) => [
    document,
    ...(document.children ? flattenWorkspaceDocuments(document.children) : []),
  ]);
}

/** Filters a navigation tree and retains ancestors of matching descendants. */
export function filterWorkspaceDocumentTree(
  documents: readonly WorkspaceDocument[],
  query: string,
): readonly WorkspaceDocument[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return documents;

  return documents.flatMap((document) => {
    const children = document.children
      ? filterWorkspaceDocumentTree(document.children, normalizedQuery)
      : [];
    if (document.title.toLocaleLowerCase().includes(normalizedQuery) || children.length) {
      return [{ ...document, ...(children.length ? { children } : {}) }];
    }
    return [];
  });
}
