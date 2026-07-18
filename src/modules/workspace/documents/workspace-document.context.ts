import { useOutletContext } from "react-router";
import type { EditorDocument } from "@/shared/editor";
import type { WorkspaceDocument } from "./workspace-document.entity";

export type WorkspaceDocumentContext = Readonly<{
  documents: readonly WorkspaceDocument[];
  isHydrated: boolean;
  getEditorDocument: (document: WorkspaceDocument) => EditorDocument;
  updateDocument: (document: EditorDocument) => void;
}>;

export function useWorkspaceDocumentContext() {
  return useOutletContext<WorkspaceDocumentContext>();
}
