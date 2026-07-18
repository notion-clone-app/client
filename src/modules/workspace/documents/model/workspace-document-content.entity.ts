import type { DocumentBlock } from "@/shared/editor";

export type WorkspaceDocumentMetadata = Readonly<{
  revision: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}>;

/**
 * Workspace-owned document aggregate persisted locally and, eventually, remotely.
 *
 * The shared editor owns the block schema. Workspace ownership, audit metadata,
 * page presentation and persistence identity belong to this business context.
 */
export type WorkspaceDocumentContent = Readonly<{
  schemaVersion: 1;
  id: string;
  workspaceId: string;
  title: string;
  coverImage?: string | undefined;
  metadata: WorkspaceDocumentMetadata;
  blocks: readonly DocumentBlock[];
}>;
