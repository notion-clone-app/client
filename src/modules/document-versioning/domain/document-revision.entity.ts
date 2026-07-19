import type { DocumentBlock } from "@/shared/editor";

export type DocumentRevisionReason = "automatic" | "manual" | "restore";

/** Immutable editor snapshot stored independently from a mutable working copy. */
export type DocumentRevisionSnapshot = Readonly<{
  schemaVersion: 1;
  title: string;
  coverImage?: string | undefined;
  blocks: readonly DocumentBlock[];
}>;

/** A durable point in one document's linear history. */
export type DocumentRevision = Readonly<{
  id: string;
  workspaceId: string;
  documentId: string;
  parentRevisionId: string | null;
  authorId: string;
  reason: DocumentRevisionReason;
  createdAt: string;
  snapshot: DocumentRevisionSnapshot;
}>;
