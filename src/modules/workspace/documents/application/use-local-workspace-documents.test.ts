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
      remove: vi.fn().mockResolvedValue(undefined),
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.createDocument("tech");
    });

    expect(result.current.documents[0]?.title).toBe("Untitled");
    expect(result.current.documents[0]?.spaceId).toBe("tech");
    expect(save).toHaveBeenCalledOnce();

    act(() => {
      finishSave?.();
    });
  });

  it("places a published document under its target board", async () => {
    const repository: WorkspaceDocumentRepository = {
      list: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.placeDocument("product", "engineering"));

    const engineering = findWorkspaceDocument(result.current.documents, "engineering");
    const product = engineering?.children?.find((document) => document.id === "product");
    expect(product).toMatchObject({ state: "published", spaceId: "tech" });
    expect(result.current.documents.some((document) => document.id === "product")).toBe(false);
  });

  it("creates a draft from a published document and publishes it back as a revision", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const repository: WorkspaceDocumentRepository = {
      list: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue(undefined),
      remove,
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    let draftId = "";
    act(() => {
      draftId = result.current.createDraftFromDocument("product-notes")?.id ?? "";
    });
    expect(findWorkspaceDocument(result.current.documents, draftId)).toMatchObject({
      state: "draft",
      sourceDocumentId: "product-notes",
    });

    act(() => result.current.publishDraftToSource(draftId));
    expect(findWorkspaceDocument(result.current.documents, draftId)).toBeNull();
    expect(remove).toHaveBeenCalledWith(draftId);
  });
});
