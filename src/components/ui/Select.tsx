import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}

/** Custom-styled dropdown — native <select> popups ignore the page's dark
 * theme entirely, so this renders its own panel that always matches. */
export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "",
  className,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Picking "None" (or never picking anything) both map to an empty value —
  // show the blank placeholder rather than the literal "None" label.
  const selected = value ? options.find((o) => o.value === value) : undefined;

  return (
    <div className={cn("w-full", className)} ref={rootRef}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-semibold text-ink/80 dark:text-white/80"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-1 rounded-2xl border-2 border-brand-100 bg-white pl-2.5 pr-1 text-sm font-medium text-ink outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-500/20",
            open && "border-brand-400 ring-4 ring-brand-100 dark:border-brand-400 dark:ring-brand-500/20",
          )}
        >
          <span className={cn("truncate", !selected && "text-ink/35 dark:text-white/30")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            size={14}
            className={cn("shrink-0 text-ink/40 transition-transform dark:text-white/40", open && "rotate-180")}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-64 w-full min-w-max overflow-auto rounded-2xl border-2 border-brand-100 bg-white p-1.5 shadow-lift [-ms-overflow-style:none] [scrollbar-width:none] dark:border-white/10 dark:bg-[#262626] [&::-webkit-scrollbar]:hidden"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value || "none"} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-brand-50 dark:text-white dark:hover:bg-white/10",
                      isSelected && "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200",
                    )}
                  >
                    {opt.label}
                    {isSelected && <Check size={14} className="shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
