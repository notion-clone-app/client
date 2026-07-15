import "react-router";

export const ROUTES = {
  HOME: "/",
  ARCHITECTURE: "/architecture",
  BUSINESS_REQUIREMENTS: "/requirements",
  APP: "/app",
  WORKSPACE: "/workspace",
  LOGIN: "/login",
  REGISTRATION: "/registration",
  FORBIDDEN: "/forbidden",
} as const;

type PathParams = Record<string, never>;

declare module "react-router" {
  interface Register {
    params: PathParams;
  }
}
