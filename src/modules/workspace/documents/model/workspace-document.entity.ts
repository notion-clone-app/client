export type WorkspaceDocumentType = "document-board" | "draw-board" | "folder";
type WorkspaceDocumentState = "draft" | "published";

/** User-facing partition for published workspace knowledge. */
export type WorkspaceSubspace = Readonly<{
  id: string;
  title: string;
}>;

export const demoWorkspaceSubspaces: readonly WorkspaceSubspace[] = [
  { id: "tech", title: "Tech" },
  { id: "business", title: "Business" },
];

/** Lightweight document node used by workspace navigation and routing. */
export type WorkspaceDocument = Readonly<{
  id: string;
  title: string;
  type: WorkspaceDocumentType;
  state: WorkspaceDocumentState;
  spaceId: WorkspaceSubspace["id"] | null;
  sourceDocumentId?: string | undefined;
  children?: readonly WorkspaceDocument[];
}>;
