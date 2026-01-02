import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "./button";

const AlertDialog = BaseAlertDialog.Root;
const AlertDialogTrigger = BaseAlertDialog.Trigger;

const AlertDialogContent = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
      <BaseAlertDialog.Popup
        ref={ref}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 z-50 animate-in zoom-in-95 fade-in duration-200 ${className || ""}`}
        {...props}
      >
        {children}
      </BaseAlertDialog.Popup>
    </BaseAlertDialog.Portal>
  )
);
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <BaseAlertDialog.Title
      ref={ref}
      className={`text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100 ${className || ""}`}
      {...props}
    >
      {children}
    </BaseAlertDialog.Title>
  )
);
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <BaseAlertDialog.Description
      ref={ref}
      className={`text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed ${className || ""}`}
      {...props}
    >
      {children}
    </BaseAlertDialog.Description>
  )
);
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "destructive" | "primary" }>(
  ({ className, variant = "primary", ...props }, ref) => (
    <Button ref={ref} variant={variant} className={className} {...props} />
  )
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <BaseAlertDialog.Close ref={ref} render={<Button variant="secondary" className={className} {...props} />} />
  )
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
