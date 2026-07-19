import type { DocumentRevision } from "../domain/document-revision.entity";

/** Persistence boundary for immutable document history. */
export interface DocumentRevisionRepository {
  list(workspaceId: string): Promise<readonly DocumentRevision[]>;
  save(revision: DocumentRevision): Promise<void>;
}
