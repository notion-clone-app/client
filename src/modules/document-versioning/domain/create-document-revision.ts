import type {
  DocumentRevision,
  DocumentRevisionReason,
  DocumentRevisionSnapshot,
} from "./document-revision.entity";

type CreateDocumentRevisionInput = Readonly<{
  workspaceId: string;
  documentId: string;
  authorId: string;
  reason: DocumentRevisionReason;
  snapshot: DocumentRevisionSnapshot;
  previousRevision: DocumentRevision | null;
  revisionId?: string;
  createdAt?: string;
}>;

/**
 * Creates an immutable checkpoint unless the working copy is identical to its latest revision.
 * Parent links preserve enough lineage to introduce change proposals without exposing branches now.
 */
export function createDocumentRevision({
  workspaceId,
  documentId,
  authorId,
  reason,
  snapshot,
  previousRevision,
  revisionId = crypto.randomUUID(),
  createdAt = new Date().toISOString(),
}: CreateDocumentRevisionInput): DocumentRevision | null {
  if (previousRevision && snapshotsEqual(previousRevision.snapshot, snapshot)) return null;

  return {
    id: revisionId,
    workspaceId,
    documentId,
    parentRevisionId: previousRevision?.id ?? null,
    authorId,
    reason,
    createdAt,
    snapshot: cloneSnapshot(snapshot),
  };
}

function snapshotsEqual(left: DocumentRevisionSnapshot, right: DocumentRevisionSnapshot) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function cloneSnapshot(snapshot: DocumentRevisionSnapshot): DocumentRevisionSnapshot {
  return structuredClone(snapshot);
}
