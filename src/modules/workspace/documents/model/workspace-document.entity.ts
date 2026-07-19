export type WorkspaceDocumentType = "document-board" | "draw-board" | "folder";
export type WorkspaceDocumentState = "draft" | "published";

/** Lightweight document node used by workspace navigation and routing. */
export type WorkspaceDocument = Readonly<{
  id: string;
  title: string;
  type: WorkspaceDocumentType;
  state: WorkspaceDocumentState;
  spaceId: string | null;
  parentDocumentId?: string | undefined;
  sourceDocumentId?: string | undefined;
  children?: readonly WorkspaceDocument[];
}>;
