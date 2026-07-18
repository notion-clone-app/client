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

type DocumentReviewTarget = Readonly<{
  boardId: string;
  boardTitle: string;
  path: string;
  placement: string;
}>;

/**
 * Review request that controls when a document may be published to a workspace board.
 * It references document content without embedding portable editor blocks.
 */
export type DocumentReview = Readonly<{
  id: string;
  documentId: string;
  documentTitle: string;
  authorId: string;
  summary: string;
  target: DocumentReviewTarget;
  status: DocumentReviewStatus;
  reviewers: readonly DocumentReviewer[];
  comments: readonly DocumentReviewComment[];
  createdAt: string;
}>;

export type CreateDocumentReviewInput = Readonly<{
  documentId: string;
  documentTitle: string;
  authorId: string;
  summary: string;
  target: DocumentReviewTarget;
  reviewerIds: readonly string[];
}>;
