import * as React from "react";
import * as Base from "@base-ui/react";

const ContextMenu = Base.ContextMenu.Root;
const ContextMenuTrigger = Base.ContextMenu.Trigger;

const ContextMenuContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithRef<typeof Base.ContextMenu.Popup>>(
  ({ children, className, ...props }, ref) => (
    <Base.ContextMenu.Portal>
      <Base.ContextMenu.Positioner className="z-50 outline-none">
        <Base.ContextMenu.Popup
          ref={ref}
          className={`min-w-[160px] overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100 dark:border-zinc-800 dark:bg-zinc-950 ${className || ""}`}
          {...props}
        >
          {children}
        </Base.ContextMenu.Popup>
      </Base.ContextMenu.Positioner>
    </Base.ContextMenu.Portal>
  )
);
ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuItemProps extends React.ComponentPropsWithRef<typeof Base.ContextMenu.Item> {
  destructive?: boolean;
}

const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ children, className, destructive, ...props }, ref) => (
    <Base.ContextMenu.Item
      ref={ref}
      className={`relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors
        ${destructive
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}
        ${className || ""}`}
      {...props}
    >
      {children}
    </Base.ContextMenu.Item>
  )
);
ContextMenuItem.displayName = "ContextMenuItem";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
};
