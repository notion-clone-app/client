import type { WorkspaceDocumentContent } from "./workspace-document-content.entity";
import type { WorkspaceDocumentState } from "./workspace-document.entity";

type CreateEmptyWorkspaceDocumentOptions = Readonly<{
  id?: string;
  workspaceId: string;
  spaceId: string;
  authorId: string;
  state?: WorkspaceDocumentState;
  now?: string;
}>;

/** Creates a new document aggregate with the first editable paragraph. */
export function createEmptyWorkspaceDocument({
  id = crypto.randomUUID(),
  workspaceId,
  spaceId,
  authorId,
  state = "published",
  now = new Date().toISOString(),
}: CreateEmptyWorkspaceDocumentOptions): WorkspaceDocumentContent {
  return {
    schemaVersion: 1,
    id,
    workspaceId,
    spaceId,
    documentType: "document-board",
    state,
    title: "",
    metadata: {
      revision: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: authorId,
      updatedBy: authorId,
    },
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "paragraph",
        options: { bold: false, italic: false },
        content: "",
      },
    ],
  };
}
