import { useEffect, useMemo, useState } from "react";
import type {
  CreateDocumentReviewInput,
  DocumentReview,
} from "../../reviews/model/document-review.entity";
import type {
  WorkspaceApprovalSettings,
  WorkspaceMember,
  WorkspaceMemberRole,
} from "../model/workspace-member.entity";

export type WorkspaceCollaboration = Readonly<{
  members: readonly WorkspaceMember[];
  reviews: readonly DocumentReview[];
  approvalSettings: WorkspaceApprovalSettings;
  inviteMember: (email: string, role: WorkspaceMemberRole) => WorkspaceMember;
  createReview: (input: CreateDocumentReviewInput) => DocumentReview;
  approveReview: (reviewId: string, memberId: string) => void;
  addComment: (reviewId: string, changeId: string, authorId: string, body: string) => void;
  resolveComment: (reviewId: string, changeId: string, commentId: string) => void;
  publishReview: (reviewId: string) => void;
}>;

export type LocalWorkspaceViewer = Readonly<{
  id: string;
  name: string;
  email: string;
}>;

type StoredCollaboration = Readonly<{
  members: readonly WorkspaceMember[];
  reviews: readonly DocumentReview[];
  approvalSettings: WorkspaceApprovalSettings;
}>;

const storageKey = "workspace:collaboration:v1";
const defaultApprovalSettings: WorkspaceApprovalSettings = {
  requiredApprovals: 1,
  authorCanApprove: false,
  requireResolvedComments: true,
};

/**
 * Keeps collaboration state optimistic and persists every accepted transition locally.
 * The storage boundary can later be replaced by an operation-log repository without changing UI.
 */
export function useLocalWorkspaceCollaboration(
  viewer: LocalWorkspaceViewer | null,
): WorkspaceCollaboration {
  const [members, setMembers] = useState<readonly WorkspaceMember[]>(
    () => readCollaboration().members,
  );
  const [reviews, setReviews] = useState<readonly DocumentReview[]>(
    () => readCollaboration().reviews,
  );
  const [approvalSettings] = useState<WorkspaceApprovalSettings>(
    () => readCollaboration().approvalSettings,
  );

  const visibleMembers = useMemo(() => ensureViewer(members, viewer), [members, viewer]);

  useEffect(() => {
    writeCollaboration({ members: visibleMembers, reviews, approvalSettings });
  }, [approvalSettings, reviews, visibleMembers]);

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
      changes: input.changes.map((change) => ({
        ...change,
        id: crypto.randomUUID(),
        comments: [],
      })),
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
        return updateReviewStatus({ ...review, reviewers }, approvalSettings);
      }),
    );
  };

  const resolveComment = (reviewId: string, changeId: string, commentId: string) => {
    setReviews((current) =>
      current.map((review) => {
        if (review.id !== reviewId) return review;
        const changes = review.changes.map((change) =>
          change.id === changeId
            ? {
                ...change,
                comments: change.comments.map((comment) =>
                  comment.id === commentId ? { ...comment, resolved: true } : comment,
                ),
              }
            : change,
        );
        return updateReviewStatus({ ...review, changes }, approvalSettings);
      }),
    );
  };

  const addComment = (reviewId: string, changeId: string, authorId: string, body: string) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              changes: review.changes.map((change) =>
                change.id === changeId
                  ? {
                      ...change,
                      comments: [
                        ...change.comments,
                        {
                          id: crypto.randomUUID(),
                          authorId,
                          body,
                          createdAt: new Date().toISOString(),
                          resolved: false,
                        },
                      ],
                    }
                  : change,
              ),
              status: review.status === "approved" ? ("in-review" as const) : review.status,
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
    members: visibleMembers,
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

function ensureViewer(
  members: readonly WorkspaceMember[],
  viewer: LocalWorkspaceViewer | null,
): readonly WorkspaceMember[] {
  if (!viewer || members.some((member) => member.id === viewer.id)) return members;
  return [
    {
      id: viewer.id,
      name: viewer.name,
      email: viewer.email,
      role: "owner",
      status: "active",
      avatarTone: "amber",
    },
    ...members,
  ];
}

function updateReviewStatus(
  review: DocumentReview,
  settings: WorkspaceApprovalSettings,
): DocumentReview {
  const approvals = review.reviewers.filter((reviewer) => reviewer.status === "approved").length;
  const commentsResolved =
    !settings.requireResolvedComments ||
    review.changes.every((change) => change.comments.every((comment) => comment.resolved));
  return {
    ...review,
    status: approvals >= settings.requiredApprovals && commentsResolved ? "approved" : "in-review",
  };
}

function readCollaboration(): StoredCollaboration {
  try {
    const parsed = JSON.parse(globalThis.localStorage.getItem(storageKey) ?? "null") as unknown;
    if (isStoredCollaboration(parsed)) return parsed;
  } catch {
    // Corrupt local state is treated as empty; no demo collaboration is injected.
  }
  return { members: [], reviews: [], approvalSettings: defaultApprovalSettings };
}

function writeCollaboration(state: StoredCollaboration) {
  try {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error: unknown) {
    console.error("Failed to persist local collaboration", error);
  }
}

function isStoredCollaboration(value: unknown): value is StoredCollaboration {
  return (
    typeof value === "object" &&
    value !== null &&
    "members" in value &&
    Array.isArray(value.members) &&
    "reviews" in value &&
    Array.isArray(value.reviews) &&
    "approvalSettings" in value &&
    typeof value.approvalSettings === "object" &&
    value.approvalSettings !== null
  );
}
