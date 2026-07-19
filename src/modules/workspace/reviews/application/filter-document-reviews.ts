import type { DocumentReview, DocumentReviewStatus } from "../model/document-review.entity";

export type ReviewStatusFilter = Exclude<DocumentReviewStatus, "published"> | "all";
export type ReviewDateFilter = "all" | "7d" | "30d" | "90d";

type ReviewFilters = Readonly<{
  spaceId: string;
  status: ReviewStatusFilter;
  date: ReviewDateFilter;
  now?: Date;
}>;

/** Returns active review requests ordered from newest to oldest. */
export function filterDocumentReviews(
  reviews: readonly DocumentReview[],
  { spaceId, status, date, now = new Date() }: ReviewFilters,
) {
  const minimumDate = getMinimumDate(date, now);
  return reviews
    .filter(
      (review) =>
        review.spaceId === spaceId &&
        review.status !== "published" &&
        (status === "all" || review.status === status) &&
        (!minimumDate || new Date(review.createdAt) >= minimumDate),
    )
    .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt));
}

/** Splits a filtered review queue into stable pages and clamps stale URL page values. */
export function paginateDocumentReviews(
  reviews: readonly DocumentReview[],
  requestedPage: number,
  pageSize: number,
) {
  const pageCount = Math.max(1, Math.ceil(reviews.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  return {
    items: reviews.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageCount,
  } as const;
}

function getMinimumDate(filter: ReviewDateFilter, now: Date) {
  if (filter === "all") return null;
  const days = Number.parseInt(filter, 10);
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
