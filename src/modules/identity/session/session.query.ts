import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { getSession } from "./session.api";

export const sessionQueryKey = ["identity", "session"] as const;

/**
 * Defines the canonical client-side representation of authentication state.
 * A successful query containing `null` means the browser has no valid session.
 */
export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: sessionQueryKey,
    queryFn: getSession,
    staleTime: 60_000,
  });

/** Forces a server read after an operation that may have replaced auth cookies. */
export function reloadSession(queryClient: QueryClient) {
  return queryClient.fetchQuery({ ...sessionQueryOptions(), staleTime: 0 });
}
