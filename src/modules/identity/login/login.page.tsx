import { AuthLayout } from "../auth-layout";
import { LoginForm } from "./login-form";

const LoginPage = () => (
  <AuthLayout title="С возвращением" description="Войдите, чтобы продолжить работу">
    <LoginForm />
  </AuthLayout>
);

export const Component = LoginPage;
