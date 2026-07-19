import type { DocumentBlock } from "../model/document-block";

/** Serializes portable editor blocks without assuming a host document model. */
export function serializeBlocksToMarkdown(blocks: readonly DocumentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "heading") return `${"#".repeat(block.options.level)} ${block.content}`;
      if (block.type === "paragraph") return block.content;

      return block.items
        .map((item, index) =>
          block.options.style === "number" ? `${index + 1}. ${item.content}` : `- ${item.content}`,
        )
        .join("\n");
    })
    .join("\n\n");
}
