import type { HeadingLevel } from "../model/document-block";

export type ParsedMarkdownHeading = Readonly<{
  level: HeadingLevel;
  content: string;
}>;

const markdownHeadingPattern = /^(#{1,6})[\t ]+(.*)$/u;

/** Clamps an arbitrary numeric value to a valid HTML and Markdown heading level. */
export function coerceHeadingLevel(level: number): HeadingLevel {
  if (!Number.isFinite(level)) return 1;
  return Math.min(6, Math.max(1, Math.trunc(level))) as HeadingLevel;
}

/** Parses a single ATX Markdown heading without interpreting inline Markdown. */
export function parseMarkdownHeading(source: string): ParsedMarkdownHeading | null {
  const match = markdownHeadingPattern.exec(source);
  if (!match) return null;

  const markers = match[1];
  const content = match[2];
  if (!markers || content === undefined) return null;

  return {
    level: coerceHeadingLevel(markers.length),
    content: content.trimEnd(),
  };
}
