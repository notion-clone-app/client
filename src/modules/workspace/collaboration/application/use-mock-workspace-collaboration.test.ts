import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMockWorkspaceCollaboration } from "./use-mock-workspace-collaboration";

describe("useMockWorkspaceCollaboration", () => {
  it("keeps a review blocked until approvals and comments are resolved", () => {
    const { result } = renderHook(useMockWorkspaceCollaboration);
    const reviewId = "review-product-notes";

    act(() => result.current.approveReview(reviewId, "member-alex"));
    expect(result.current.reviews.find((review) => review.id === reviewId)?.status).toBe(
      "in-review",
    );

    act(() => result.current.resolveComment(reviewId, "change-release-scope", "comment-1"));
    expect(result.current.reviews.find((review) => review.id === reviewId)?.status).toBe(
      "approved",
    );

    act(() => result.current.publishReview(reviewId));
    expect(result.current.reviews.find((review) => review.id === reviewId)?.status).toBe(
      "published",
    );
  });

  it("attaches a discussion to a specific change", () => {
    const { result } = renderHook(useMockWorkspaceCollaboration);

    act(() =>
      result.current.addComment(
        "review-product-notes",
        "change-success-metrics",
        "demo-user",
        "Add an owner for this metric.",
      ),
    );

    const review = result.current.reviews.find((item) => item.id === "review-product-notes");
    const change = review?.changes.find((item) => item.id === "change-success-metrics");
    expect(change?.comments.at(-1)?.body).toBe("Add an owner for this metric.");
  });

  it("adds an invited workspace member", () => {
    const { result } = renderHook(useMockWorkspaceCollaboration);

    act(() => {
      result.current.inviteMember("reviewer@company.com", "reviewer");
    });

    expect(result.current.members.at(-1)).toMatchObject({
      email: "reviewer@company.com",
      role: "reviewer",
      status: "invited",
    });
  });
});
