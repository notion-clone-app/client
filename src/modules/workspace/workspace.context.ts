import { useOutletContext } from "react-router";
import type { WorkspaceCollaboration } from "./collaboration/application/use-local-workspace-collaboration";
import type { WorkspaceDocumentContent } from "./documents/model/workspace-document-content.entity";
import type { WorkspaceDocument } from "./documents/model/workspace-document.entity";
import type { WorkspaceSpace } from "./spaces/model/workspace-space.entity";

export type WorkspaceContext = Readonly<{
  documents: readonly WorkspaceDocument[];
  spaces: readonly WorkspaceSpace[];
  isHydrated: boolean;
  createSpace: (title: string) => WorkspaceSpace | null;
  updateSpaceCover: (spaceId: string, coverImage: string | undefined) => void;
  createDocument: (spaceId: string) => WorkspaceDocumentContent | null;
  publishDraftToSource: (draftId: string) => void;
  getDocumentContent: (document: WorkspaceDocument) => WorkspaceDocumentContent;
  updateDocument: (document: WorkspaceDocumentContent) => void;
  placeDocument: (documentId: string, targetId: string) => void;
}> &
  WorkspaceCollaboration;

/** Accesses document and collaboration services composed by the workspace route. */
export function useWorkspaceContext() {
  return useOutletContext<WorkspaceContext>();
}
