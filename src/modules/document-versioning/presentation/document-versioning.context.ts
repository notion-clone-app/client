import { createContext } from "react";
import type {
  DocumentRevision,
  DocumentRevisionReason,
  DocumentRevisionSnapshot,
} from "../domain/document-revision.entity";

export type DocumentVersioning = Readonly<{
  isHydrated: boolean;
  getDocumentRevisions: (documentId: string) => readonly DocumentRevision[];
  createCheckpoint: (
    documentId: string,
    snapshot: DocumentRevisionSnapshot,
    reason?: DocumentRevisionReason,
  ) => DocumentRevision | null;
  scheduleCheckpoint: (documentId: string, snapshot: DocumentRevisionSnapshot) => void;
}>;

export const DocumentVersioningContext = createContext<DocumentVersioning | null>(null);
