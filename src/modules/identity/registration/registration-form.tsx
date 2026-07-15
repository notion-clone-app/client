import { Link } from "react-router";
import { ROUTES } from "@/shared/model";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { useRegistrationForm } from "./use-registration-form";

export function RegistrationForm() {
  const { form, isSubmitting, submit } = useRegistrationForm();
  const errors = form.formState.errors;

  return (
    <form className="grid gap-3" noValidate onSubmit={submit}>
      <Input
        {...form.register("name")}
        autoComplete="name"
        placeholder="Имя"
        aria-label="Имя"
        className="h-[54px] rounded-2xl bg-background px-5 text-base shadow-none"
        hasErrors={Boolean(errors.name)}
        messages={errors.name?.message}
      />
      <Input
        {...form.register("lastName")}
        autoComplete="family-name"
        placeholder="Фамилия"
        aria-label="Фамилия"
        className="h-[54px] rounded-2xl bg-background px-5 text-base shadow-none"
        hasErrors={Boolean(errors.lastName)}
        messages={errors.lastName?.message}
      />
      <Input
        {...form.register("email")}
        type="email"
        autoComplete="email"
        placeholder="Адрес электронной почты"
        aria-label="Адрес электронной почты"
        className="h-[54px] rounded-2xl bg-background px-5 text-base shadow-none"
        hasErrors={Boolean(errors.email)}
        messages={errors.email?.message}
      />
      <Input
        {...form.register("password")}
        type="password"
        autoComplete="new-password"
        placeholder="Пароль"
        aria-label="Пароль"
        className="h-[54px] rounded-2xl bg-background px-5 text-base shadow-none"
        hasErrors={Boolean(errors.password)}
        messages={errors.password?.message}
      />
      <Input
        {...form.register("passwordConfirmation")}
        type="password"
        autoComplete="new-password"
        placeholder="Повторите пароль"
        aria-label="Повторите пароль"
        className="h-[54px] rounded-2xl bg-background px-5 text-base shadow-none"
        hasErrors={Boolean(errors.passwordConfirmation)}
        messages={errors.passwordConfirmation?.message}
      />
      <Button className="mt-1 h-[52px] w-full rounded-2xl text-base" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </Button>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Уже есть аккаунт? <Link className="font-medium text-foreground underline-offset-4 hover:underline" to={ROUTES.LOGIN}>Войти</Link>
      </p>
    </form>
  );
}
