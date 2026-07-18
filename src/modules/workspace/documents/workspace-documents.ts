import type { WorkspaceDocument } from "./model/workspace-document.entity";

/** Temporary navigation seed used until workspace documents come from the API. */
export const demoWorkspaceDocuments: readonly WorkspaceDocument[] = [
  {
    id: "release-notes-draft",
    title: "Release notes draft",
    type: "document-board",
    state: "draft",
    spaceId: "business",
  },
  {
    id: "product",
    title: "Product",
    type: "folder",
    state: "published",
    spaceId: "business",
    children: [
      {
        id: "product-notes",
        title: "Product notes",
        type: "document-board",
        state: "published",
        spaceId: "business",
      },
      {
        id: "roadmap",
        title: "Roadmap sketch",
        type: "draw-board",
        state: "published",
        spaceId: "business",
      },
      {
        id: "research",
        title: "User research",
        type: "document-board",
        state: "published",
        spaceId: "business",
      },
    ],
  },
  {
    id: "engineering",
    title: "Engineering",
    type: "folder",
    state: "published",
    spaceId: "tech",
    children: [
      {
        id: "architecture",
        title: "System architecture",
        type: "draw-board",
        state: "published",
        spaceId: "tech",
      },
      {
        id: "decisions",
        title: "Architecture decisions",
        type: "document-board",
        state: "published",
        spaceId: "tech",
      },
    ],
  },
  {
    id: "ideas",
    title: "Ideas canvas",
    type: "draw-board",
    state: "published",
    spaceId: "business",
  },
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
