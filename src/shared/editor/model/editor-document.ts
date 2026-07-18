import type { DocumentBlock } from "./document-block";

export type DocumentMetadata = Readonly<{
  revision: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}>;

/**
 * Serializable representation of a document board.
 * Dates remain ISO strings so the same shape can cross API and persistence boundaries.
 */
export type EditorDocument = Readonly<{
  schemaVersion: 1;
  id: string;
  workspaceId: string;
  title: string;
  metadata: DocumentMetadata;
  blocks: readonly DocumentBlock[];
}>;
