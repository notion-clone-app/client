import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/css";
import type { WorkspaceDocument } from "../model/workspace-document.entity";
import { getDocumentPresentation } from "./document-presentation.strategy";

type DocumentTreeProps = {
  documents: readonly WorkspaceDocument[];
  selectedDocumentId: string | null;
  onSelect: (document: WorkspaceDocument) => void;
};

export function DocumentTree({ documents, selectedDocumentId, onSelect }: DocumentTreeProps) {
  return (
    <div aria-label="Documents" role="tree" className="space-y-0.5">
      {documents.map((document) => (
        <DocumentTreeItem
          key={document.id}
          document={document}
          selectedDocumentId={selectedDocumentId}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  );
}

type DocumentTreeItemProps = Omit<DocumentTreeProps, "documents"> & {
  document: WorkspaceDocument;
  depth: number;
};

function DocumentTreeItem({
  document,
  selectedDocumentId,
  onSelect,
  depth,
}: DocumentTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const hasChildren = Boolean(document.children?.length);
  const presentation = getDocumentPresentation(document.type);
  const Icon = presentation.icon;

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={selectedDocumentId === document.id}
    >
      <div
        className={cn(
          "group flex h-8 items-center rounded-lg pr-2 text-sm transition-colors",
          selectedDocumentId === document.id
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        <button
          type="button"
          aria-label={isExpanded ? `Collapse ${document.title}` : `Expand ${document.title}`}
          className={cn(
            "mr-0.5 grid size-5 shrink-0 place-items-center rounded-md hover:bg-black/5 dark:hover:bg-white/5",
            !hasChildren && "invisible",
          )}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <ChevronRight
            className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
          />
        </button>

        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => onSelect(document)}
          title={`${presentation.label}: ${document.title}`}
        >
          <Icon className={cn("size-4 shrink-0", presentation.iconClassName)} />
          <span className="truncate">{document.title}</span>
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {document.children?.map((child) => (
            <DocumentTreeItem
              key={child.id}
              document={child}
              selectedDocumentId={selectedDocumentId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
