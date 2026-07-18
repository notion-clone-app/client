export type WorkspaceDocumentType = "document-board" | "draw-board";

/** Lightweight document node used by workspace navigation and routing. */
export type WorkspaceDocument = Readonly<{
  id: string;
  title: string;
  type: WorkspaceDocumentType;
  children?: readonly WorkspaceDocument[];
}>;
