import { useState } from "react";
import type {
  WorkspaceApprovalSettings,
  WorkspaceMember,
  WorkspaceMemberRole,
} from "../model/workspace-member.entity";
import type {
  CreateDocumentReviewInput,
  DocumentReview,
} from "../../reviews/model/document-review.entity";

export type WorkspaceCollaboration = Readonly<{
  members: readonly WorkspaceMember[];
  reviews: readonly DocumentReview[];
  approvalSettings: WorkspaceApprovalSettings;
  inviteMember: (email: string, role: WorkspaceMemberRole) => WorkspaceMember;
  createReview: (input: CreateDocumentReviewInput) => DocumentReview;
  approveReview: (reviewId: string, memberId: string) => void;
  addComment: (reviewId: string, authorId: string, body: string) => void;
  resolveComment: (reviewId: string, commentId: string) => void;
  publishReview: (reviewId: string) => void;
}>;

const initialMembers: readonly WorkspaceMember[] = [
  {
    id: "demo-user",
    name: "Sergey Glotov",
    email: "sergey@example.com",
    role: "owner",
    status: "active",
    avatarTone: "amber",
  },
  {
    id: "member-maya",
    name: "Maya Chen",
    email: "maya@example.com",
    role: "reviewer",
    status: "active",
    avatarTone: "violet",
  },
  {
    id: "member-alex",
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "editor",
    status: "active",
    avatarTone: "blue",
  },
];

const initialReviews: readonly DocumentReview[] = [
  {
    id: "review-product-notes",
    documentId: "product",
    documentTitle: "Product notes",
    authorId: "demo-user",
    summary: "Clarifies the release scope and documents the decisions from the product sync.",
    target: {
      boardId: "engineering",
      boardTitle: "Engineering wiki",
      path: "Product / Release notes",
      placement: "Add as a child page after Roadmap sketch.",
    },
    status: "in-review",
    reviewers: [
      { memberId: "member-maya", status: "approved" },
      { memberId: "member-alex", status: "pending" },
    ],
    comments: [
      {
        id: "comment-1",
        authorId: "member-maya",
        body: "The release scope is clear. Could we link the rollback checklist before publishing?",
        createdAt: "2026-07-18T12:20:00.000Z",
        resolved: false,
      },
    ],
    createdAt: "2026-07-18T11:40:00.000Z",
  },
  {
    id: "review-decisions",
    documentId: "decisions",
    documentTitle: "Architecture decisions",
    authorId: "member-alex",
    summary: "Moves accepted architecture decisions into the shared engineering knowledge base.",
    target: {
      boardId: "engineering",
      boardTitle: "Engineering wiki",
      path: "Engineering / ADR",
      placement: "Publish as the first page in the ADR section.",
    },
    status: "approved",
    reviewers: [{ memberId: "member-maya", status: "approved" }],
    comments: [],
    createdAt: "2026-07-17T09:15:00.000Z",
  },
];

const initialApprovalSettings: WorkspaceApprovalSettings = {
  requiredApprovals: 1,
  authorCanApprove: false,
  requireResolvedComments: true,
};

/**
 * In-memory collaboration adapter used to exercise workspace flows before API integration.
 * Its return shape is suitable for replacement by application services backed by repositories.
 */
export function useMockWorkspaceCollaboration(): WorkspaceCollaboration {
  const [members, setMembers] = useState(initialMembers);
  const [reviews, setReviews] = useState(initialReviews);
  const [approvalSettings] = useState(initialApprovalSettings);

  const inviteMember = (email: string, role: WorkspaceMemberRole) => {
    const member: WorkspaceMember = {
      id: crypto.randomUUID(),
      name: email.split("@").at(0) ?? email,
      email,
      role,
      status: "invited",
      avatarTone: "green",
    };
    setMembers((current) => [...current, member]);
    return member;
  };

  const createReview = (input: CreateDocumentReviewInput) => {
    const review: DocumentReview = {
      id: crypto.randomUUID(),
      ...input,
      status: "in-review",
      reviewers: input.reviewerIds.map((memberId) => ({ memberId, status: "pending" })),
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setReviews((current) => [review, ...current]);
    return review;
  };

  const approveReview = (reviewId: string, memberId: string) => {
    setReviews((current) =>
      current.map((review) => {
        if (review.id !== reviewId) return review;
        const reviewers = review.reviewers.map((reviewer) =>
          reviewer.memberId === memberId ? { ...reviewer, status: "approved" as const } : reviewer,
        );
        const approvals = reviewers.filter((reviewer) => reviewer.status === "approved").length;
        const commentsResolved =
          !approvalSettings.requireResolvedComments ||
          review.comments.every((comment) => comment.resolved);
        return {
          ...review,
          reviewers,
          status:
            approvals >= approvalSettings.requiredApprovals && commentsResolved
              ? "approved"
              : review.status,
        };
      }),
    );
  };

  const resolveComment = (reviewId: string, commentId: string) => {
    setReviews((current) =>
      current.map((review) => {
        if (review.id !== reviewId) return review;
        const comments = review.comments.map((comment) =>
          comment.id === commentId ? { ...comment, resolved: true } : comment,
        );
        const approvals = review.reviewers.filter(
          (reviewer) => reviewer.status === "approved",
        ).length;
        return {
          ...review,
          comments,
          status: approvals >= approvalSettings.requiredApprovals ? "approved" : review.status,
        };
      }),
    );
  };

  const addComment = (reviewId: string, authorId: string, body: string) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              comments: [
                ...review.comments,
                {
                  id: crypto.randomUUID(),
                  authorId,
                  body,
                  createdAt: new Date().toISOString(),
                  resolved: false,
                },
              ],
            }
          : review,
      ),
    );
  };

  const publishReview = (reviewId: string) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId && review.status === "approved"
          ? { ...review, status: "published" }
          : review,
      ),
    );
  };

  return {
    members,
    reviews,
    approvalSettings,
    inviteMember,
    createReview,
    approveReview,
    addComment,
    resolveComment,
    publishReview,
  };
}
