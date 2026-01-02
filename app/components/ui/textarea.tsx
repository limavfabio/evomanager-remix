import * as React from "react";
import * as Base from "@base-ui/react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, name, id, ...props }, ref) => {
    return (
      <Base.Field.Root name={name || ""} className="space-y-2 w-full">
        {label && (
          <Base.Field.Label className="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300">
            {label}
          </Base.Field.Label>
        )}
        <Base.Input
          render={(renderProps) => (
            <textarea
              {...renderProps}
              ref={ref}
              id={id || name}
              className={`flex min-h-[80px] w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 ${error ? "border-red-500 focus-visible:ring-red-500" : ""} ${className || ""}`}
              {...props}
            />
          )}
        />
        {error && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </Base.Field.Root>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
