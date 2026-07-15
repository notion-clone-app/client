import { useSyncExternalStore } from "react";
import { authSession } from "./auth-session";

export function useAuthSession() {
  return useSyncExternalStore(authSession.subscribe, authSession.getSnapshot);
}
