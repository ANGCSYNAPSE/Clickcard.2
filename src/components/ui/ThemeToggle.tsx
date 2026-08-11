import { Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleTheme } from "@/store/slices/uiSlice";

export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

  const onToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    dispatch(toggleTheme());
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("cc_theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className={`grid h-10 w-10 place-items-center rounded-xl text-ink/70 transition hover:bg-ink/5 dark:text-white/70 dark:hover:bg-white/10 ${className ?? ""}`}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
