import { Link } from "react-router";
import { ROUTES } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { StatusPage } from "@/shared/ui/status-page";

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Страница не найдена"
      description="Возможно, ссылка устарела или страница была перемещена. Вернитесь на главную и продолжите оттуда."
      action={
        <Button asChild>
          <Link to={ROUTES.HOME}>На главную</Link>
        </Button>
      }
    />
  );
}
