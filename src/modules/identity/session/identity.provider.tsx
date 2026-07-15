import { useEffect, type PropsWithChildren } from "react";
import { installIdentityHttpAuth, restoreSession } from "./session-manager";

export function IdentityProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const uninstallHttpAuth = installIdentityHttpAuth();
    void restoreSession();

    return uninstallHttpAuth;
  }, []);

  return children;
}
