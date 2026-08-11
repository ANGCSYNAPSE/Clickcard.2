import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { dismissToast } from "@/store/slices/uiSlice";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const TINTS = {
  success: "bg-candy-pink",
  error: "bg-rose-500",
  info: "bg-brand-500",
};

export default function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), 4000),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <div className="fixed top-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className="flex items-start gap-3 overflow-hidden rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5 dark:bg-ink dark:ring-white/10"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${TINTS[t.kind]} text-white`}
              >
                <Icon size={18} />
              </span>
              <p className="flex-1 pt-1 text-sm font-medium text-ink dark:text-white">
                {t.message}
              </p>
              <button
                onClick={() => dispatch(dismissToast(t.id))}
                className="text-ink/40 transition hover:text-ink dark:text-white/40"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
