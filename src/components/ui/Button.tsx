import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-500 text-white shadow-soft hover:bg-brand-600",
  secondary:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
  ghost:
    "bg-transparent text-ink/70 hover:bg-ink/5 dark:text-white/70 dark:hover:bg-white/10",
  outline:
    "border-2 border-brand-200 bg-white text-brand-600 hover:border-brand-400 hover:bg-brand-50 dark:bg-transparent dark:border-white/15 dark:text-white dark:hover:bg-white/10",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-full",
  md: "h-11 px-5 text-sm rounded-full",
  lg: "h-13 px-7 text-base rounded-full py-3.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold tracking-tight transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
export default Button;
