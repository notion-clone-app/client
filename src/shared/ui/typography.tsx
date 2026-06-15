import { cn } from "@/shared/lib/css"
import type { FC, HTMLAttributes } from "react"

export const TypographyH1: FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => {
    return (
        <h1
            className={cn("text-4xl md:text-5xl lg:text-7xl font-medium tracking-tighter text-foreground", className)}
            {...props}
        />
    )
}

export const TypographyH2: FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => {
    return (
        <h2
            className={cn("text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground", className)}
            {...props}
        />
    )
}

export const TypographyP: FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => {
    return (
        <p
            className={cn("text-base md:text-lg leading-relaxed text-muted-foreground", className)}
            {...props}
        />
    )
}

export const TypographyLead: FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => {
    return (
        <p
            className={cn("text-lg md:text-xl font-normal text-muted-foreground", className)}
            {...props}
        />
    )
}
