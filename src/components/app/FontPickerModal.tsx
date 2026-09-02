import { useEffect } from "react";
import { X, Zap } from "lucide-react";
import { FONT_ITEMS, loadGoogleFont } from "@/lib/fonts";

/** "Font Picker" popup modal — shared between Customize and Digital Card controls. */
export default function FontPickerModal({
  title,
  selectedFont,
  onSelect,
  onClose,
}: {
  title: string;
  selectedFont: string;
  onSelect: (font: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    FONT_ITEMS.forEach((f) => loadGoogleFont(f.name));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-lg max-h-[85vh] flex-col rounded-3xl bg-white shadow-soft-lg dark:bg-[#262626] overflow-hidden border border-ink/5 dark:border-white/5"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/5 dark:border-white/5">
          <div className="w-8" />
          <h3 className="font-display text-base font-black text-ink dark:text-white text-center flex-1">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 text-ink/70 transition hover:bg-ink/5 dark:border-white/20 dark:text-white/70 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Font Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-3 no-scrollbar">
          {FONT_ITEMS.map((item) => {
            const isSelected = item.name === selectedFont;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  loadGoogleFont(item.name);
                  onSelect(item.name);
                  onClose();
                }}
                className={`relative flex items-center justify-center rounded-2xl py-4 px-3 text-center transition ${
                  isSelected
                    ? "border-2 border-ink bg-white shadow-sm dark:border-white dark:bg-white/10"
                    : "border-2 border-transparent bg-ink/[0.04] hover:bg-ink/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.1]"
                }`}
              >
                <span
                  style={{ fontFamily: `"${item.name}", sans-serif` }}
                  className="text-sm font-semibold text-ink dark:text-white truncate"
                >
                  {item.name}
                </span>
                {item.pro && (
                  <span className="absolute top-2.5 right-2.5 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-white dark:bg-white/30">
                    <Zap size={10} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
