import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { CreateDocumentReviewInput } from "../../reviews/model/document-review.entity";
import { useLocalWorkspaceCollaboration } from "./use-local-workspace-collaboration";

const viewer = { id: "user-1", name: "Local Owner", email: "owner@example.com" };

describe("useLocalWorkspaceCollaboration", () => {
  beforeEach(() => localStorage.clear());

  it("starts with the authenticated viewer and no seeded reviews", () => {
    const { result } = renderHook(() => useLocalWorkspaceCollaboration(viewer));

    expect(result.current.members).toEqual([
      expect.objectContaining({ id: viewer.id, role: "owner", status: "active" }),
    ]);
    expect(result.current.reviews).toEqual([]);
  });

  it("persists invited members and created reviews", () => {
    const { result } = renderHook(() => useLocalWorkspaceCollaboration(viewer));
    let reviewerId = "";

    act(() => {
      reviewerId = result.current.inviteMember("reviewer@company.com", "reviewer").id;
    });
    act(() => {
      result.current.createReview(createReviewInput(reviewerId));
    });

    expect(result.current.reviews).toHaveLength(1);
    expect(localStorage.getItem("workspace:collaboration:v1")).toContain("reviewer@company.com");
    expect(localStorage.getItem("workspace:collaboration:v1")).toContain("Document draft");
  });
});

function createReviewInput(reviewerId: string): CreateDocumentReviewInput {
  return {
    spaceId: "space-1",
    documentId: "document-1",
    documentTitle: "Document draft",
    authorId: viewer.id,
    summary: "Ready for review",
    target: {
      mode: "place-new",
      boardId: "space-1",
      boardTitle: "Space",
      path: "Space / Document",
      placement: "Space root",
    },
    reviewerIds: [reviewerId],
    changes: [],
    snapshots: {
      before: null,
      after: { title: "Document draft", blocks: [] },
    },
  };
}
