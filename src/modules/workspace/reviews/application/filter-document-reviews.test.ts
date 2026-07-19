import { describe, expect, it } from "vitest";
import type { DocumentReview } from "../model/document-review.entity";
import { filterDocumentReviews, paginateDocumentReviews } from "./filter-document-reviews";

const reviews = [
  createReview("published", "published", "2026-07-18T10:00:00.000Z"),
  createReview("approved", "approved", "2026-07-17T10:00:00.000Z"),
  createReview("recent", "in-review", "2026-07-16T10:00:00.000Z"),
  createReview("old", "in-review", "2026-05-01T10:00:00.000Z"),
] as const;

describe("filterDocumentReviews", () => {
  it("always excludes published reviews and applies status and date filters", () => {
    expect(
      filterDocumentReviews(reviews, {
        spaceId: "space-1",
        status: "in-review",
        date: "30d",
        now: new Date("2026-07-19T10:00:00.000Z"),
      }).map((review) => review.id),
    ).toEqual(["recent"]);
  });

  it("clamps pagination to the available page range", () => {
    expect(paginateDocumentReviews(reviews, 9, 2)).toMatchObject({
      page: 2,
      pageCount: 2,
      items: [expect.objectContaining({ id: "recent" }), expect.objectContaining({ id: "old" })],
    });
  });
});

function createReview(
  id: string,
  status: DocumentReview["status"],
  createdAt: string,
): DocumentReview {
  return {
    id,
    spaceId: "space-1",
    documentId: `document-${id}`,
    documentTitle: id,
    authorId: "author",
    summary: "Summary",
    target: {
      mode: "place-new",
      boardId: "space-1",
      boardTitle: "Space",
      path: "Space",
      placement: "Root",
    },
    status,
    reviewers: [],
    changes: [],
    snapshots: { before: null, after: { title: id, blocks: [] } },
    createdAt,
  };
}
