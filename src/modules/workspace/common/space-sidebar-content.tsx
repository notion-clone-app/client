import type { FC } from "react";
import { ArrowLeft, FileText, Layers3, Plus, Search } from "lucide-react";
import type { WorkspaceDocument } from "../documents/model/workspace-document.entity";
import { flattenWorkspaceDocuments } from "../documents/model/workspace-document-tree";
import { getDocumentPresentation } from "../documents/ui/document-presentation.strategy";
import type { WorkspaceSpace } from "../spaces/model/workspace-space.entity";
type Props = Readonly<{
  space: WorkspaceSpace;
  documents: readonly WorkspaceDocument[];
  selectedDocumentId: string | null;
  onBack: () => void;
  onOpenSearch: () => void;
  onOpenDocument: (document: WorkspaceDocument) => void;
  onCreatePage: () => void;
}>;

/** Contextual navigation shown while the user works inside one space. */
export const SpaceSidebarContent: FC<Props> = ({
  space,
  documents,
  selectedDocumentId,
  onBack,
  onOpenSearch,
  onOpenDocument,
  onCreatePage,
}) => {
  const spaceDocuments = flattenWorkspaceDocuments(documents).filter(
    (document) => document.spaceId === space.id && document.type !== "folder",
  );
  const visibleDocuments = spaceDocuments.filter((document) => document.state === "published");

  return (
    <div className="flex min-h-0 w-full flex-col p-2">
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg px-2 text-xs text-sidebar-foreground/65 hover:bg-sidebar-accent"
        onClick={onBack}
      >
        <ArrowLeft className="size-3.5" /> Workspace
      </button>

      <div className="mt-2 flex h-11 items-center gap-2 rounded-xl px-2">
        <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Layers3 className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{space.title}</span>
      </div>

      <nav aria-label={`${space.title} navigation`} className="mt-3 space-y-0.5">
        <SpaceNavItem active icon={FileText} label="Content" onClick={() => undefined} />
        <SpaceNavItem active={false} icon={Search} label="Search" onClick={onOpenSearch} />
      </nav>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-sidebar-foreground/50">Pages</span>
          <button
            type="button"
            aria-label="Create document"
            className="grid size-6 place-items-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={onCreatePage}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="mt-1 min-h-0 space-y-0.5 overflow-y-auto">
          {visibleDocuments.map((document) => {
            const presentation = getDocumentPresentation(document.type);
            const Icon = presentation.icon;
            return (
              <button
                key={document.id}
                type="button"
                className={`flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-sm ${selectedDocumentId === document.id ? "bg-sidebar-accent font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70"}`}
                onClick={() => onOpenDocument(document)}
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{document.title}</span>
              </button>
            );
          })}
          {!visibleDocuments.length && (
            <p className="px-2 py-3 text-xs leading-5 text-sidebar-foreground/45">
              Create the first page in this space.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function SpaceNavItem({
  active,
  icon: Icon,
  label,
  onClick,
}: Readonly<{ active: boolean; icon: typeof FileText; label: string; onClick: () => void }>) {
  return (
    <button
      type="button"
      className={`flex h-8 w-full items-center gap-2 rounded-lg px-2 text-sm ${active ? "bg-sidebar-accent font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70"}`}
      onClick={onClick}
    >
      <Icon className="size-4" /> {label}
    </button>
  );
}
