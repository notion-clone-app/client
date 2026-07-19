import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Plus,
  Sparkles,
  Type,
} from "lucide-react";
import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";
import { parseMarkdownBlock } from "../markdown/markdown-block";
import type { DocumentBlock } from "../model/document-block";
import { blockRegistry } from "../registry/block.registry";

type BlockEditorProps = Readonly<{
  blocks: readonly DocumentBlock[];
  onChange: (blocks: readonly DocumentBlock[]) => void;
  onNavigateBefore?: () => void;
  renderBlockAside?: (block: DocumentBlock) => ReactNode;
}>;

type BlockCommandId = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "bullet" | "number";

type BlockCommand = Readonly<{
  id: BlockCommandId;
  label: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}>;

const blockCommands: readonly BlockCommand[] = [
  { id: "paragraph", label: "Text", hint: "Plain paragraph", icon: Type },
  { id: "heading-1", label: "Heading 1", hint: "Large section heading", icon: Heading1 },
  { id: "heading-2", label: "Heading 2", hint: "Medium section heading", icon: Heading2 },
  { id: "heading-3", label: "Heading 3", hint: "Small section heading", icon: Heading3 },
  { id: "bullet", label: "Bullet list", hint: "Create a simple list", icon: List },
  { id: "number", label: "Numbered list", hint: "Create an ordered list", icon: ListOrdered },
];

/**
 * Portable block editing surface.
 * Host applications own document identity, title, metadata, persistence and synchronization.
 */
