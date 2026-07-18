import type { DocumentBlock } from "../model/document-block";

export type ReadonlyBlockRendererProps = Readonly<{
  block: DocumentBlock;
}>;

export type EditableBlockRendererProps = Readonly<{
  block: DocumentBlock;
  onChange: (block: DocumentBlock) => void;
  onInsertAfter: (blockId: string) => void;
}>;

export type BlockOptionsRendererProps = EditableBlockRendererProps;
