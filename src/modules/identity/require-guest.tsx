import { Navigate, Outlet } from "react-router";
import { ROUTES } from "@/shared/model";
import { useSession } from "./session/use-session.hook";

export function RequireGuest() {
  const session = useSession();

  if (session.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Проверяем сессию…
      </main>
    );
  }

  if (session.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-destructive">
        Не удалось проверить сессию
      </main>
    );
  }

  if (session.data) {
    return <Navigate to={ROUTES.WORKSPACE} replace />;
  }

  return <Outlet />;
}
