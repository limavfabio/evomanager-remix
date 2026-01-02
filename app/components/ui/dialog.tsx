import * as React from "react";
import * as Base from "@base-ui/react";

const Dialog = Base.Dialog.Root;
const DialogTrigger = Base.Dialog.Trigger;

const DialogContent = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <Base.Dialog.Portal>
      <Base.Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
      <Base.Dialog.Popup
        ref={ref}
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 z-50 animate-in zoom-in-95 fade-in duration-200 ${className || ""}`}
        {...props}
      >
        {children}
      </Base.Dialog.Popup>
    </Base.Dialog.Portal>
  )
);
DialogContent.displayName = "DialogContent";

const DialogTitle = React.forwardRef<HTMLHeadingElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <Base.Dialog.Title
      ref={ref}
      className={`text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100 ${className || ""}`}
      {...props}
    >
      {children}
    </Base.Dialog.Title>
  )
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLParagraphElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => (
    <Base.Dialog.Description
      ref={ref}
      className={`text-sm text-zinc-500 dark:text-zinc-400 mb-6 ${className || ""}`}
      {...props}
    >
      {children}
    </Base.Dialog.Description>
  )
);
DialogDescription.displayName = "DialogDescription";

const DialogClose = Base.Dialog.Close;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
