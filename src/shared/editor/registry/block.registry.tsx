import type { ComponentType } from "react";
import type { DocumentBlock } from "../model/document-block";
import {
  EditableHeadingBlock,
  HeadingBlockOptions,
  ReadonlyHeadingBlock,
} from "../ui/blocks/heading-block";
import { EditableListBlock, ListBlockOptions, ReadonlyListBlock } from "../ui/blocks/list-block";
import {
  EditableParagraphBlock,
  ParagraphBlockOptions,
  ReadonlyParagraphBlock,
} from "../ui/blocks/paragraph-block";
import type {
  BlockOptionsRendererProps,
  EditableBlockRendererProps,
  ReadonlyBlockRendererProps,
} from "../ui/block-renderer.types";

type BlockDefinition = Readonly<{
  readonlyRenderer: ComponentType<ReadonlyBlockRendererProps>;
  editableRenderer: ComponentType<EditableBlockRendererProps>;
  optionsRenderer: ComponentType<BlockOptionsRendererProps>;
}>;

/** Maps every serializable block type to both supported UI modes. */
export const blockRegistry: Record<DocumentBlock["type"], BlockDefinition> = {
  heading: {
    readonlyRenderer: ReadonlyHeadingBlock,
    editableRenderer: EditableHeadingBlock,
    optionsRenderer: HeadingBlockOptions,
  },
  paragraph: {
    readonlyRenderer: ReadonlyParagraphBlock,
    editableRenderer: EditableParagraphBlock,
    optionsRenderer: ParagraphBlockOptions,
  },
  list: {
    readonlyRenderer: ReadonlyListBlock,
    editableRenderer: EditableListBlock,
    optionsRenderer: ListBlockOptions,
  },
};
