export type DocumentReviewStatus = "in-review" | "changes-requested" | "approved" | "published";

type DocumentReviewer = Readonly<{
  memberId: string;
  status: "pending" | "approved" | "changes-requested";
}>;

type DocumentReviewComment = Readonly<{
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  resolved: boolean;
}>;

/** A reviewable delta with its own discussion thread. */
type DocumentReviewChange = Readonly<{
  id: string;
  blockId: string | null;
  kind: "added" | "updated" | "removed";
  label: string;
  before?: string;
  after?: string;
  comments: readonly DocumentReviewComment[];
}>;

type DocumentReviewTarget = Readonly<{
  mode: "place-new" | "replace-source";
  boardId: string;
  boardTitle: string;
  path: string;
  placement: string;
}>;

type DocumentReviewSnapshot = Readonly<{
  title: string;
  blocks: readonly DocumentBlock[];
}>;

/** Immutable, presentation-oriented document state captured when a review is created. */
export type DocumentReviewSnapshots = Readonly<{
  before: DocumentReviewSnapshot | null;
  after: DocumentReviewSnapshot;
}>;

export type CreateDocumentReviewChangeInput = Omit<DocumentReviewChange, "id" | "comments">;

/**
 * Review request that controls when a document may be published to a workspace board.
 * It references an immutable document revision. Discussions are anchored to
 * individual changes so a comment keeps its meaning as the review grows.
 */
export type DocumentReview = Readonly<{
  id: string;
  spaceId: string;
  documentId: string;
  documentTitle: string;
  authorId: string;
  summary: string;
  target: DocumentReviewTarget;
  status: DocumentReviewStatus;
  reviewers: readonly DocumentReviewer[];
  changes: readonly DocumentReviewChange[];
  snapshots: DocumentReviewSnapshots;
  createdAt: string;
}>;

export type CreateDocumentReviewInput = Readonly<{
  spaceId: string;
  documentId: string;
  documentTitle: string;
  authorId: string;
  summary: string;
  target: DocumentReviewTarget;
  reviewerIds: readonly string[];
  changes: readonly CreateDocumentReviewChangeInput[];
  snapshots: DocumentReviewSnapshots;
}>;
import type { DocumentBlock } from "@/shared/editor";
