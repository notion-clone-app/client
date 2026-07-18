import { useEffect, useRef, type KeyboardEvent } from "react";
import { List, ListOrdered } from "lucide-react";
import { Button } from "@/shared/ui/kit/button";
import type {
  BlockOptionsRendererProps,
  EditableBlockRendererProps,
  ReadonlyBlockRendererProps,
} from "../block-renderer.types";

export function ReadonlyListBlock({ block }: ReadonlyBlockRendererProps) {
  if (block.type !== "list") return null;
  const Element = block.options.style === "number" ? "ol" : "ul";

  return (
    <Element
      data-block-id={block.id}
      className={
        block.options.style === "number"
          ? "list-decimal space-y-2 pl-6"
          : "list-disc space-y-2 pl-6"
      }
    >
      {block.items.map((item) => (
        <li
          key={item.id}
          className="pl-1 text-base leading-7 text-foreground/85 marker:text-muted-foreground"
        >
          {item.content || <br />}
        </li>
      ))}
    </Element>
  );
}

export function EditableListBlock({
  block,
  onChange,
  onTextSelectionChange,
}: EditableBlockRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFocusItemIdRef = useRef<string | null>(null);
  const blockItems = block.type === "list" ? block.items : null;

  useEffect(() => {
    const pendingFocusItemId = pendingFocusItemIdRef.current;
    if (!pendingFocusItemId) return;

    containerRef.current
      ?.querySelector<HTMLInputElement>(`[data-list-item-id="${pendingFocusItemId}"]`)
      ?.focus();
    pendingFocusItemIdRef.current = null;
  }, [blockItems]);

  if (block.type !== "list") return null;

  const updateItem = (itemId: string, content: string) => {
    onChange({
      ...block,
      items: block.items.map((item) => (item.id === itemId ? { ...item, content } : item)),
    });
  };

  const insertItemAfter = (index: number) => {
    const item = { id: crypto.randomUUID(), content: "" };
    pendingFocusItemIdRef.current = item.id;
    onChange({ ...block, items: block.items.toSpliced(index + 1, 0, item) });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    insertItemAfter(index);
  };

  return (
    <div ref={containerRef} className="space-y-1.5">
      {block.items.map((item, index) => (
        <div key={item.id} className="flex items-start gap-2">
          <span className="w-5 shrink-0 pt-1 text-right text-sm leading-7 text-muted-foreground">
            {block.options.style === "number" ? `${index + 1}.` : "•"}
          </span>
          <input
            data-block-input={index === 0 ? block.id : undefined}
            data-list-item-id={item.id}
            aria-label={`List item ${index + 1}`}
            value={item.content}
            placeholder="List item"
            className="h-9 min-w-0 flex-1 bg-transparent text-base text-foreground/85 outline-none placeholder:text-muted-foreground/35"
            onChange={(event) => updateItem(item.id, event.target.value)}
            onSelect={(event) =>
              onTextSelectionChange(
                block.id,
                event.currentTarget.selectionStart !== event.currentTarget.selectionEnd,
              )
            }
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        </div>
      ))}
    </div>
  );
}

export function ListBlockOptions({ block, onChange }: BlockOptionsRendererProps) {
  if (block.type !== "list") return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant={block.options.style === "bullet" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="Bullet list"
        aria-pressed={block.options.style === "bullet"}
        onClick={() => onChange({ ...block, options: { style: "bullet" } })}
      >
        <List />
      </Button>
      <Button
        type="button"
        variant={block.options.style === "number" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="Numbered list"
        aria-pressed={block.options.style === "number"}
        onClick={() => onChange({ ...block, options: { style: "number" } })}
      >
        <ListOrdered />
      </Button>
    </div>
  );
}
