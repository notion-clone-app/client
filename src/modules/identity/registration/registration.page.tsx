import { Link } from "react-router";
import { ROUTES } from "@/shared/model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { RegistrationForm } from "./registration-form";

const RegistrationPage = () => (
  <main className="grid min-h-screen place-items-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <Link className="mb-6 text-sm font-semibold tracking-tight" to={ROUTES.HOME}>Notion</Link>
        <CardTitle className="text-2xl">Создайте аккаунт</CardTitle>
        <CardDescription>Начните работать в едином пространстве.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegistrationForm />
      </CardContent>
    </Card>
  </main>
);

export const Component = RegistrationPage;
