import { queryOptions } from "@tanstack/react-query";
import { loadCurrentUser } from "../session/session-manager";

export const currentUserQueryKey = ["identity", "current-user"] as const;

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: currentUserQueryKey,
    queryFn: async () => (await loadCurrentUser()).user,
    staleTime: 60_000,
  });
