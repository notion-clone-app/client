import type { Viewer } from "./viewer.entity";

/**
 * Represents the authenticated browser session returned by the backend.
 * Token values are intentionally absent because they are stored in HttpOnly cookies.
 */
export type Session = Readonly<{
  viewer: Viewer;
  accessExpiresAt: number;
}>;
