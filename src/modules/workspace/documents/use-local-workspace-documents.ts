import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createEmptyDocument,
  listLocalDocuments,
  saveLocalDocument,
  type EditorDocument,
} from "@/shared/editor";
import { createDemoDocumentBoard } from "./demo-document-board";
import type { WorkspaceDocument } from "./workspace-document.entity";
import { findWorkspaceDocument, workspaceDocuments } from "./workspace-documents";

const localWorkspaceId = "local-workspace";

export function useLocalWorkspaceDocuments(authorId: string | undefined) {
  const [localDocuments, setLocalDocuments] = useState<readonly EditorDocument[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    void listLocalDocuments(localWorkspaceId)
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
  }, []);

  const localDocumentById = useMemo(
    () => new Map(localDocuments.map((document) => [document.id, document])),
    [localDocuments],
  );

  const documents = useMemo(() => {
    const updatedDemoDocuments = mergeLocalTitles(workspaceDocuments, localDocumentById);
    const createdDocuments = localDocuments
      .filter((document) => !findWorkspaceDocument(workspaceDocuments, document.id))
      .map(toWorkspaceDocument);

    return [...createdDocuments, ...updatedDemoDocuments];
  }, [localDocumentById, localDocuments]);

  const updateDocument = useCallback((document: EditorDocument) => {
    setLocalDocuments((current) => [
      document,
      ...current.filter((candidate) => candidate.id !== document.id),
    ]);
    void saveLocalDocument(document).catch((error: unknown) => {
      console.error("Failed to save local document", error);
    });
  }, []);

  const createDocument = useCallback(() => {
    if (!authorId) return null;

    const document = createEmptyDocument({ workspaceId: localWorkspaceId, authorId });
    updateDocument(document);
    return document;
  }, [authorId, updateDocument]);

  const getEditorDocument = useCallback(
    (document: WorkspaceDocument) =>
      localDocumentById.get(document.id) ?? createDemoDocumentBoard(document),
    [localDocumentById],
  );

  return {
    documents,
    isHydrated,
    createDocument,
    getEditorDocument,
    updateDocument,
  };
}

function toWorkspaceDocument(document: EditorDocument): WorkspaceDocument {
  return {
    id: document.id,
    title: document.title.trim() || "Untitled",
    type: "document-board",
  };
}

function mergeLocalTitles(
  documents: readonly WorkspaceDocument[],
  localDocumentById: ReadonlyMap<string, EditorDocument>,
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
