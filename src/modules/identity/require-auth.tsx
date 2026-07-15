import { Navigate, Outlet, useLocation } from "react-router";
import { ROUTES } from "@/shared/model";
import { useAuthSession } from "./session/use-auth-session.hook";

export function RequireAuth() {
  const auth = useAuthSession();
  const location = useLocation();

  if (auth.status === "unknown") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Проверяем сессию…
      </main>
    );
  }

  if (auth.status === "anonymous") {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
