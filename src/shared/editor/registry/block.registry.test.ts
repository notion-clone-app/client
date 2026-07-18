import { describe, expect, it } from "vitest";
import { blockRegistry } from "@/shared/editor";

describe("blockRegistry", () => {
  it("provides readonly and editable renderers for every supported block", () => {
    expect(Object.keys(blockRegistry)).toEqual(["heading", "paragraph", "list"]);

    for (const definition of Object.values(blockRegistry)) {
      expect(definition.readonlyRenderer).toBeTypeOf("function");
      expect(definition.editableRenderer).toBeTypeOf("function");
      expect(definition.optionsRenderer).toBeTypeOf("function");
    }
  });
});
