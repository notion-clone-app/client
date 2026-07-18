import type { EditorDocument } from "./editor-document";

type CreateEmptyDocumentOptions = Readonly<{
  id?: string;
  workspaceId: string;
  authorId: string;
  now?: string;
}>;

export function createEmptyDocument({
  id = crypto.randomUUID(),
  workspaceId,
  authorId,
  now = new Date().toISOString(),
}: CreateEmptyDocumentOptions): EditorDocument {
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
