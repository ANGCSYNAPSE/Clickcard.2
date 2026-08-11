import { useRef } from "react";
import { cn } from "@/lib/cn";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
}

/** Segmented OTP entry with paste + arrow-key support. */
export default function OtpInput({
  value,
  onChange,
  length = 6,
  error,
  disabled,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").slice(0, length);

  const setAt = (i: number, d: string) => {
    const arr = value.split("");
    arr[i] = d;
    onChange(arr.join("").slice(0, length));
  };

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    setAt(i, d);
    if (d && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3 lg:gap-4" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            "h-13 w-full max-w-[52px] rounded-2xl border-2 bg-white py-3 text-center text-xl font-bold text-ink outline-none transition-all focus:ring-4 dark:bg-white/5 dark:text-white lg:max-w-[64px] lg:py-4 lg:text-2xl",
            error
              ? "border-rose-300 focus:ring-rose-100"
              : "border-brand-100 focus:border-brand-400 focus:ring-brand-100 dark:border-white/10 dark:focus:ring-brand-500/20",
          )}
        />
      ))}
    </div>
  );
}
