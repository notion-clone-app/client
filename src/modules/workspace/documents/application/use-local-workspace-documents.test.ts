import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyWorkspaceDocument } from "../model/create-empty-workspace-document";
import { findWorkspaceDocument } from "../workspace-documents";
import type { WorkspaceDocumentRepository } from "./workspace-document.repository";
import { useLocalWorkspaceDocuments } from "./use-local-workspace-documents";

describe("useLocalWorkspaceDocuments", () => {
  it("creates a new document before the repository save completes", async () => {
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

  it("creates a directly editable published page without review", async () => {
    const repository: WorkspaceDocumentRepository = {
      list: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.createDocument("space-1");
    });

    expect(result.current.documents[0]).toMatchObject({
      state: "published",
      spaceId: "space-1",
    });
  });

  it("migrates a legacy review draft into a regular visible document", async () => {
    const legacyDraft = {
      ...createEmptyWorkspaceDocument({
        id: "legacy-draft",
        workspaceId: "local-workspace",
        spaceId: "space-1",
        authorId: "user-1",
      }),
      state: "draft" as const,
      sourceDocumentId: "old-source",
    };
    const repository: WorkspaceDocumentRepository = {
      list: vi.fn().mockResolvedValue([legacyDraft]),
      save: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    const { result } = renderHook(() => useLocalWorkspaceDocuments("user-1", repository));
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    expect(result.current.documents[0]).toMatchObject({
      id: "legacy-draft",
      state: "published",
      sourceDocumentId: "old-source",
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
});
