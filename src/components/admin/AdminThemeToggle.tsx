import { Moon, Sun } from "lucide-react";

interface AdminThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
  className?: string;
}

export default function AdminThemeToggle({
  theme,
  onToggle,
  className = "",
}: AdminThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className={`grid h-10 w-10 place-items-center rounded-lg text-ink/70 transition-all hover:bg-ink/5 dark:text-white/70 dark:hover:bg-white/10 ${className}`}
    >
      {theme === "light" ? (
        <Moon size={18} />
      ) : (
        <Sun size={18} />
      )}
    </button>
  );
}
