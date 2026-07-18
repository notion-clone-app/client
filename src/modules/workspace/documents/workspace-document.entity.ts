export type WorkspaceDocumentType = "document-board" | "draw-board";

export type WorkspaceDocument = Readonly<{
  id: string;
  title: string;
  type: WorkspaceDocumentType;
  children?: readonly WorkspaceDocument[];
}>;
