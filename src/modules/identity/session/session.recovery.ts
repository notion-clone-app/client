import type { QueryClient } from "@tanstack/react-query";
import { configureHttpAuth } from "@/shared/api/http-client";
import { refreshSession } from "./session.api";
import { sessionQueryKey } from "./session.query";

let refreshPromise: Promise<boolean> | null = null;

/**
 * Shares a single refresh request between all protected requests that fail with 401.
 * The caller retries each original request at most once after this promise resolves.
 */
function recoverSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = refreshSession()
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Connects identity session recovery to the shared HTTP client at the application composition root.
 * Call this before rendering components that can start protected queries.
 */
export function initializeIdentity(queryClient: QueryClient) {
  return configureHttpAuth({
    recoverUnauthorized: async () => {
      const recovered = await recoverSession();
      if (!recovered) queryClient.setQueryData(sessionQueryKey, null);
      return recovered;
    },
  });
}

export function resetSessionRecovery() {
  refreshPromise = null;
}
