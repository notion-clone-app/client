import { useEffect, type PropsWithChildren } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { currentUserQueryKey } from "../current-user/current-user.query";
import { installIdentityHttpAuth, restoreSession } from "./session-manager";

export function IdentityProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const uninstallHttpAuth = installIdentityHttpAuth();
    void restoreSession().then((result) => {
      if (result) queryClient.setQueryData(currentUserQueryKey, result.user);
    });

    return uninstallHttpAuth;
  }, [queryClient]);

  return children;
}
