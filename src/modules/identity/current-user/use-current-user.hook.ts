import { useQuery } from "@tanstack/react-query";
import { currentUserQueryOptions } from "./current-user.query";

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions());
}
