import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalWorkspaceSpaces } from "./use-local-workspace-spaces";

describe("useLocalWorkspaceSpaces", () => {
  beforeEach(() => localStorage.clear());

  it("creates and persists a workspace space", () => {
    const { result } = renderHook(() => useLocalWorkspaceSpaces("user-1"));

    act(() => {
      result.current.createSpace("Design");
    });

    expect(result.current.spaces.at(-1)).toMatchObject({
      title: "Design",
      memberIds: ["user-1"],
    });
    expect(localStorage.getItem("workspace:spaces:v2")).toContain("Design");
  });

  it("updates and persists a space cover", () => {
    const { result } = renderHook(() => useLocalWorkspaceSpaces("user-1"));

    let spaceId = "";
    act(() => {
      spaceId = result.current.createSpace("Tech")?.id ?? "";
    });

    act(() => result.current.updateSpaceCover(spaceId, "data:image/png;base64,cover"));

    expect(result.current.spaces.find((space) => space.id === spaceId)?.coverImage).toContain(
      "base64",
    );
    expect(localStorage.getItem("workspace:spaces:v2")).toContain("coverImage");
  });
});
