import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Link } from "react-router";
import { ROUTES } from "@/shared/model";
import { useLoginForm } from "./use-login-form";

export function LoginForm() {
  const { form, isSubmitting, submit } = useLoginForm();
  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <form className="grid gap-4" noValidate onSubmit={submit}>
      <Input
        {...form.register("email")}
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        labelContent="Email"
        hasErrors={Boolean(emailError)}
        messages={emailError}
      />
      <Input
        {...form.register("password")}
        type="password"
        autoComplete="current-password"
        placeholder="Пароль"
        labelContent="Пароль"
        hasErrors={Boolean(passwordError)}
        messages={passwordError}
      />
      <Button className="mt-2 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Входим…" : "Войти"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта? <Link className="font-medium text-foreground hover:underline" to={ROUTES.REGISTRATION}>Зарегистрироваться</Link>
      </p>
    </form>
  );
}
