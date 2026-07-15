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
    <form className="grid gap-3" noValidate onSubmit={submit}>
      <Input
        {...form.register("email")}
        type="email"
        autoComplete="email"
        placeholder="Адрес электронной почты"
        aria-label="Адрес электронной почты"
        className="h-[54px] rounded-2xl bg-background px-5 text-base shadow-none"
        hasErrors={Boolean(emailError)}
        messages={emailError}
      />
      <Input
        {...form.register("password")}
        type="password"
        autoComplete="current-password"
        placeholder="Пароль"
        aria-label="Пароль"
        className="h-[54px] rounded-2xl bg-background px-5 text-base shadow-none"
        hasErrors={Boolean(passwordError)}
        messages={passwordError}
      />
      <Button className="mt-1 h-[52px] w-full rounded-2xl text-base" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Входим…" : "Войти"}
      </Button>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Нет аккаунта? <Link className="font-medium text-foreground underline-offset-4 hover:underline" to={ROUTES.REGISTRATION}>Зарегистрироваться</Link>
      </p>
    </form>
  );
}
