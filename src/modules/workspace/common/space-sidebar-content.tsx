import type { FC } from "react";
import {
  ArrowLeft,
  FileText,
  GitPullRequest,
  Layers3,
  Plus,
  Search,
  SquarePen,
} from "lucide-react";
import type { WorkspaceDocument } from "../documents/model/workspace-document.entity";
import { flattenWorkspaceDocuments } from "../documents/model/workspace-document-tree";
import { getDocumentPresentation } from "../documents/ui/document-presentation.strategy";
import type { WorkspaceSpace } from "../spaces/model/workspace-space.entity";

type SpaceView = "content" | "drafts" | "reviews";

type Props = Readonly<{
  space: WorkspaceSpace;
  documents: readonly WorkspaceDocument[];
  selectedDocumentId: string | null;
  activeView: SpaceView;
  onBack: () => void;
  onOpenSearch: () => void;
  onOpenView: (view: SpaceView) => void;
  onOpenDocument: (document: WorkspaceDocument) => void;
  onCreateDocument: () => void;
}>;

/** Contextual navigation shown while the user works inside one space. */
export const SpaceSidebarContent: FC<Props> = ({
  space,
  documents,
  selectedDocumentId,
  activeView,
  onBack,
  onOpenSearch,
  onOpenView,
  onOpenDocument,
  onCreateDocument,
}) => {
  const spaceDocuments = flattenWorkspaceDocuments(documents).filter(
    (document) => document.spaceId === space.id && document.type !== "folder",
  );

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
        <SpaceNavItem
          active={activeView === "content"}
          icon={FileText}
          label="Content"
          onClick={() => onOpenView("content")}
        />
        <SpaceNavItem
          active={activeView === "drafts"}
          icon={SquarePen}
          label="Drafts"
          onClick={() => onOpenView("drafts")}
        />
        <SpaceNavItem
          active={activeView === "reviews"}
          icon={GitPullRequest}
          label="Reviews"
          onClick={() => onOpenView("reviews")}
        />
        <SpaceNavItem active={false} icon={Search} label="Search" onClick={onOpenSearch} />
      </nav>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-sidebar-foreground/50">Pages</span>
          <button
            type="button"
            aria-label="New draft"
            className="grid size-6 place-items-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={onCreateDocument}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="mt-1 min-h-0 space-y-0.5 overflow-y-auto">
          {spaceDocuments.map((document) => {
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
                {document.state === "draft" && (
                  <span className="text-[9px] font-medium text-amber-700 uppercase">Draft</span>
                )}
              </button>
            );
          })}
          {!spaceDocuments.length && (
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
