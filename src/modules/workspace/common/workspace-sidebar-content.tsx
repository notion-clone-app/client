import type { FC } from "react";
import { ChevronsUpDown, Home, LogOut, Plus, Search, Settings, SquarePen } from "lucide-react";
import { useLogout, type Viewer } from "@/modules/identity";
import { Button } from "@/shared/ui/kit/button";
import { DocumentTree } from "../documents/document-tree";
import type { WorkspaceDocument } from "../documents/workspace-document.entity";

type Props = {
  viewer: Viewer;
  documents: readonly WorkspaceDocument[];
  selectedDocumentId: string | null;
  onSelectDocument: (document: WorkspaceDocument) => void;
  onCreateDocument: () => void;
  onOpenHome: () => void;
};

export const WorkspaceSidebarContent: FC<Props> = ({
  viewer,
  documents,
  selectedDocumentId,
  onSelectDocument,
  onCreateDocument,
  onOpenHome,
}) => {
  const logout = useLogout();
  const initials = `${viewer.firstName.at(0) ?? ""}${viewer.lastName.at(0) ?? ""}`.toUpperCase();

  return (
    <div className="flex min-h-0 w-full flex-col p-2">
      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-xl px-2 text-left text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
      >
        <span className="grid size-7 place-items-center rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
          N
        </span>
        <span className="min-w-0 flex-1 truncate">My workspace</span>
        <ChevronsUpDown className="size-3.5 opacity-50" />
      </button>

      <Button className="mt-2 w-full justify-start" size="sm" onClick={onCreateDocument}>
        <SquarePen />
        New document
      </Button>

      <nav aria-label="Workspace" className="mt-3 space-y-0.5">
        <button
          type="button"
          className={`flex h-8 w-full items-center gap-2 rounded-lg px-2 text-sm transition-colors ${
            selectedDocumentId === null
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70"
          }`}
          onClick={onOpenHome}
        >
          <Home className="size-4" />
          Home
        </button>
        <button
          type="button"
          className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/70"
        >
          <Search className="size-4" />
          Search
          <kbd className="ml-auto rounded border border-sidebar-border bg-background/50 px-1.5 font-sans text-[10px] text-muted-foreground">
            ⌘ K
          </kbd>
        </button>
      </nav>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-sidebar-foreground/50">Documents</span>
          <button
            type="button"
            aria-label="Create document"
            className="grid size-6 place-items-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={onCreateDocument}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto">
          <DocumentTree
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            onSelect={onSelectDocument}
          />
        </div>
      </div>

      <div className="border-sidebar-gray-100 mt-3 border-t pt-2">
        <button
          type="button"
          className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent"
        >
          <Settings className="size-4" />
          Settings
        </button>
        <div className="mt-1 flex items-center gap-2 rounded-xl px-2 py-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {initials || "U"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-sidebar-foreground">
              {viewer.firstName} {viewer.lastName}
            </span>
            <span className="block truncate text-[11px] text-sidebar-foreground/50">
              {viewer.email}
            </span>
          </span>
          <button
            type="button"
            aria-label="Log out"
            className="grid size-7 place-items-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
