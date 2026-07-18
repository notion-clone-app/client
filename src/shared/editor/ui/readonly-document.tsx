import type { EditorDocument } from "../model/editor-document";
import type { DocumentBlock } from "../model/document-block";
import { blockRegistry } from "../registry/block.registry";

type ReadonlyDocumentProps = Readonly<{
  document: EditorDocument;
  showMetadata?: boolean;
}>;

export function ReadonlyDocument({ document, showMetadata = false }: ReadonlyDocumentProps) {
  return (
    <article aria-labelledby={`document-${document.id}-title`}>
      <header className="mb-12 border-b border-border/70 pb-8">
        <h1
          id={`document-${document.id}-title`}
          className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl"
        >
          {document.title}
        </h1>
        {showMetadata && (
          <p className="mt-3 text-xs text-muted-foreground">
            Revision {document.metadata.revision} · Updated{" "}
            <time dateTime={document.metadata.updatedAt}>
              {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                new Date(document.metadata.updatedAt),
              )}
            </time>
          </p>
        )}
      </header>

      <div className="space-y-4">{document.blocks.map(renderBlock)}</div>
    </article>
  );
}

function renderBlock(block: DocumentBlock) {
  const Renderer = blockRegistry[block.type].readonlyRenderer;
  return <Renderer key={block.id} block={block} />;
}
