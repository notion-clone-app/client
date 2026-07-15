import { useId, type ComponentProps, type FC, type ReactNode } from "react";
import { cn } from "@/shared/lib/css";

type Props = ComponentProps<"input"> & {
  hasErrors?: boolean;
  messages?: string | string[] | undefined;
  labelContent?: ReactNode;
};

export const Input: FC<Props> = ({
  className,
  type,
  hasErrors,
  messages,
  labelContent: labelNode,
  id: providedId,
  "aria-describedby": describedBy,
  ...props
}) => {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const messageId = `${id}-message`;
  return (
    <>
      {labelNode && (
        <label className={cn({ "text-destructive": hasErrors })} htmlFor={id}>
          {labelNode}
        </label>
      )}
      <input
        id={id}
        type={type}
        data-slot="input"
        aria-invalid={hasErrors ?? undefined}
        aria-errormessage={hasErrors && messages ? messageId : undefined}
        aria-describedby={messages ? messageId : describedBy}
        className={cn(
          "h-9 w-full min-w-0 rounded-xl border border-input bg-card px-3 py-1.5 text-sm text-foreground shadow-input transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground/80 hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
          "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium",

          "autofill:shadow-[inset_0_0_0_1000px_var(--color-card)]", // autofill state background
          "autofill:[-webkit-text-fill-color:var(--color-foreground)]", // autofill text color
          "autofill:transition-[background-color] autofill:duration-[9999s] autofill:delay-0", // freeze autofill state

          { "border-destructive ring-2 ring-destructive/15": hasErrors },
          className,
        )}
        {...props}
      />
      {messages && (
        <div
          id={messageId}
          role={hasErrors ? "alert" : undefined}
          className="mt-1 text-xs text-destructive"
        >
          {messages}
        </div>
      )}
    </>
  );
};

Input.displayName = "Input";
