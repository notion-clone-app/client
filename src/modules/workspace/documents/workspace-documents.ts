import type { WorkspaceDocument } from "./workspace-document.entity";

export const workspaceDocuments: readonly WorkspaceDocument[] = [
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
