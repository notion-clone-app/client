import type { DocumentBlock, ListBlock, ParagraphBlock } from "../model/document-block";
import { parseMarkdownHeading } from "./markdown-heading";

export function parseMarkdownParagraph(id: string, source: string): ParagraphBlock {
  return {
    id,
    type: "paragraph",
    options: { bold: false, italic: false },
    content: source,
  };
}

const bulletListPattern = /^[-*+][\t ]+(.*)$/u;
const numberListPattern = /^\d+[.)][\t ]+(.*)$/u;

export function parseMarkdownList(id: string, source: string): ListBlock | null {
  const bullet = bulletListPattern.exec(source);
  const number = numberListPattern.exec(source);
  const match = bullet ?? number;
  const content = match?.[1];
  if (content === undefined) return null;

  return {
    id,
    type: "list",
    options: { style: bullet ? "bullet" : "number" },
    items: [{ id: `${id}-item-1`, content }],
  };
}

/** Parses one Markdown line into the most specific supported document block. */
export function parseMarkdownBlock(id: string, source: string): DocumentBlock {
  const heading = parseMarkdownHeading(source);
  if (heading) {
    return {
      id,
      type: "heading",
      options: { level: heading.level },
      content: heading.content,
    };
  }

  return parseMarkdownList(id, source) ?? parseMarkdownParagraph(id, source);
}
