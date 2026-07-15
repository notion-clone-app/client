import { Link } from "react-router";
import { ROUTES } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { StatusPage } from "@/shared/ui/status-page";

export function AccessDeniedPage() {
  return (
    <StatusPage
      code="403"
      title="Недостаточно прав"
      description="У вашей учётной записи нет доступа к этой странице. Обратитесь к владельцу рабочего пространства, если это ошибка."
      action={
        <Button asChild>
          <Link to={ROUTES.HOME}>Вернуться на главную</Link>
        </Button>
      }
    />
  );
}
