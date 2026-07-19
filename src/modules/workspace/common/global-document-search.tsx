import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Search, X } from "lucide-react";
import type { WorkspaceDocument } from "../documents/model/workspace-document.entity";
import { flattenWorkspaceDocuments } from "../documents/model/workspace-document-tree";
import type { WorkspaceSpace } from "../spaces/model/workspace-space.entity";

type GlobalDocumentSearchProps = Readonly<{
  open: boolean;
  documents: readonly WorkspaceDocument[];
  spaces: readonly WorkspaceSpace[];
  onClose: () => void;
  onSelect: (document: WorkspaceDocument) => void;
}>;

/** Codex-style command palette for workspace-wide document navigation. */
export function GlobalDocumentSearch({
  open,
  documents,
  spaces,
  onClose,
  onSelect,
}: GlobalDocumentSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return flattenWorkspaceDocuments(documents)
      .filter((document) => document.type !== "folder")
      .filter((document) => {
        const space = spaces.find((candidate) => candidate.id === document.spaceId);
        return `${document.title} ${space?.title ?? ""}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      })
      .slice(0, 12);
  }, [documents, query, spaces]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 cursor-default bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Search workspace documents"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-popover"
      >
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <Search className="size-4.5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            aria-label="Search all documents"
            placeholder="Search documents across all spaces"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "Enter" && results[0]) onSelect(results[0]);
            }}
          />
          <button
            type="button"
            aria-label="Close search"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          <p className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
            {query ? "Search results" : "Documents"}
          </p>
          {results.length ? (
            results.map((document) => {
              const space = spaces.find((candidate) => candidate.id === document.spaceId);
              return (
                <button
                  key={document.id}
                  type="button"
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted"
                  onClick={() => onSelect(document)}
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-background text-muted-foreground shadow-sm">
                    <FileText className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{document.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {space?.title ?? "Workspace"}
                    </span>
                  </span>
                  {document.state === "draft" && (
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      Draft
                    </span>
                  )}
                  <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground group-hover:block">
                    ↵
                  </kbd>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              No matching documents
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
