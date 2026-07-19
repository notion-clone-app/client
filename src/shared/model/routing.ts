import "react-router";

export const ROUTES = {
  HOME: "/",
  ARCHITECTURE: "/architecture",
  BUSINESS_REQUIREMENTS: "/requirements",
  WORKSPACE: "/workspace",
  WORKSPACE_DOCUMENT: "/workspace/documents/:documentId",
  WORKSPACE_DOCUMENT_HISTORY: "/workspace/documents/:documentId/history",
  WORKSPACE_SPACE: "/workspace/spaces/:spaceId",
  WORKSPACE_SPACE_REVIEWS: "/workspace/spaces/:spaceId/reviews",
  WORKSPACE_SPACE_REVIEW_CREATE: "/workspace/spaces/:spaceId/reviews/new",
  WORKSPACE_SPACE_REVIEW: "/workspace/spaces/:spaceId/reviews/:reviewId",
  WORKSPACE_SETTINGS: "/workspace/settings",
  LOGIN: "/login",
  REGISTRATION: "/registration",
  FORBIDDEN: "/forbidden",
} as const;

export function workspaceDocumentPath(documentId: string) {
  return ROUTES.WORKSPACE_DOCUMENT.replace(":documentId", encodeURIComponent(documentId));
}

export function workspaceDocumentHistoryPath(documentId: string) {
  return ROUTES.WORKSPACE_DOCUMENT_HISTORY.replace(":documentId", encodeURIComponent(documentId));
}

export function workspaceSpacePath(spaceId: string) {
  return ROUTES.WORKSPACE_SPACE.replace(":spaceId", encodeURIComponent(spaceId));
}

export function workspaceSpaceReviewsPath(spaceId: string) {
  return ROUTES.WORKSPACE_SPACE_REVIEWS.replace(":spaceId", encodeURIComponent(spaceId));
}

export function workspaceSpaceReviewCreatePath(spaceId: string) {
  return ROUTES.WORKSPACE_SPACE_REVIEW_CREATE.replace(":spaceId", encodeURIComponent(spaceId));
}

export function workspaceReviewPath(spaceId: string, reviewId: string) {
  return ROUTES.WORKSPACE_SPACE_REVIEW.replace(":spaceId", encodeURIComponent(spaceId)).replace(
    ":reviewId",
    encodeURIComponent(reviewId),
  );
}

type PathParams = Record<string, never>;

declare module "react-router" {
  interface Register {
    params: PathParams;
  }
}
