import { FileText, PenTool, type LucideIcon } from "lucide-react";
import type { WorkspaceDocumentType } from "../model/workspace-document.entity";

type DocumentPresentation = Readonly<{
  icon: LucideIcon;
  label: string;
  iconClassName: string;
}>;

const presentations: Record<WorkspaceDocumentType, DocumentPresentation> = {
  "document-board": {
    icon: FileText,
    label: "Document board",
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
  "draw-board": {
    icon: PenTool,
    label: "Draw board",
    iconClassName: "text-violet-600 dark:text-violet-400",
  },
};

/** Returns the UI strategy associated with a workspace document type. */
export function getDocumentPresentation(type: WorkspaceDocumentType): DocumentPresentation {
  return presentations[type];
}
