import type { DocumentRevisionSnapshot } from "@/modules/document-versioning";
import type { WorkspaceDocumentContent } from "../model/workspace-document-content.entity";

/** Maps the mutable workspace working copy to the public versioning boundary. */
export function toDocumentRevisionSnapshot(
  document: WorkspaceDocumentContent,
): DocumentRevisionSnapshot {
  return {
    schemaVersion: 1,
    title: document.title,
    coverImage: document.coverImage,
    blocks: document.blocks,
  };
}
