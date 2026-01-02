import * as React from "react";
import { Checkbox } from "@base-ui/react/checkbox";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
}

const CheckboxComponent = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, description, error, name, id, checked, defaultChecked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <Checkbox.Root
          ref={ref}
          id={id || name}
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={(val) => {
            if (typeof val === 'boolean') {
              onCheckedChange?.(val);
            }
          }}
          disabled={disabled}
          className="group flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-zinc-900 dark:data-[checked]:bg-zinc-100 data-[checked]:border-zinc-900 dark:data-[checked]:border-zinc-100"
          {...props as any}
        >
          <Checkbox.Indicator className="flex items-center justify-center text-zinc-50 dark:text-zinc-950 group-data-[checked]:animate-in group-data-[checked]:zoom-in-75 group-data-[unchecked]:animate-out group-data-[unchecked]:zoom-out-75">
            <CheckIcon className="w-3.5 h-3.5" />
          </Checkbox.Indicator>
        </Checkbox.Root>

        {(label || description) && (
          <label
            htmlFor={id || name}
            className="flex flex-col gap-0.5 cursor-pointer select-none"
          >
            {label && (
              <span className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {description}
              </span>
            )}
            {error && (
              <span className="text-xs font-medium text-red-500 dark:text-red-400 mt-1">
                {error}
              </span>
            )}
          </label>
        )}
      </div>
    );
  }
);

function CheckIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6L9 17L4 12" />
    </svg>
  );
}

CheckboxComponent.displayName = "Checkbox";

export { CheckboxComponent as Checkbox };
