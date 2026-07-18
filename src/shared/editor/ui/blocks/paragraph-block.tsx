import { Bold, Italic } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import type {
  BlockOptionsRendererProps,
  EditableBlockRendererProps,
  ReadonlyBlockRendererProps,
} from "../block-renderer.types";

export function ReadonlyParagraphBlock({ block }: ReadonlyBlockRendererProps) {
  if (block.type !== "paragraph") return null;

  return (
    <p
      data-block-id={block.id}
      className={cn(
        "text-base leading-7 text-foreground/85",
        block.options.bold && "font-semibold",
        block.options.italic && "italic",
      )}
    >
      {block.content || <br />}
    </p>
  );
}

export function EditableParagraphBlock({
  block,
  onChange,
  onInsertAfter,
  onTextSelectionChange,
}: EditableBlockRendererProps) {
  if (block.type !== "paragraph") return null;

  return (
    <textarea
      data-block-input={block.id}
      aria-label="Paragraph"
      value={block.content}
      rows={1}
      placeholder="Write something, or type '/' for commands…"
      className={cn(
        "[field-sizing:content] w-full resize-none overflow-hidden bg-transparent text-base leading-7 text-foreground/85 outline-none placeholder:text-muted-foreground/35",
        block.options.bold && "font-semibold",
        block.options.italic && "italic",
      )}
      onChange={(event) => onChange({ ...block, content: event.target.value })}
      onSelect={(event) =>
        onTextSelectionChange(
          block.id,
          event.currentTarget.selectionStart !== event.currentTarget.selectionEnd,
        )
      }
      onKeyDown={(event) => {
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        onInsertAfter(block.id);
      }}
    />
  );
}

export function ParagraphBlockOptions({ block, onChange }: BlockOptionsRendererProps) {
  if (block.type !== "paragraph") return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant={block.options.bold ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="Bold"
        aria-pressed={block.options.bold}
        onClick={() =>
          onChange({ ...block, options: { ...block.options, bold: !block.options.bold } })
        }
      >
        <Bold />
      </Button>
      <Button
        type="button"
        variant={block.options.italic ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="Italic"
        aria-pressed={block.options.italic}
        onClick={() =>
          onChange({ ...block, options: { ...block.options, italic: !block.options.italic } })
        }
      >
        <Italic />
      </Button>
    </div>
  );
}
