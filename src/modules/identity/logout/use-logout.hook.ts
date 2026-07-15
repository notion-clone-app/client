import { useMutation, useQueryClient } from "@tanstack/react-query";
import { currentUserQueryKey } from "../current-user/current-user.query";
import { logoutSession } from "../session/session-manager";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["identity", "logout"],
    mutationFn: logoutSession,
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: currentUserQueryKey });
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
    },
  });
}
