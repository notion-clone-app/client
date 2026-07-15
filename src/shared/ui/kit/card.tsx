import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/css";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section data-slot="card" className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-card", className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<"header">) {
  return <header data-slot="card-header" className={cn("grid gap-1.5 px-6 pt-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 data-slot="card-title" className={cn("text-base font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6 py-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"footer">) {
  return <footer data-slot="card-footer" className={cn("flex items-center border-t border-border px-6 py-4", className)} {...props} />;
}
