import type { ReactNode } from "react";

type StatusPageProps = {
  code: string;
  title: string;
  description: string;
  action: ReactNode;
};

export function StatusPage({ code, title, description, action }: StatusPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-lg text-center" aria-labelledby="status-title">
        <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground">{code}</p>
        <h1 id="status-title" className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex justify-center">{action}</div>
      </section>
    </main>
  );
}
