import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { SKILL_KEYWORDS } from "@/lib/skills";

/**
 * "Add skill" popup — a text input plus keyword-autocomplete suggestions
 * ("Suggested based on your profile") filtered live against whatever the
 * user is typing, so related keywords surface as they narrow it down.
 */
export default function SkillPickerModal({
  existingSkills,
  onAdd,
  onClose,
}: {
  existingSkills: string[];
  onAdd: (skill: string) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    const pool = SKILL_KEYWORDS.filter(
      (k) => !existingSkills.some((s) => s.toLowerCase() === k.toLowerCase()),
    );
    const matches = q ? pool.filter((k) => k.toLowerCase().includes(q)) : pool;
    return matches.slice(0, 9);
  }, [input, existingSkills]);

  const commit = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!existingSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      onAdd(trimmed);
    }
    setInput("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md flex-col rounded-2xl bg-white shadow-soft-lg dark:bg-[#12403c] border border-ink/5 dark:border-white/5"
      >
        <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4 dark:border-white/5">
          <h3 className="font-display text-base font-black text-ink dark:text-white">Add skill</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <p className="text-xs text-ink/40 dark:text-white/40">* Indicates required</p>
        </div>

        <div className="px-6 pt-3">
          <label className="mb-1.5 block text-xs font-semibold text-ink/70 dark:text-white/70">Skill*</label>
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit(input);
              }
            }}
            placeholder="Type a skill…"
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand-400 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
          />
        </div>

        {suggestions.length > 0 && (
          <div className="mx-6 mt-4 rounded-xl bg-mist p-4 dark:bg-white/[0.03]">
            <p className="mb-3 text-xs font-bold text-ink dark:text-white">Suggested based on your profile</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => commit(s)}
                  className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand-300 hover:text-brand-600 dark:border-white/15 dark:bg-white/[0.04] dark:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              commit(input);
              onClose();
            }}
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
