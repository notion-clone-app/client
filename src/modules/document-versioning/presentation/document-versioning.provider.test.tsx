import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DocumentRevisionRepository } from "../application/document-revision.repository.port";
import type { DocumentRevisionSnapshot } from "../domain/document-revision.entity";
import { DocumentVersioningProvider } from "./document-versioning.provider";
import { useDocumentVersioning } from "./use-document-versioning";

const snapshot: DocumentRevisionSnapshot = {
  schemaVersion: 1,
  title: "Architecture",
  blocks: [],
};

describe("DocumentVersioningProvider", () => {
  it("makes a checkpoint visible before persistence completes", async () => {
    let finishSave: (() => void) | undefined;
    const save = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishSave = resolve;
        }),
    );
    const repository: DocumentRevisionRepository = {
      list: vi.fn().mockResolvedValue([]),
      save,
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DocumentVersioningProvider
        workspaceId="workspace-1"
        authorId="user-1"
        repository={repository}
      >
        {children}
      </DocumentVersioningProvider>
    );
    const { result } = renderHook(useDocumentVersioning, { wrapper });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.createCheckpoint("document-1", snapshot, "manual");
    });

    expect(result.current.getDocumentRevisions("document-1")).toHaveLength(1);
    expect(save).toHaveBeenCalledOnce();
    act(() => finishSave?.());
  });

  it("deduplicates unchanged checkpoints", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const repository: DocumentRevisionRepository = {
      list: vi.fn().mockResolvedValue([]),
      save,
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DocumentVersioningProvider
        workspaceId="workspace-1"
        authorId="user-1"
        repository={repository}
      >
        {children}
      </DocumentVersioningProvider>
    );
    const { result } = renderHook(useDocumentVersioning, { wrapper });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.createCheckpoint("document-1", snapshot);
      result.current.createCheckpoint("document-1", snapshot);
    });

    expect(result.current.getDocumentRevisions("document-1")).toHaveLength(1);
    expect(save).toHaveBeenCalledOnce();
  });

  it("batches working-copy changes into an automatic checkpoint", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const repository: DocumentRevisionRepository = {
      list: vi.fn().mockResolvedValue([]),
      save,
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DocumentVersioningProvider
        workspaceId="workspace-1"
        authorId="user-1"
        repository={repository}
      >
        {children}
      </DocumentVersioningProvider>
    );
    const { result } = renderHook(useDocumentVersioning, { wrapper });
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    vi.useFakeTimers();

    act(() => {
      result.current.scheduleCheckpoint("document-1", snapshot);
      result.current.scheduleCheckpoint("document-1", { ...snapshot, title: "Latest title" });
    });
    await act(() => vi.advanceTimersByTimeAsync(2_000));

    expect(result.current.getDocumentRevisions("document-1")).toHaveLength(1);
    expect(result.current.getDocumentRevisions("document-1")[0]?.snapshot.title).toBe(
      "Latest title",
    );
    expect(save).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
