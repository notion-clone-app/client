import { useEffect, useRef, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { BlockEditor } from "@/shared/editor";
import { Button } from "@/shared/ui/kit/button";
import type { WorkspaceDocumentContent } from "../model/workspace-document-content.entity";

type WorkspaceDocumentEditorProps = Readonly<{
  document: WorkspaceDocumentContent;
  onChange: (document: WorkspaceDocumentContent) => void;
}>;

/**
 * Composes the portable block editor with workspace-owned page chrome.
 * Title, cover, audit metadata and persistence remain outside shared editor code.
 */
export function WorkspaceDocumentEditor({ document, onChange }: WorkspaceDocumentEditorProps) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const shouldFocusTitle = !document.title && document.metadata.revision === 0;

  useEffect(() => {
    if (shouldFocusTitle) titleRef.current?.focus();
  }, [shouldFocusTitle]);

  const updateDocument = (patch: Partial<WorkspaceDocumentContent>) => {
    onChange({
      ...document,
      ...patch,
      metadata: { ...document.metadata, updatedAt: new Date().toISOString() },
    });
  };

  const focusFirstBlock = () => {
    rootRef.current?.querySelector<HTMLElement>("[data-block-input]")?.focus();
  };

  const handleCoverUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") updateDocument({ coverImage: reader.result });
    });
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <article ref={rootRef} aria-label="Document editor">
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload document cover"
        onChange={handleCoverUpload}
      />

      {document.coverImage && (
        <div className="group/cover relative h-56 w-full overflow-hidden bg-muted sm:h-72">
          <img src={document.coverImage} alt="" className="size-full object-cover" />
          <div className="absolute right-5 bottom-4 flex gap-1 opacity-0 transition-opacity group-hover/cover:opacity-100 focus-within:opacity-100 sm:right-8">
            <Button variant="secondary" size="sm" onClick={() => coverInputRef.current?.click()}>
              <Upload /> Change
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              aria-label="Remove document cover"
              onClick={() => updateDocument({ coverImage: undefined })}
            >
              <X />
            </Button>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-4xl px-5 pt-9 sm:px-8 md:pt-12">
        {!document.coverImage && (
          <div className="mb-5 flex items-center gap-1 text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 hover:opacity-100 sm:opacity-100">
            <Button variant="ghost" size="sm" onClick={() => coverInputRef.current?.click()}>
              <Upload /> Add cover
            </Button>
          </div>
        )}

        <header className="mb-12">
          <input
            ref={titleRef}
            aria-label="Document title"
            value={document.title}
            placeholder="Untitled"
            className="w-full bg-transparent text-5xl font-semibold tracking-[-0.045em] outline-none placeholder:text-muted-foreground/30 sm:text-6xl"
            onChange={(event) => updateDocument({ title: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "Enter") {
                event.preventDefault();
                focusFirstBlock();
              }
            }}
          />
        </header>

        <BlockEditor
          blocks={document.blocks}
          onChange={(blocks) => updateDocument({ blocks })}
          onNavigateBefore={() => titleRef.current?.focus()}
        />
      </div>
    </article>
  );
}
