import { useCallback, useEffect, useMemo, useState } from "react";
import { createDemoDocumentBoard } from "../demo-document-board";
import { createEmptyWorkspaceDocument } from "../model/create-empty-workspace-document";
import type { WorkspaceDocumentContent } from "../model/workspace-document-content.entity";
import type { WorkspaceDocument } from "../model/workspace-document.entity";
import { demoWorkspaceDocuments, findWorkspaceDocument } from "../workspace-documents";
import type { WorkspaceDocumentRepository } from "./workspace-document.repository";

const localWorkspaceId = "local-workspace";

/**
 * Coordinates optimistic workspace document state with a replaceable persistence adapter.
 * UI state is updated before repository writes, preserving instant offline interactions.
 */
export function useLocalWorkspaceDocuments(
  authorId: string | undefined,
  repository: WorkspaceDocumentRepository,
) {
  const [localDocuments, setLocalDocuments] = useState<readonly WorkspaceDocumentContent[]>([]);
  const [publishedTargets, setPublishedTargets] = useState<ReadonlyMap<string, string>>(new Map());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void repository
      .list(localWorkspaceId)
      .then((documents) => {
        if (isCurrent) {
          setLocalDocuments((current) => [
            ...current,
            ...documents.filter(
              (document) => !current.some((candidate) => candidate.id === document.id),
            ),
          ]);
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

  const documents = useMemo(() => {
    const updatedDemoDocuments = mergeLocalTitles(demoWorkspaceDocuments, localDocumentById);
    const createdDocuments = localDocuments
      .filter((document) => !findWorkspaceDocument(demoWorkspaceDocuments, document.id))
      .map(toWorkspaceDocument);

    const documentTree: readonly WorkspaceDocument[] = [
      ...createdDocuments,
      ...updatedDemoDocuments,
    ];
    return [...publishedTargets].reduce<readonly WorkspaceDocument[]>(
      (current, [documentId, targetId]) => placeWorkspaceDocument(current, documentId, targetId),
      documentTree,
    );
  }, [localDocumentById, localDocuments, publishedTargets]);

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

  const createDocument = useCallback(() => {
    if (!authorId) return null;

    const document = createEmptyWorkspaceDocument({ workspaceId: localWorkspaceId, authorId });
    updateDocument(document);
    return document;
  }, [authorId, updateDocument]);

  const getDocumentContent = useCallback(
    (document: WorkspaceDocument) =>
      localDocumentById.get(document.id) ?? createDemoDocumentBoard(document),
    [localDocumentById],
  );

  const placeDocument = useCallback((documentId: string, targetId: string) => {
    setPublishedTargets((current) => new Map(current).set(documentId, targetId));
  }, []);

  return {
    documents,
    isHydrated,
    createDocument,
    getDocumentContent,
    updateDocument,
    placeDocument,
  };
}

function placeWorkspaceDocument(
  documents: readonly WorkspaceDocument[],
  documentId: string,
  targetId: string,
): readonly WorkspaceDocument[] {
  if (documentId === targetId) return documents;
  const document = findWorkspaceDocument(documents, documentId);
  const target = findWorkspaceDocument(documents, targetId);
  if (!document || !target || findWorkspaceDocument(document.children ?? [], targetId))
    return documents;

  const withoutDocument = removeWorkspaceDocument(documents, documentId);
  return appendWorkspaceDocument(withoutDocument, targetId, document);
}

function appendWorkspaceDocument(
  documents: readonly WorkspaceDocument[],
  targetId: string,
  document: WorkspaceDocument,
): readonly WorkspaceDocument[] {
  return documents.map((candidate) =>
    candidate.id === targetId
      ? { ...candidate, children: [...(candidate.children ?? []), document] }
      : {
          ...candidate,
          ...(candidate.children
            ? { children: appendWorkspaceDocument(candidate.children, targetId, document) }
            : {}),
        },
  );
}

function removeWorkspaceDocument(
  documents: readonly WorkspaceDocument[],
  documentId: string,
): readonly WorkspaceDocument[] {
  return documents
    .filter((document) => document.id !== documentId)
    .map((document) => ({
      ...document,
      ...(document.children
        ? { children: removeWorkspaceDocument(document.children, documentId) }
        : {}),
    }));
}

function toWorkspaceDocument(document: WorkspaceDocumentContent): WorkspaceDocument {
  return {
    id: document.id,
    title: document.title.trim() || "Untitled",
    type: "document-board",
  };
}

function mergeLocalTitles(
  documents: readonly WorkspaceDocument[],
  localDocumentById: ReadonlyMap<string, WorkspaceDocumentContent>,
): readonly WorkspaceDocument[] {
  return documents.map((document) => {
    const localDocument = localDocumentById.get(document.id);
    const localTitle = localDocument?.title.trim();
    return {
      ...document,
      title: localTitle && localTitle.length > 0 ? localTitle : document.title,
      ...(document.children
        ? { children: mergeLocalTitles(document.children, localDocumentById) }
        : {}),
    };
  });
}
