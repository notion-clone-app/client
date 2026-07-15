import { AuthLayout } from "../auth-layout";
import { RegistrationForm } from "./registration-form";

const RegistrationPage = () => (
  <AuthLayout title="Создайте аккаунт" description="Начните работать в едином пространстве">
    <RegistrationForm />
  </AuthLayout>
);

export const Component = RegistrationPage;
