import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "./session.query";

export function useSession() {
  return useQuery(sessionQueryOptions());
}
