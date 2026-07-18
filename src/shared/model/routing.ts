import "react-router";

export const ROUTES = {
  HOME: "/",
  ARCHITECTURE: "/architecture",
  BUSINESS_REQUIREMENTS: "/requirements",
  WORKSPACE: "/workspace",
  WORKSPACE_DOCUMENT: "/workspace/documents/:documentId",
  LOGIN: "/login",
  REGISTRATION: "/registration",
  FORBIDDEN: "/forbidden",
} as const;

export function workspaceDocumentPath(documentId: string) {
  return ROUTES.WORKSPACE_DOCUMENT.replace(":documentId", encodeURIComponent(documentId));
}

type PathParams = Record<string, never>;

declare module "react-router" {
  interface Register {
    params: PathParams;
  }
}
