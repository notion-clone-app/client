import { cn } from "@/shared/lib/css";
import type { FC, HTMLAttributes } from "react";

export const TypographyH1: FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => {
  return (
    <h1
      className={cn(
        "text-4xl font-medium tracking-tighter text-foreground md:text-5xl lg:text-7xl",
        className,
      )}
      {...props}
    />
  );
};

export const TypographyH2: FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => {
  return (
    <h2
      className={cn(
        "text-3xl font-medium tracking-tight text-foreground md:text-4xl lg:text-5xl",
        className,
      )}
      {...props}
    />
  );
};

export const TypographyLead: FC<HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => {
  return (
    <p
      className={cn("text-lg font-normal text-muted-foreground md:text-xl", className)}
      {...props}
    />
  );
};
