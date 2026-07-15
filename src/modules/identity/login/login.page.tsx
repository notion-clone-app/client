import { Link } from "react-router";
import { ROUTES } from "@/shared/model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { LoginForm } from "./login-form";

const LoginPage = () => (
  <main className="grid min-h-screen place-items-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <Link className="mb-6 text-sm font-semibold tracking-tight" to={ROUTES.HOME}>Notion</Link>
        <CardTitle className="text-2xl">Вход в аккаунт</CardTitle>
        <CardDescription>Введите данные, которые использовали при регистрации.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  </main>
);

export const Component = LoginPage;
