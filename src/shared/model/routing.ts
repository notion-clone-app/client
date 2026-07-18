import "react-router";

export const ROUTES = {
  HOME: "/",
  ARCHITECTURE: "/architecture",
  BUSINESS_REQUIREMENTS: "/requirements",
  WORKSPACE: "/workspace",
  WORKSPACE_DOCUMENT: "/workspace/documents/:documentId",
  WORKSPACE_REVIEWS: "/workspace/reviews",
  WORKSPACE_REVIEW_CREATE: "/workspace/reviews/new",
  WORKSPACE_REVIEW: "/workspace/reviews/:reviewId",
  WORKSPACE_SETTINGS: "/workspace/settings",
  LOGIN: "/login",
  REGISTRATION: "/registration",
  FORBIDDEN: "/forbidden",
} as const;

export function workspaceDocumentPath(documentId: string) {
  return ROUTES.WORKSPACE_DOCUMENT.replace(":documentId", encodeURIComponent(documentId));
}

export function workspaceReviewPath(reviewId: string) {
  return ROUTES.WORKSPACE_REVIEW.replace(":reviewId", encodeURIComponent(reviewId));
}

type PathParams = Record<string, never>;

declare module "react-router" {
  interface Register {
    params: PathParams;
  }
}
