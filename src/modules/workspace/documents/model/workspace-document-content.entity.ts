import type { DocumentBlock } from "@/shared/editor";
import type { WorkspaceDocumentState, WorkspaceDocumentType } from "./workspace-document.entity";

type WorkspaceDocumentMetadata = Readonly<{
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
  spaceId: string | null;
  documentType: WorkspaceDocumentType;
  state: WorkspaceDocumentState;
  parentDocumentId?: string | undefined;
  /** Published document this draft was forked from. */
  sourceDocumentId?: string | undefined;
  title: string;
  coverImage?: string | undefined;
  metadata: WorkspaceDocumentMetadata;
  blocks: readonly DocumentBlock[];
}>;
