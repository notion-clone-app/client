import type { JSX } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/kit/dropdown-menu";
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
  onDeleteEmpty,
  onInsertAfter,
  onTextSelectionChange,
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
        onSelect={(event) =>
          onTextSelectionChange(
            block.id,
            event.currentTarget.selectionStart !== event.currentTarget.selectionEnd,
          )
        }
        onKeyDown={(event) => {
          if (
            event.key === "Backspace" &&
            block.content.length === 0 &&
            event.currentTarget.selectionStart === 0 &&
            event.currentTarget.selectionEnd === 0
          ) {
            event.preventDefault();
            onDeleteEmpty(block.id);
            return;
          }

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
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      Level
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Heading level"
            className="flex h-8 min-w-24 items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/20"
          >
            Heading {block.options.level} <ChevronDown className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          {([1, 2, 3, 4, 5, 6] as const).map((level) => (
            <DropdownMenuItem
              key={level}
              onSelect={() => onChange({ ...block, options: { level } })}
            >
              <span className="flex-1">Heading {level}</span>
              {block.options.level === level && <Check />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
