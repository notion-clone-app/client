import type { WorkspaceDocumentContent } from "./workspace-document-content.entity";

type CreateEmptyWorkspaceDocumentOptions = Readonly<{
  id?: string;
  workspaceId: string;
  authorId: string;
  now?: string;
}>;

/** Creates a new document aggregate with the first editable paragraph. */
export function createEmptyWorkspaceDocument({
  id = crypto.randomUUID(),
  workspaceId,
  authorId,
  now = new Date().toISOString(),
}: CreateEmptyWorkspaceDocumentOptions): WorkspaceDocumentContent {
  return {
    schemaVersion: 1,
    id,
    workspaceId,
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
