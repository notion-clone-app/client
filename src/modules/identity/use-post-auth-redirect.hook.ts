import { useLocation } from "react-router";
import { ROUTES } from "@/shared/model";

type RedirectLocation = Readonly<{
  pathname: string;
  search?: string;
  hash?: string;
}>;

type AuthNavigationState = Readonly<{
  from?: RedirectLocation;
}>;

export function usePostAuthRedirect() {
  const location = useLocation();
  const state = location.state as AuthNavigationState | null;
  const from = state?.from;

  if (!from?.pathname.startsWith("/") || from.pathname.startsWith("//")) {
    return ROUTES.WORKSPACE;
  }

  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
}
