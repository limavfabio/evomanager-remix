import * as React from "react";
import * as Base from "@base-ui/react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  render?: React.ReactElement | ((props: any) => React.ReactElement);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, render, ...props }, ref) => {
    const variants = {
      primary: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm",
      secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 shadow-xs",
      destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500/10 dark:text-red-500 dark:border dark:border-red-500/20 dark:hover:bg-red-500/20",
      ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
      link: "text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100 p-0",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 flex items-center justify-center",
    };

    return (
      <Base.Button
        ref={ref}
        render={render}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center rounded-lg font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 cursor-pointer active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className || ""}`}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
        ) : null}
        {children}
      </Base.Button>
    );
  }
);

Button.displayName = "Button";

export { Button };
