import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutSession } from "../session/session.api";
import { sessionQueryKey } from "../session/session.query";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["identity", "logout"],
    mutationFn: logoutSession,
    onSettled: () => {
      queryClient.setQueryData(sessionQueryKey, null);
    },
  });
}
