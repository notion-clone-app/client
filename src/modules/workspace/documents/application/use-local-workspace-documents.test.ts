import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyWorkspaceDocument } from "../model/create-empty-workspace-document";
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
    const target = {
      ...createEmptyWorkspaceDocument({
        id: "target-folder",
        workspaceId: "local-workspace",
        spaceId: "tech",
        authorId: "user-1",
      }),
      title: "Engineering",
      documentType: "folder" as const,
      state: "published" as const,
    };
    const draft = {
      ...createEmptyWorkspaceDocument({
        id: "local-draft",
        workspaceId: "local-workspace",
        spaceId: "tech",
        authorId: "user-1",
      }),
      title: "Product",
    };
    const repository: WorkspaceDocumentRepository = {
      list: vi.fn().mockResolvedValue([target, draft]),
      save: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => result.current.placeDocument("local-draft", "target-folder"));

    const engineering = findWorkspaceDocument(result.current.documents, "target-folder");
    const product = engineering?.children?.find((document) => document.id === "local-draft");
    expect(product).toMatchObject({ state: "published", spaceId: "tech" });
    expect(result.current.documents.some((document) => document.id === "local-draft")).toBe(false);
  });

  it("creates a draft from a published document and publishes it back as a revision", async () => {
    const source = {
      ...createEmptyWorkspaceDocument({
        id: "published-source",
        workspaceId: "local-workspace",
        spaceId: "tech",
        authorId: "user-1",
      }),
      title: "Product notes",
      state: "published" as const,
    };
    const remove = vi.fn().mockResolvedValue(undefined);
    const repository: WorkspaceDocumentRepository = {
      list: vi.fn().mockResolvedValue([source]),
      save: vi.fn().mockResolvedValue(undefined),
      remove,
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    let draftId = "";
    act(() => {
      draftId = result.current.createDraftFromDocument("published-source")?.id ?? "";
    });
    expect(findWorkspaceDocument(result.current.documents, draftId)).toMatchObject({
      state: "draft",
      sourceDocumentId: "published-source",
    });

    act(() => result.current.publishDraftToSource(draftId));
    expect(findWorkspaceDocument(result.current.documents, draftId)).toBeNull();
    expect(remove).toHaveBeenCalledWith(draftId);
  });
});
