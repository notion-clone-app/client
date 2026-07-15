import type { PropsWithChildren } from "react";
import { Link } from "react-router";
import { Logo } from "@/features/landing/logo";
import { ROUTES } from "@/shared/model";

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-background text-foreground">
      <header className="flex h-20 items-center px-6 sm:px-8">
        <Link aria-label="На главную" to={ROUTES.HOME}><Logo /></Link>
      </header>
      <main className="flex items-center justify-center px-5 py-10">
        <section className="w-full max-w-[390px]">
          <div className="mb-8 text-center">
            <h1 className="text-[32px] font-medium leading-tight tracking-[-0.03em]">{title}</h1>
            {description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>}
          </div>
          {children}
        </section>
      </main>
      <footer className="flex flex-wrap items-center justify-center gap-3 px-5 py-7 text-xs text-muted-foreground">
        <a className="hover:text-foreground hover:underline" href="#terms">Условия использования</a>
        <span aria-hidden="true">|</span>
        <a className="hover:text-foreground hover:underline" href="#privacy">Политика конфиденциальности</a>
      </footer>
    </div>
  );
}
