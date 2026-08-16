"use client";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { WEBAPP_URL } from "@/lib/site";
import { authService } from "@/services/authService";
import { USERNAME_REGEX } from "@/lib/validation";

type Props = { variant?: "light" | "dark" };

const sanitize = (raw: string) => raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

export default function ClaimBar({ variant = "light" }: Props) {
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const onDark = variant === "dark";
  const handle = sanitize(name);
  const taken = available === false;

  /* debounced username availability check — same API the signup page uses */
  useEffect(() => {
    if (!USERNAME_REGEX.test(handle)) {
      setAvailable(null);
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const t = setTimeout(() => {
      authService
        .checkUsername(handle)
        .then(({ data }) => {
          if (!cancelled) setAvailable(Boolean(data?.data?.available));
        })
        .catch((err) => {
          if (!cancelled) setAvailable(null);
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.error("checkUsername failed:", err);
          }
        })
        .finally(() => {
          if (!cancelled) setChecking(false);
        });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [handle]);

  const claim = () => {
    if (!handle || taken || checking) return;
    window.location.href = `${WEBAPP_URL}?username=${encodeURIComponent(handle)}`;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        claim();
      }}
      className={`flex w-full max-w-lg items-center gap-2 rounded-full p-2 min-w-0 ${
        onDark
          ? "border border-white/15 bg-white/10 backdrop-blur"
          : "border border-line bg-white shadow-soft"
      }`}
    >
      <label className="flex min-w-0 flex-1 cursor-text items-center pl-4">
        <span
          className={`shrink-0 text-sm font-semibold sm:text-base ${
            onDark ? "text-white/50" : "text-muted"
          }`}
        >
          clickcard/
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="yourname"
          aria-label="Claim your ClickCard handle"
          className={`min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none sm:text-base ${
            onDark
              ? "text-white placeholder:text-white/35"
              : "text-dark placeholder:text-muted/60"
          }`}
        />
        <span className="ml-2 shrink-0">
          <UsernameStatus checking={checking} available={available} onDark={onDark} />
        </span>
      </label>
      <button
        type="submit"
        disabled={taken}
        className={`btn group shrink-0 px-4 py-3 text-sm sm:px-6 sm:py-3.5 ${
          onDark ? "btn-accent" : "btn-secondary"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        Claim it
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}

function UsernameStatus({
  checking,
  available,
  onDark,
}: {
  checking: boolean;
  available: boolean | null;
  onDark: boolean;
}) {
  if (checking)
    return <Loader2 className={`h-4 w-4 animate-spin ${onDark ? "text-white/50" : "text-ink/40"}`} />;
  if (available === true) return <Check className="h-5 w-5 text-candy-pink" />;
  if (available === false)
    return <span className="whitespace-nowrap text-xs font-bold text-rose-500">already taken</span>;
  return null;
}