export function BlockEditor({
  blocks,
  onChange,
  onNavigateBefore,
  renderBlockAside,
}: BlockEditorProps) {
  const editorRef = useRef<HTMLElement>(null);
  const pendingFocusBlockIdRef = useRef<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const [aiBlockId, setAiBlockId] = useState<string | null>(null);
  useEffect(() => {
    const blockId = pendingFocusBlockIdRef.current;
    if (!blockId) return;

    editorRef.current?.querySelector<HTMLElement>(`[data-block-input="${blockId}"]`)?.focus();
    pendingFocusBlockIdRef.current = null;
  }, [blocks]);

  const replaceBlock = (nextBlock: DocumentBlock) => {
    let normalizedBlock = nextBlock;
    if (nextBlock.type === "paragraph") {
      const parsedBlock = parseMarkdownBlock(nextBlock.id, nextBlock.content);
      if (parsedBlock.type !== "paragraph") {
        normalizedBlock = parsedBlock;
        pendingFocusBlockIdRef.current = parsedBlock.id;
      }
    }

    onChange(blocks.map((block) => (block.id === normalizedBlock.id ? normalizedBlock : block)));
  };

  const insertParagraphAfter = (blockId: string) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index < 0) return;

    const paragraph = createParagraphBlock();
    pendingFocusBlockIdRef.current = paragraph.id;
    setSelectedBlockId(null);
    onChange(blocks.toSpliced(index + 1, 0, paragraph));
  };

  const appendParagraph = () => {
    const paragraph = createParagraphBlock();
    pendingFocusBlockIdRef.current = paragraph.id;
    setSelectedBlockId(null);
    onChange([...blocks, paragraph]);
  };

  const applyCommand = (block: DocumentBlock, commandId: BlockCommandId) => {
    if (block.type !== "paragraph") return;

    const nextBlock = createBlockFromCommand(block.id, commandId);
    pendingFocusBlockIdRef.current = nextBlock.id;
    setActiveCommandIndex(0);
    replaceBlock(nextBlock);
  };

  const focusBlock = (blockId: string) => {
    editorRef.current?.querySelector<HTMLElement>(`[data-block-input="${blockId}"]`)?.focus();
  };

  const focusAdjacentBlock = (blockId: string, direction: -1 | 1) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    const target = blocks[index + direction];
    if (target) focusBlock(target.id);
    else if (direction === -1) onNavigateBefore?.();
  };

  return (
    <section ref={editorRef} aria-label="Block editor" className="pb-40">
      <div className="space-y-1">
        {blocks.map((block) => {
          const definition = blockRegistry[block.type];
          const Renderer = definition.editableRenderer;
          const OptionsRenderer = definition.optionsRenderer;
          const isSelected = block.id === selectedBlockId;
          const slashQuery =
            block.type === "paragraph" && block.content.startsWith("/")
              ? block.content.slice(1).toLowerCase()
              : null;
          const commands =
            slashQuery === null
              ? []
              : blockCommands.filter((command) =>
                  `${command.label} ${command.hint}`.toLowerCase().includes(slashQuery),
                );

          return (
            <div
              key={block.id}
              data-editor-block={block.id}
              className="group/block relative flex items-start py-1"
              onKeyDownCapture={(event) => {
                if (
                  handleCommandKeyDown(
                    event,
                    block,
                    commands,
                    activeCommandIndex,
                    setActiveCommandIndex,
                    applyCommand,
                  )
                )
                  return;
                handleBlockNavigation(event, block.id, focusAdjacentBlock);
              }}
            >
              {isSelected && slashQuery === null && (
                <div className="absolute bottom-full left-7 z-20 mb-1 flex min-h-9 items-center gap-0.5 rounded-xl border border-border/70 bg-popover/95 px-1 shadow-lg backdrop-blur-xl">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => setAiBlockId(aiBlockId === block.id ? null : block.id)}
                  >
                    <Sparkles /> Ask AI
                  </Button>
                  <span className="mx-0.5 h-5 w-px bg-border" />
                  <OptionsRenderer
                    block={block}
                    onChange={replaceBlock}
                    onInsertAfter={insertParagraphAfter}
                    onTextSelectionChange={() => undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="More block options"
                  >
                    <ChevronDown />
                  </Button>
                </div>
              )}

              {aiBlockId === block.id && (
                <div className="absolute top-full left-7 z-30 mt-2 w-full max-w-md rounded-2xl border border-border bg-popover p-2 shadow-popover">
                  <div className="flex items-center gap-2 rounded-xl bg-muted/70 px-3 py-2.5">
                    <Sparkles className="size-4 text-primary" />
                    <input
                      aria-label="Ask AI about selection"
                      placeholder="Ask AI to edit or explain this selection…"
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <span className="text-[11px] text-muted-foreground">Coming next</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                aria-label={`Select ${block.type} block`}
                aria-pressed={isSelected}
                className="mr-1 grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground/30 opacity-0 transition-opacity group-hover/block:opacity-100 hover:bg-muted hover:text-muted-foreground focus:opacity-100"
                onClick={() => setSelectedBlockId(isSelected ? null : block.id)}
              >
                <GripVertical className="size-4" />
              </button>

              <div className="min-w-0 flex-1 pt-0.5">
                <Renderer
                  block={block}
                  onChange={replaceBlock}
                  onInsertAfter={insertParagraphAfter}
                  onTextSelectionChange={(blockId, hasSelection) => {
                    setSelectedBlockId(hasSelection ? blockId : null);
                    if (!hasSelection) setAiBlockId(null);
                  }}
                />
                {slashQuery !== null && (
                  <BlockCommandMenu
                    commands={commands}
                    activeIndex={activeCommandIndex}
                    onSelect={(commandId) => applyCommand(block, commandId)}
                    onAskAi={() => {
                      if (block.type !== "paragraph") return;
                      setAiBlockId(block.id);
                      replaceBlock({ ...block, content: "" });
                    }}
                  />
                )}
              </div>
              {renderBlockAside?.(block)}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="group/add mt-3 flex w-full items-center gap-2 rounded-lg py-3 pl-7 text-left text-sm text-muted-foreground/35 transition-colors hover:bg-muted/40 hover:text-muted-foreground focus-visible:bg-muted/40 focus-visible:text-muted-foreground focus-visible:outline-none"
        onClick={appendParagraph}
      >
        <Plus className="size-4 opacity-0 transition-opacity group-hover/add:opacity-100 group-focus-visible/add:opacity-100" />
        Click to add a block
      </button>
    </section>
  );
}

function BlockCommandMenu({
  commands,
  activeIndex,
  onSelect,
  onAskAi,
}: {
  commands: readonly BlockCommand[];
  activeIndex: number;
  onSelect: (commandId: BlockCommandId) => void;
  onAskAi: () => void;
}) {
  return (
    <div className="relative z-30 mt-2 w-full max-w-xs rounded-xl border border-border/70 bg-popover p-1 shadow-lg">
      <button
        type="button"
        className="mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-primary hover:bg-accent"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onAskAi}
      >
        <span className="grid size-7 place-items-center rounded-md bg-primary/10">
          <Sparkles className="size-3.5" />
        </span>
        <span className="text-sm font-medium">Ask AI</span>
      </button>
      <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Basic blocks</p>
      {commands.length ? (
        commands.map((command, index) => {
          const Icon = command.icon;
          return (
            <button
              key={command.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-accent",
                index === activeIndex && "bg-accent",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(command.id)}
            >
              <span className="grid size-7 place-items-center rounded-md border border-border/70 bg-background">
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{command.label}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {command.hint}
                </span>
              </span>
            </button>
          );
        })
      ) : (
        <p className="px-2 py-3 text-sm text-muted-foreground">No matching blocks</p>
      )}
    </div>
  );
}

function handleCommandKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  block: DocumentBlock,
  commands: readonly BlockCommand[],
  activeIndex: number,
  setActiveIndex: (index: number) => void,
  applyCommand: (block: DocumentBlock, commandId: BlockCommandId) => void,
) {
  if (block.type !== "paragraph" || !block.content.startsWith("/")) return false;

  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    event.stopPropagation();
    if (commands.length) {
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((activeIndex + direction + commands.length) % commands.length);
    }
    return true;
  }

  if (event.key !== "Enter") return false;
  const command = commands[Math.min(activeIndex, commands.length - 1)];
  if (!command) return false;
  event.preventDefault();
  event.stopPropagation();
  applyCommand(block, command.id);
  return true;
}

function handleBlockNavigation(
  event: KeyboardEvent<HTMLDivElement>,
  blockId: string,
  focusAdjacentBlock: (blockId: string, direction: -1 | 1) => void,
) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;

  const listItemId = target.dataset.listItemId;
  if (listItemId) {
    const list = target.closest("[data-editor-block]");
    const items = [...(list?.querySelectorAll<HTMLElement>("[data-list-item-id]") ?? [])];
    const index = items.indexOf(target);
    const adjacentItem = items[index + (event.key === "ArrowDown" ? 1 : -1)];
    if (adjacentItem) {
      event.preventDefault();
      adjacentItem.focus();
      return;
    }
  }

  event.preventDefault();
  focusAdjacentBlock(blockId, event.key === "ArrowDown" ? 1 : -1);
}

function createParagraphBlock(): DocumentBlock {
  return {
    id: crypto.randomUUID(),
    type: "paragraph",
    options: { bold: false, italic: false },
    content: "",
  };
}

function createBlockFromCommand(id: string, commandId: BlockCommandId): DocumentBlock {
  if (commandId === "paragraph") {
    return { id, type: "paragraph", options: { bold: false, italic: false }, content: "" };
  }
  if (commandId.startsWith("heading-")) {
    const level = Number(commandId.at(-1)) as 1 | 2 | 3;
    return { id, type: "heading", options: { level }, content: "" };
  }

  return {
    id,
    type: "list",
    options: { style: commandId === "bullet" ? "bullet" : "number" },
    items: [{ id: crypto.randomUUID(), content: "" }],
  };
}
