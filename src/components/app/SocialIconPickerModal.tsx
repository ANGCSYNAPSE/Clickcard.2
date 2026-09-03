import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { ALL_SOCIAL_PLATFORMS } from "@/lib/socialPlatforms";

/** "Add social icon" picker modal — shared between Profile editor and Digital Card details. */
export default function SocialIconPickerModal({
  onBack,
  onClose,
  onPick,
}: {
  onBack: () => void;
  onClose: () => void;
  onPick: (platform: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = ALL_SOCIAL_PLATFORMS.filter((p) =>
    p.platform.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm flex-col rounded-t-3xl bg-white shadow-soft-lg sm:max-h-[80vh] sm:rounded-3xl dark:bg-[#262626]"
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <button
            onClick={onBack}
            aria-label="Back"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-display text-base font-black text-ink dark:text-white">Add social icon</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* search */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-2xl bg-mist px-3.5 py-2.5 dark:bg-white/5">
            <Search size={16} className="text-ink/40 dark:text-white/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink/40 dark:text-white dark:placeholder:text-white/40"
            />
          </div>
        </div>

        {/* list */}
        <div className="no-scrollbar mt-2 flex-1 overflow-y-auto px-2 pb-4">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink/45 dark:text-white/45">
              No platforms match &ldquo;{query}&rdquo;
            </p>
          ) : (
            filtered.map(({ platform, icon: Icon }) => (
              <button
                key={platform}
                type="button"
                onClick={() => onPick(platform)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-mist dark:hover:bg-white/5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
                  <Icon size={17} />
                </span>
                <span className="flex-1 text-sm font-bold text-ink dark:text-white">{platform}</span>
                <ChevronRight size={16} className="text-ink/30 dark:text-white/30" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
