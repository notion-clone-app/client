import { Navigate, Outlet } from "react-router";
import { ROUTES } from "@/shared/model";
import { useAuthSession } from "./session/use-auth-session.hook";

export function RequireGuest() {
  const auth = useAuthSession();

  if (auth.status === "unknown") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Проверяем сессию…
      </main>
    );
  }

  if (auth.status === "authenticated") {
    return <Navigate to={ROUTES.WORKSPACE} replace />;
  }

  return <Outlet />;
}
