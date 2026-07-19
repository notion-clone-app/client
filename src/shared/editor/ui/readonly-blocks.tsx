import type { DocumentBlock } from "../model/document-block";
import { blockRegistry } from "../registry/block.registry";

type ReadonlyBlocksProps = Readonly<{
  blocks: readonly DocumentBlock[];
}>;

/** Renders editor blocks without host document metadata or editing behavior. */
export function ReadonlyBlocks({ blocks }: ReadonlyBlocksProps) {
  return (
    <div className="space-y-4" aria-label="Document content">
      {blocks.map(renderBlock)}
    </div>
  );
}

function renderBlock(block: DocumentBlock) {
  const Renderer = blockRegistry[block.type].readonlyRenderer;
  return <Renderer key={block.id} block={block} />;
}
