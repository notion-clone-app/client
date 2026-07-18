import { useEffect, useRef, type ChangeEvent } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { BlockEditor } from "@/shared/editor";
import { Button } from "@/shared/ui/kit/button";
import type { WorkspaceDocumentContent } from "../model/workspace-document-content.entity";

type WorkspaceDocumentEditorProps = Readonly<{
  document: WorkspaceDocumentContent;
  onChange: (document: WorkspaceDocumentContent) => void;
}>;

const mockCover =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='480' viewBox='0 0 1600 480'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%231b3029'/%3E%3Cstop offset='.46' stop-color='%23305645'/%3E%3Cstop offset='1' stop-color='%23c4a36d'/%3E%3C/linearGradient%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.7' numOctaves='3' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .12 0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='1600' height='480' fill='url(%23g)'/%3E%3Crect width='1600' height='480' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E";

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateDocument({ coverImage: mockCover })}
            >
              <ImagePlus /> Add cover
            </Button>
            <Button variant="ghost" size="sm" onClick={() => coverInputRef.current?.click()}>
              <Upload /> Upload
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
