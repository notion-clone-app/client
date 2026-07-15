import { Link } from "react-router";
import { ROUTES } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { useRegistrationForm } from "./use-registration-form";

export function RegistrationForm() {
  const { form, formError, isSubmitting, submit } = useRegistrationForm();
  const errors = form.formState.errors;

  return (
    <form className="grid gap-4" noValidate onSubmit={submit}>
      <Input
        {...form.register("name")}
        autoComplete="name"
        placeholder="Ваше имя"
        labelContent="Имя"
        hasErrors={Boolean(errors.name)}
        messages={errors.name?.message}
      />
      <Input
        {...form.register("email")}
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        labelContent="Email"
        hasErrors={Boolean(errors.email)}
        messages={errors.email?.message}
      />
      <Input
        {...form.register("password")}
        type="password"
        autoComplete="new-password"
        placeholder="Минимум 8 символов"
        labelContent="Пароль"
        hasErrors={Boolean(errors.password)}
        messages={errors.password?.message}
      />
      <Input
        {...form.register("passwordConfirmation")}
        type="password"
        autoComplete="new-password"
        placeholder="Повторите пароль"
        labelContent="Повторите пароль"
        hasErrors={Boolean(errors.passwordConfirmation)}
        messages={errors.passwordConfirmation?.message}
      />
      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
      <Button className="mt-2 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт? <Link className="font-medium text-foreground hover:underline" to={ROUTES.LOGIN}>Войти</Link>
      </p>
    </form>
  );
}
