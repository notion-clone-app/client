import { useCallback, useEffect, useMemo, useState } from "react";
import { createEmptyWorkspaceDocument } from "../model/create-empty-workspace-document";
import type { WorkspaceDocumentContent } from "../model/workspace-document-content.entity";
import type { WorkspaceDocument } from "../model/workspace-document.entity";
import { findWorkspaceDocument } from "../workspace-documents";
import type { WorkspaceDocumentRepository } from "./workspace-document.repository";

const localWorkspaceId = "local-workspace";
const legacySeedDocumentIds = new Set([
  "release-notes-draft",
  "product",
  "product-notes",
  "roadmap",
  "research",
  "engineering",
  "architecture",
  "decisions",
  "ideas",
]);

/**
 * Coordinates optimistic workspace document state with a replaceable persistence adapter.
 * UI state is updated before repository writes, preserving instant offline interactions.
 */
export function useLocalWorkspaceDocuments(
  authorId: string | undefined,
  repository: WorkspaceDocumentRepository,
) {
  const [localDocuments, setLocalDocuments] = useState<readonly WorkspaceDocumentContent[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void repository
      .list(localWorkspaceId)
      .then((documents) => {
        if (isCurrent) {
          const legacyDocuments = documents.filter((document) =>
            legacySeedDocumentIds.has(document.id),
          );
          const migratedDocuments = documents
            .filter((document) => !legacySeedDocumentIds.has(document.id))
            .map(migrateLocalDocument);
          setLocalDocuments((current) => [
            ...current,
            ...migratedDocuments.filter(
              (document) => !current.some((candidate) => candidate.id === document.id),
            ),
          ]);
          void Promise.all(legacyDocuments.map((document) => repository.remove(document.id))).catch(
            (error: unknown) => console.error("Failed to remove legacy seed documents", error),
          );
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to read local documents", error);
      })
      .finally(() => {
        if (isCurrent) setIsHydrated(true);
      });

    return () => {
      isCurrent = false;
    };
  }, [repository]);

  const localDocumentById = useMemo(
    () => new Map(localDocuments.map((document) => [document.id, document])),
    [localDocuments],
  );

  const documents = useMemo(
    () => buildDocumentTree(localDocuments.map(toWorkspaceDocument)),
    [localDocuments],
  );

  const updateDocument = useCallback(
    (document: WorkspaceDocumentContent) => {
      setLocalDocuments((current) => [
        document,
        ...current.filter((candidate) => candidate.id !== document.id),
      ]);
      void repository.save(document).catch((error: unknown) => {
        console.error("Failed to save local document", error);
      });
    },
    [repository],
  );

  const createDocument = useCallback(
    (spaceId: string) => {
      if (!authorId) return null;

      const document = createEmptyWorkspaceDocument({
        workspaceId: localWorkspaceId,
        spaceId,
        authorId,
        state: "published",
      });
      updateDocument(document);
      return document;
    },
    [authorId, updateDocument],
  );

  const publishDraftToSource = useCallback(
    (draftId: string) => {
      const draft = localDocumentById.get(draftId);
      if (!draft?.sourceDocumentId) return;
      const sourceNode = findWorkspaceDocument(documents, draft.sourceDocumentId);
      if (!sourceNode) return;
      const source = localDocumentById.get(sourceNode.id);
      if (!source) return;
      const published: WorkspaceDocumentContent = {
        ...draft,
        id: source.id,
        sourceDocumentId: undefined,
        metadata: {
          ...source.metadata,
          revision: source.metadata.revision + 1,
          updatedAt: new Date().toISOString(),
          updatedBy: draft.metadata.updatedBy,
        },
      };

      setLocalDocuments((current) => [
        published,
        ...current.filter((document) => document.id !== draftId && document.id !== source.id),
      ]);
      void Promise.all([repository.save(published), repository.remove(draftId)]).catch(
        (error: unknown) => console.error("Failed to publish local draft", error),
      );
    },
    [documents, localDocumentById, repository],
  );

  const getDocumentContent = useCallback(
    (document: WorkspaceDocument) => {
      const content = localDocumentById.get(document.id);
      if (!content) throw new Error(`Missing local document content for ${document.id}`);
      return content;
    },
    [localDocumentById],
  );

  const placeDocument = useCallback(
    (documentId: string, targetId: string) => {
      const document = localDocumentById.get(documentId);
      if (!document) return;
      const target = findWorkspaceDocument(documents, targetId);
      updateDocument({
        ...document,
        state: "published",
        spaceId: target?.spaceId ?? targetId,
        parentDocumentId: target ? target.id : undefined,
        sourceDocumentId: undefined,
        metadata: {
          ...document.metadata,
          revision: Math.max(1, document.metadata.revision),
          updatedAt: new Date().toISOString(),
        },
      });
    },
    [documents, localDocumentById, updateDocument],
  );

  return {
    documents,
    isHydrated,
    createDocument,
    publishDraftToSource,
    getDocumentContent,
    updateDocument,
    placeDocument,
  };
}

function migrateLocalDocument(document: WorkspaceDocumentContent): WorkspaceDocumentContent {
  const legacyShape: {
    documentType?: WorkspaceDocumentContent["documentType"];
  } = document;
  return {
    ...document,
    spaceId: document.spaceId ?? null,
    documentType: legacyShape.documentType ?? "document-board",
    state: "published",
  };
}

function toWorkspaceDocument(document: WorkspaceDocumentContent): WorkspaceDocument {
  return {
    id: document.id,
    title: document.title.trim() || "Untitled",
    type: document.documentType,
    state: document.state,
    spaceId: document.spaceId,
    parentDocumentId: document.parentDocumentId,
    sourceDocumentId: document.sourceDocumentId,
  };
}

function buildDocumentTree(documents: readonly WorkspaceDocument[]): readonly WorkspaceDocument[] {
  const byParent = new Map<string, WorkspaceDocument[]>();
  const documentIds = new Set(documents.map((document) => document.id));

  for (const document of documents) {
    const parentId = document.parentDocumentId;
    if (!parentId || !documentIds.has(parentId)) continue;
    byParent.set(parentId, [...(byParent.get(parentId) ?? []), document]);
  }

  const attachChildren = (document: WorkspaceDocument): WorkspaceDocument => {
    const children = byParent.get(document.id)?.map(attachChildren);
    return { ...document, ...(children?.length ? { children } : {}) };
  };

  return documents
    .filter((document) => !document.parentDocumentId || !documentIds.has(document.parentDocumentId))
    .map(attachChildren);
}
