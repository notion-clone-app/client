import type { WorkspaceDocument } from "./model/workspace-document.entity";

/** Temporary navigation seed used until workspace documents come from the API. */
export const demoWorkspaceDocuments: readonly WorkspaceDocument[] = [
  {
    id: "product",
    title: "Product notes",
    type: "document-board",
    children: [
      { id: "roadmap", title: "Roadmap sketch", type: "draw-board" },
      { id: "research", title: "User research", type: "document-board" },
    ],
  },
  {
    id: "engineering",
    title: "Engineering wiki",
    type: "document-board",
    children: [
      { id: "architecture", title: "System architecture", type: "draw-board" },
      { id: "decisions", title: "Architecture decisions", type: "document-board" },
    ],
  },
  { id: "ideas", title: "Ideas canvas", type: "draw-board" },
];

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
