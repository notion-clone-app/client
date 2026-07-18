import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { findWorkspaceDocument } from "../workspace-documents";
import type { WorkspaceDocumentRepository } from "./workspace-document.repository";
import { useLocalWorkspaceDocuments } from "./use-local-workspace-documents";

describe("useLocalWorkspaceDocuments", () => {
  it("publishes a new document before the repository save completes", async () => {
    let finishSave: (() => void) | undefined;
    const save = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    );
    const repository: WorkspaceDocumentRepository = {
      list: vi.fn().mockResolvedValue([]),
      save,
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.createDocument();
    });

    expect(result.current.documents[0]?.title).toBe("Untitled");
    expect(save).toHaveBeenCalledOnce();

    act(() => {
      finishSave?.();
    });
  });

  it("places a published document under its target board", async () => {
    const repository: WorkspaceDocumentRepository = {
      list: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.placeDocument("product", "engineering"));

    const engineering = findWorkspaceDocument(result.current.documents, "engineering");
    expect(engineering?.children?.some((document) => document.id === "product")).toBe(true);
    expect(result.current.documents.some((document) => document.id === "product")).toBe(false);
  });
});
