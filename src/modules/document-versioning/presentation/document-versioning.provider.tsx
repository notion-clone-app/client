import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { DocumentRevisionRepository } from "../application/document-revision.repository.port";
import { createDocumentRevision } from "../domain/create-document-revision";
import type {
  DocumentRevision,
  DocumentRevisionReason,
  DocumentRevisionSnapshot,
} from "../domain/document-revision.entity";
import { DocumentVersioningContext, type DocumentVersioning } from "./document-versioning.context";

const automaticCheckpointDelay = 2_000;

type DocumentVersioningProviderProps = Readonly<{
  workspaceId: string;
  authorId: string | undefined;
  repository: DocumentRevisionRepository;
  children: ReactNode;
}>;

/** Composes the revision domain with local persistence and editor-friendly checkpoint scheduling. */
export function DocumentVersioningProvider({
  workspaceId,
  authorId,
  repository,
  children,
}: DocumentVersioningProviderProps) {
  const [revisions, setRevisions] = useState<readonly DocumentRevision[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const revisionsRef = useRef(revisions);
  const pendingCheckpointsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    revisionsRef.current = revisions;
  }, [revisions]);

  useEffect(() => {
    let isCurrent = true;
    void repository
      .list(workspaceId)
      .then((storedRevisions) => {
        if (isCurrent) {
          setRevisions((current) => {
            const currentIds = new Set(current.map((revision) => revision.id));
            return sortRevisions([
              ...current,
              ...storedRevisions.filter((revision) => !currentIds.has(revision.id)),
            ]);
          });
        }
      })
      .catch((error: unknown) => console.error("Failed to read document revisions", error))
      .finally(() => {
        if (isCurrent) setIsHydrated(true);
      });

    return () => {
      isCurrent = false;
    };
  }, [repository, workspaceId]);

  useEffect(
    () => () => {
      for (const timeout of pendingCheckpointsRef.current.values()) clearTimeout(timeout);
    },
    [],
  );

  const getDocumentRevisions = useCallback(
    (documentId: string) => revisions.filter((revision) => revision.documentId === documentId),
    [revisions],
  );

  const createCheckpoint = useCallback(
    (
      documentId: string,
      snapshot: DocumentRevisionSnapshot,
      reason: DocumentRevisionReason = "manual",
    ) => {
      if (!authorId) return null;
      const pending = pendingCheckpointsRef.current.get(documentId);
      if (pending) {
        clearTimeout(pending);
        pendingCheckpointsRef.current.delete(documentId);
      }
      const previousRevision = revisionsRef.current.find(
        (revision) => revision.documentId === documentId,
      );
      const revision = createDocumentRevision({
        workspaceId,
        documentId,
        authorId,
        reason,
        snapshot,
        previousRevision: previousRevision ?? null,
      });
      if (!revision) return null;

      const nextRevisions = sortRevisions([revision, ...revisionsRef.current]);
      revisionsRef.current = nextRevisions;
      setRevisions(nextRevisions);
      void repository
        .save(revision)
        .catch((error: unknown) => console.error("Failed to persist document revision", error));
      return revision;
    },
    [authorId, repository, workspaceId],
  );

  const scheduleCheckpoint = useCallback(
    (documentId: string, snapshot: DocumentRevisionSnapshot) => {
      const pending = pendingCheckpointsRef.current.get(documentId);
      if (pending) clearTimeout(pending);

      pendingCheckpointsRef.current.set(
        documentId,
        setTimeout(() => {
          pendingCheckpointsRef.current.delete(documentId);
          createCheckpoint(documentId, snapshot, "automatic");
        }, automaticCheckpointDelay),
      );
    },
    [createCheckpoint],
  );

  const value = useMemo<DocumentVersioning>(
    () => ({ isHydrated, getDocumentRevisions, createCheckpoint, scheduleCheckpoint }),
    [createCheckpoint, getDocumentRevisions, isHydrated, scheduleCheckpoint],
  );

  return (
    <DocumentVersioningContext.Provider value={value}>
      {children}
    </DocumentVersioningContext.Provider>
  );
}

function sortRevisions(revisions: readonly DocumentRevision[]) {
  return revisions.toSorted((left, right) => right.createdAt.localeCompare(left.createdAt));
}
