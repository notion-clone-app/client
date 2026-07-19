export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type ListStyle = "bullet" | "number";

type DocumentBlockBase = Readonly<{
  id: string;
}>;

type HeadingBlockOptions = Readonly<{
  level: HeadingLevel;
}>;

export type HeadingBlock = DocumentBlockBase &
  Readonly<{
    type: "heading";
    options: HeadingBlockOptions;
    content: string;
  }>;

type ParagraphBlockOptions = Readonly<{
  bold: boolean;
  italic: boolean;
}>;

export type ParagraphBlock = DocumentBlockBase &
  Readonly<{
    type: "paragraph";
    options: ParagraphBlockOptions;
    content: string;
  }>;

type ListItem = Readonly<{
  id: string;
  content: string;
}>;

type ListBlockOptions = Readonly<{
  style: ListStyle;
}>;

export type ListBlock = DocumentBlockBase &
  Readonly<{
    type: "list";
    options: ListBlockOptions;
    items: readonly ListItem[];
  }>;

/** Portable, serializable content unit understood by the shared editor registry. */
export type DocumentBlock = HeadingBlock | ParagraphBlock | ListBlock;
