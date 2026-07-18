import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalWorkspaceSpaces } from "./use-local-workspace-spaces";

describe("useLocalWorkspaceSpaces", () => {
  beforeEach(() => localStorage.clear());

  it("creates and persists a workspace space", () => {
    const { result } = renderHook(useLocalWorkspaceSpaces);

    act(() => {
      result.current.createSpace("Design");
    });

    expect(result.current.spaces.at(-1)).toMatchObject({ title: "Design" });
    expect(localStorage.getItem("workspace:spaces")).toContain("Design");
  });
});
