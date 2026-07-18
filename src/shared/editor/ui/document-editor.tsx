import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { GripVertical, Heading1, Heading2, Heading3, List, ListOrdered, Type } from "lucide-react";
import { cn } from "@/shared/lib/css";
import { parseMarkdownBlock } from "../markdown/markdown-block";
import type { DocumentBlock } from "../model/document-block";
import type { EditorDocument } from "../model/editor-document";
import { blockRegistry } from "../registry/block.registry";

type DocumentEditorProps = Readonly<{
  document: EditorDocument;
  onChange: (document: EditorDocument) => void;
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

export function DocumentEditor({ document, onChange }: DocumentEditorProps) {
  const editorRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const pendingFocusBlockIdRef = useRef<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const shouldFocusTitle = !document.title && document.metadata.revision === 0;

  useEffect(() => {
    if (shouldFocusTitle) titleRef.current?.focus();
  }, [shouldFocusTitle]);

  useEffect(() => {
    const blockId = pendingFocusBlockIdRef.current;
    if (!blockId) return;

    editorRef.current?.querySelector<HTMLElement>(`[data-block-input="${blockId}"]`)?.focus();
    pendingFocusBlockIdRef.current = null;
  }, [document.blocks]);

  const replaceBlock = (nextBlock: DocumentBlock) => {
    let normalizedBlock = nextBlock;
    if (nextBlock.type === "paragraph") {
      const parsedBlock = parseMarkdownBlock(nextBlock.id, nextBlock.content);
      if (parsedBlock.type !== "paragraph") {
        normalizedBlock = parsedBlock;
        pendingFocusBlockIdRef.current = parsedBlock.id;
      }
    }

    onChange({
      ...document,
      metadata: { ...document.metadata, updatedAt: new Date().toISOString() },
      blocks: document.blocks.map((block) =>
        block.id === normalizedBlock.id ? normalizedBlock : block,
      ),
    });
  };

  const insertParagraphAfter = (blockId: string) => {
    const index = document.blocks.findIndex((block) => block.id === blockId);
    if (index < 0) return;

    const paragraph = createParagraphBlock();
    pendingFocusBlockIdRef.current = paragraph.id;
    setSelectedBlockId(paragraph.id);
    onChange({ ...document, blocks: document.blocks.toSpliced(index + 1, 0, paragraph) });
  };

  const applyCommand = (block: DocumentBlock, commandId: BlockCommandId) => {
    if (block.type !== "paragraph") return;

    const nextBlock = createBlockFromCommand(block.id, commandId);
    pendingFocusBlockIdRef.current = nextBlock.id;
    replaceBlock(nextBlock);
  };

  const focusFirstBlock = () => {
    const firstBlock = document.blocks[0];
    if (!firstBlock) return;
    pendingFocusBlockIdRef.current = firstBlock.id;
    setSelectedBlockId(firstBlock.id);
    editorRef.current?.querySelector<HTMLElement>(`[data-block-input="${firstBlock.id}"]`)?.focus();
  };

  return (
    <article ref={editorRef} aria-label="Document editor">
      <header className="mb-14">
        <input
          ref={titleRef}
          aria-label="Document title"
          value={document.title}
          placeholder="Untitled"
          className="w-full bg-transparent text-5xl font-semibold tracking-[-0.045em] outline-none placeholder:text-muted-foreground/30 sm:text-6xl"
          onChange={(event) =>
            onChange({
              ...document,
              title: event.target.value,
              metadata: { ...document.metadata, updatedAt: new Date().toISOString() },
            })
          }
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            focusFirstBlock();
          }}
        />
      </header>

      <div className="space-y-1">
        {document.blocks.map((block) => {
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
              className="group/block relative flex items-start py-1"
              onFocusCapture={() => setSelectedBlockId(block.id)}
              onKeyDownCapture={(event) => {
                handleCommandKeyDown(event, block, commands, applyCommand);
              }}
            >
              {isSelected && slashQuery === null && (
                <div className="absolute bottom-full left-9 z-20 mb-1 flex min-h-10 items-center rounded-xl border border-border bg-popover px-1.5 shadow-popover">
                  <OptionsRenderer
                    block={block}
                    onChange={replaceBlock}
                    onInsertAfter={insertParagraphAfter}
                  />
                </div>
              )}

              <button
                type="button"
                aria-label={`Select ${block.type} block`}
                aria-pressed={isSelected}
                className="mr-1 grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground/30 opacity-0 transition-opacity group-hover/block:opacity-100 hover:bg-muted hover:text-muted-foreground focus:opacity-100"
                onClick={() => setSelectedBlockId(block.id)}
              >
                <GripVertical className="size-4" />
              </button>

              <div className="min-w-0 flex-1 pt-0.5">
                <Renderer
                  block={block}
                  onChange={replaceBlock}
                  onInsertAfter={insertParagraphAfter}
                />
                {isSelected && slashQuery !== null && (
                  <BlockCommandMenu
                    commands={commands}
                    onSelect={(commandId) => applyCommand(block, commandId)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function BlockCommandMenu({
  commands,
  onSelect,
}: {
  commands: readonly BlockCommand[];
  onSelect: (commandId: BlockCommandId) => void;
}) {
  return (
    <div className="relative z-30 mt-2 w-full max-w-sm rounded-2xl border border-border bg-popover p-1.5 shadow-popover">
      <p className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">Basic blocks</p>
      {commands.length ? (
        commands.map((command, index) => {
          const Icon = command.icon;
          return (
            <button
              key={command.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-accent",
                index === 0 && "bg-accent/70",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(command.id)}
            >
              <span className="grid size-8 place-items-center rounded-lg border border-border bg-background">
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">{command.label}</span>
                <span className="block text-xs text-muted-foreground">{command.hint}</span>
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
  applyCommand: (block: DocumentBlock, commandId: BlockCommandId) => void,
) {
  if (block.type !== "paragraph" || !block.content.startsWith("/") || event.key !== "Enter") {
    return;
  }

  const command = commands[0];
  if (!command) return;
  event.preventDefault();
  event.stopPropagation();
  applyCommand(block, command.id);
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
