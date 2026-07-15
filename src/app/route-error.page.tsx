import { isRouteErrorResponse, useRouteError } from "react-router";
import { AccessDeniedPage } from "@/modules/identity";
import { Button } from "@/shared/ui/kit/button";
import { StatusPage } from "@/shared/ui/status-page";
import { NotFoundPage } from "./not-found.page";

export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 403) return <AccessDeniedPage />;
    if (error.status === 404) return <NotFoundPage />;
  }

  return (
    <StatusPage
      code="500"
      title="Не удалось открыть страницу"
      description="Произошла непредвиденная ошибка. Обновите страницу или попробуйте ещё раз позже."
      action={<Button onClick={() => window.location.reload()}>Обновить страницу</Button>}
    />
  );
}
