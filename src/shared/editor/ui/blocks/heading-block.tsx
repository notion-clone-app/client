import type { JSX } from "react";
import { cn } from "@/shared/lib/css";
import type { HeadingBlock as HeadingBlockModel } from "../../model/document-block";
import type {
  BlockOptionsRendererProps,
  EditableBlockRendererProps,
  ReadonlyBlockRendererProps,
} from "../block-renderer.types";

const headingElements: Record<HeadingBlockModel["options"]["level"], keyof JSX.IntrinsicElements> =
  { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" };

const headingStyles = {
  1: "text-4xl font-semibold tracking-[-0.04em]",
  2: "text-3xl font-semibold tracking-[-0.035em]",
  3: "text-2xl font-semibold tracking-[-0.025em]",
  4: "text-xl font-semibold tracking-[-0.02em]",
  5: "text-base font-semibold",
  6: "text-sm font-semibold uppercase tracking-wide",
} satisfies Record<HeadingBlockModel["options"]["level"], string>;

export function ReadonlyHeadingBlock({ block }: ReadonlyBlockRendererProps) {
  if (block.type !== "heading") return null;
  const Element = headingElements[block.options.level];

  return (
    <Element
      data-block-id={block.id}
      className={cn("mt-8 scroll-mt-20 first:mt-0", headingStyles[block.options.level])}
    >
      {block.content || <br />}
    </Element>
  );
}

export function EditableHeadingBlock({
  block,
  onChange,
  onInsertAfter,
}: EditableBlockRendererProps) {
  if (block.type !== "heading") return null;

  return (
    <div className="relative flex items-start">
      <span
        aria-hidden="true"
        className="absolute top-1 right-full mr-3 hidden font-mono text-xs text-muted-foreground/45 lg:block"
      >
        {"#".repeat(block.options.level)}
      </span>
      <textarea
        data-block-input={block.id}
        aria-label={`Heading level ${block.options.level}`}
        value={block.content}
        rows={1}
        placeholder="Heading"
        className={`[field-sizing:content] w-full resize-none overflow-hidden bg-transparent leading-tight outline-none placeholder:text-muted-foreground/35 ${headingStyles[block.options.level]}`}
        onChange={(event) => onChange({ ...block, content: event.target.value })}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          event.preventDefault();
          onInsertAfter(block.id);
        }}
      />
    </div>
  );
}

export function HeadingBlockOptions({ block, onChange }: BlockOptionsRendererProps) {
  if (block.type !== "heading") return null;

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      Level
      <select
        aria-label="Heading level"
        value={block.options.level}
        className="h-8 rounded-lg border border-border bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
        onChange={(event) =>
          onChange({
            ...block,
            options: { level: Number(event.target.value) as HeadingBlockModel["options"]["level"] },
          })
        }
      >
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <option key={level} value={level}>
            Heading {level}
          </option>
        ))}
      </select>
    </label>
  );
}
