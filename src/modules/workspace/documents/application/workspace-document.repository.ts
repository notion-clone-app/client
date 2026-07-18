import type { WorkspaceDocumentContent } from "../model/workspace-document-content.entity";

/** Persistence port used by local-first document application services. */
export interface WorkspaceDocumentRepository {
  list(workspaceId: string): Promise<readonly WorkspaceDocumentContent[]>;
  save(document: WorkspaceDocumentContent): Promise<void>;
}
