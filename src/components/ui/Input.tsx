import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | false;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightSlot, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 dark:text-white/40">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-12 w-full rounded-2xl border-2 bg-white px-4 text-sm font-medium text-ink outline-none transition-all placeholder:text-ink/35 focus:ring-4 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30",
              leftIcon && "pl-11",
              rightSlot && "pr-12",
              error
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500/50 dark:focus:ring-rose-500/20"
                : "border-brand-100 focus:border-brand-400 focus:ring-brand-100 dark:border-white/10 dark:focus:border-brand-400 dark:focus:ring-brand-500/20",
              className,
            )}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightSlot}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-semibold text-rose-500">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink/50 dark:text-white/50">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
export default Input;
