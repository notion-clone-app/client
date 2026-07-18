import { describe, expect, it } from "vitest";
import { getDocumentPresentation } from "./document-presentation.strategy";

describe("getDocumentPresentation", () => {
  it.each([
    ["document-board", "Document board"],
    ["draw-board", "Draw board"],
  ] as const)("maps %s to its presentation strategy", (type, label) => {
    const presentation = getDocumentPresentation(type);

    expect(presentation.label).toBe(label);
    expect(presentation.icon).toBeTypeOf("object");
    expect(presentation.iconClassName).toContain("text-");
  });
});
