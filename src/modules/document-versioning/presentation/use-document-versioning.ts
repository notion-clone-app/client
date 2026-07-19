import { useContext } from "react";
import { DocumentVersioningContext } from "./document-versioning.context";

/** Reads versioning without coupling consumers to a workspace-level service context. */
export function useDocumentVersioning() {
  const context = useContext(DocumentVersioningContext);
  if (!context) throw new Error("useDocumentVersioning must be used inside its provider");
  return context;
}
